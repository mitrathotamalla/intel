
-- Community posts
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  upvotes INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Auth users can create posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.community_posts FOR DELETE USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Post comments
CREATE TABLE public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Auth users can create comments" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.post_comments FOR DELETE USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Post votes
CREATE TABLE public.post_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);
ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view votes" ON public.post_votes FOR SELECT USING (true);
CREATE POLICY "Auth users can vote" ON public.post_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own vote" ON public.post_votes FOR DELETE USING (auth.uid() = user_id);

-- Speech sessions
CREATE TABLE public.speech_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question TEXT NOT NULL,
  transcript TEXT DEFAULT '',
  fluency_score INTEGER DEFAULT 0,
  grammar_score INTEGER DEFAULT 0,
  confidence_score INTEGER DEFAULT 0,
  wpm INTEGER DEFAULT 0,
  filler_count INTEGER DEFAULT 0,
  ai_feedback TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.speech_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON public.speech_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create sessions" ON public.speech_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
