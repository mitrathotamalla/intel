import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MessageSquare, ThumbsUp, Users, Search, Plus, Eye, MessageCircle, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  upvotes: number;
  views: number;
  created_at: string;
  author_name?: string;
  author_dept?: string;
  comment_count?: number;
  user_voted?: boolean;
}

const CommunityPage = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  const fetchPosts = async () => {
    const { data: postsData } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!postsData) {
      setLoading(false);
      return;
    }

    const userIds = [...new Set(postsData.map((p: any) => p.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, name, department")
      .in("user_id", userIds);

    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

    // Get comment counts
    const { data: commentCounts } = await supabase
      .from("post_comments")
      .select("post_id");

    const countMap = new Map<string, number>();
    (commentCounts || []).forEach((c: any) => {
      countMap.set(c.post_id, (countMap.get(c.post_id) || 0) + 1);
    });

    // Get user votes
    let userVotes = new Set<string>();
    if (user) {
      const { data: votes } = await supabase
        .from("post_votes")
        .select("post_id")
        .eq("user_id", user.id);
      userVotes = new Set((votes || []).map((v: any) => v.post_id));
    }

    const enriched = postsData.map((p: any) => {
      const prof = profileMap.get(p.user_id);
      return {
        ...p,
        tags: Array.isArray(p.tags) ? p.tags : [],
        author_name: prof?.name || "Anonymous",
        author_dept: prof?.department || "",
        comment_count: countMap.get(p.id) || 0,
        user_voted: userVotes.has(p.id),
      };
    });

    setPosts(enriched);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const handleCreatePost = async () => {
    if (!user || !newTitle.trim()) return;
    const tags = newTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const { error } = await supabase.from("community_posts").insert({
      user_id: user.id,
      title: newTitle,
      content: newContent,
      tags,
    } as any);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Post created!" });
      setCreateOpen(false);
      setNewTitle("");
      setNewContent("");
      setNewTags("");
      fetchPosts();
    }
  };

  const handleVote = async (post: Post) => {
    if (!user) return;
    if (post.user_voted) {
      await supabase.from("post_votes").delete().eq("post_id", post.id).eq("user_id", user.id);
      await supabase.from("community_posts").update({ upvotes: Math.max(0, post.upvotes - 1) } as any).eq("id", post.id);
    } else {
      await supabase.from("post_votes").insert({ post_id: post.id, user_id: user.id } as any);
      await supabase.from("community_posts").update({ upvotes: post.upvotes + 1 } as any).eq("id", post.id);
    }
    fetchPosts();
  };

  const openPost = async (post: Post) => {
    setSelectedPost(post);
    // Increment views
    await supabase.from("community_posts").update({ views: post.views + 1 } as any).eq("id", post.id);

    const { data } = await supabase
      .from("post_comments")
      .select("*")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });

    if (data) {
      const userIds = [...new Set(data.map((c: any) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name")
        .in("user_id", userIds);
      const pMap = new Map((profiles || []).map((p: any) => [p.user_id, p.name]));
      setComments(data.map((c: any) => ({ ...c, author_name: pMap.get(c.user_id) || "Anonymous" })));
    }
  };

  const handleComment = async () => {
    if (!user || !selectedPost || !newComment.trim()) return;
    const { error } = await supabase.from("post_comments").insert({
      post_id: selectedPost.id,
      user_id: user.id,
      content: newComment,
    } as any);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setNewComment("");
      openPost(selectedPost);
      fetchPosts();
    }
  };

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Community</h1>
            <p className="text-muted-foreground">Discuss, share, and learn from campus peers</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground gap-2">
                <Plus className="h-4 w-4" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Discussion</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="What's on your mind?" />
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Share your thoughts..." rows={4} />
                </div>
                <div>
                  <Label>Tags (comma-separated)</Label>
                  <Input value={newTags} onChange={(e) => setNewTags(e.target.value)} placeholder="DSA, Interview, Tips" />
                </div>
                <Button onClick={handleCreatePost} className="w-full gradient-primary border-0 text-primary-foreground">
                  Post
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search discussions..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {/* Discussions */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold text-foreground">No discussions yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Be the first to start a discussion!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => openPost(post)}
                className="group cursor-pointer rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="mb-2 text-base font-semibold text-foreground group-hover:text-primary">
                      {post.title}
                    </h3>
                    {post.content && (
                      <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                    )}
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {post.author_name} {post.author_dept ? `• ${post.author_dept}` : ""}
                      </span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 text-sm text-muted-foreground">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleVote(post); }}
                      className={`flex items-center gap-1 ${post.user_voted ? "text-primary font-semibold" : ""}`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      {post.upvotes}
                    </button>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5" />
                      {post.comment_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {post.views}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Post Detail Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedPost && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">{selectedPost.title}</h2>
                <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{selectedPost.author_name}</span>
                  <span>{new Date(selectedPost.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              {selectedPost.content && (
                <p className="text-foreground whitespace-pre-wrap">{selectedPost.content}</p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {selectedPost.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  Comments ({comments.length})
                </h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {comments.map((c: any) => (
                    <div key={c.id} className="rounded-xl bg-muted/50 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{c.author_name}</span>
                        <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{c.content}</p>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-sm text-muted-foreground">No comments yet.</p>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    onKeyDown={(e) => e.key === "Enter" && handleComment()}
                  />
                  <Button size="sm" onClick={handleComment} className="gradient-primary border-0 text-primary-foreground">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CommunityPage;
