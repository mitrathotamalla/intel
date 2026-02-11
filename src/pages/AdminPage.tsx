import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Users, BookOpen, Code2, Plus, Trash2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Test form state
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testForm, setTestForm] = useState({
    title: "",
    description: "",
    type: "aptitude" as string,
    difficulty: "easy" as string,
    time_limit: 30,
    questions: "[]",
  });

  // Problem form state
  const [problemDialogOpen, setProblemDialogOpen] = useState(false);
  const [problemForm, setProblemForm] = useState({
    title: "",
    description: "",
    difficulty: "easy" as string,
    topic: "",
    company_tags: "[]",
    solution: "{}",
    test_cases: "[]",
  });

  const fetchData = async () => {
    setLoading(true);
    const [usersRes, testsRes, problemsRes] = await Promise.all([
      supabase.from("profiles").select("*, user_roles(role)"),
      supabase.from("tests").select("*").order("created_at", { ascending: false }),
      supabase.from("coding_problems").select("*").order("created_at", { ascending: false }),
    ]);
    setUsers((usersRes.data as any[]) || []);
    setTests((testsRes.data as any[]) || []);
    setProblems((problemsRes.data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTest = async () => {
    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(testForm.questions);
    } catch {
      toast({ title: "Invalid JSON", description: "Questions must be valid JSON", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("tests").insert({
      title: testForm.title,
      description: testForm.description,
      type: testForm.type,
      difficulty: testForm.difficulty,
      time_limit: testForm.time_limit,
      questions: parsedQuestions,
      created_by: user?.id,
    } as any);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Test created successfully" });
      setTestDialogOpen(false);
      setTestForm({ title: "", description: "", type: "aptitude", difficulty: "easy", time_limit: 30, questions: "[]" });
      fetchData();
    }
  };

  const handleCreateProblem = async () => {
    let parsedTags, parsedSolution, parsedTestCases;
    try {
      parsedTags = JSON.parse(problemForm.company_tags);
      parsedSolution = JSON.parse(problemForm.solution);
      parsedTestCases = JSON.parse(problemForm.test_cases);
    } catch {
      toast({ title: "Invalid JSON", description: "Tags, solution, and test cases must be valid JSON", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("coding_problems").insert({
      title: problemForm.title,
      description: problemForm.description,
      difficulty: problemForm.difficulty,
      topic: problemForm.topic,
      company_tags: parsedTags,
      solution: parsedSolution,
      test_cases: parsedTestCases,
      created_by: user?.id,
    } as any);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Problem created successfully" });
      setProblemDialogOpen(false);
      setProblemForm({ title: "", description: "", difficulty: "easy", topic: "", company_tags: "[]", solution: "{}", test_cases: "[]" });
      fetchData();
    }
  };

  const handleDeleteTest = async (id: string) => {
    const { error } = await supabase.from("tests").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchData();
  };

  const handleDeleteProblem = async (id: string) => {
    const { error } = await supabase.from("coding_problems").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchData();
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "student" : "admin";
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole } as any)
      .eq("user_id", userId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: `Role updated to ${newRole}` });
      fetchData();
    }
  };

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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, tests, and coding problems</p>
        </motion.div>

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Users, label: "Total Users", value: users.length, gradient: "gradient-primary" },
            { icon: BookOpen, label: "Total Tests", value: tests.length, gradient: "gradient-accent" },
            { icon: Code2, label: "Total Problems", value: problems.length, gradient: "gradient-amber" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.gradient}`}>
                <stat.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger value="problems">Problems</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4">
            <div className="rounded-2xl border border-border bg-card">
              <div className="hidden border-b border-border px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:grid md:grid-cols-12 md:gap-4">
                <div className="col-span-3">Name</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Department</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-2">Actions</div>
              </div>
              {users.map((u: any) => {
                const userRole = u.user_roles?.[0]?.role || "student";
                return (
                  <div key={u.id} className="border-b border-border px-6 py-4 last:border-0 md:grid md:grid-cols-12 md:items-center md:gap-4">
                    <div className="col-span-3 text-sm font-medium text-foreground">{u.name || "—"}</div>
                    <div className="col-span-3 text-sm text-muted-foreground">{u.email}</div>
                    <div className="col-span-2 text-sm text-muted-foreground">{u.department || "—"}</div>
                    <div className="col-span-2">
                      <Badge variant={userRole === "admin" ? "default" : "secondary"}>
                        {userRole}
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleRole(u.user_id, userRole)}
                        className="gap-1"
                      >
                        <Shield className="h-3 w-3" />
                        {userRole === "admin" ? "Make Student" : "Make Admin"}
                      </Button>
                    </div>
                  </div>
                );
              })}
              {users.length === 0 && (
                <div className="px-6 py-8 text-center text-muted-foreground">No users found</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tests" className="mt-4 space-y-4">
            <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary border-0 text-primary-foreground gap-2">
                  <Plus className="h-4 w-4" /> Create Test
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Test</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input value={testForm.title} onChange={(e) => setTestForm({ ...testForm, title: e.target.value })} />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={testForm.description} onChange={(e) => setTestForm({ ...testForm, description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Type</Label>
                      <Select value={testForm.type} onValueChange={(v) => setTestForm({ ...testForm, type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aptitude">Aptitude</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="verbal">Verbal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Difficulty</Label>
                      <Select value={testForm.difficulty} onValueChange={(v) => setTestForm({ ...testForm, difficulty: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Time Limit (minutes)</Label>
                    <Input type="number" value={testForm.time_limit} onChange={(e) => setTestForm({ ...testForm, time_limit: parseInt(e.target.value) || 30 })} />
                  </div>
                  <div>
                    <Label>Questions (JSON)</Label>
                    <Textarea
                      rows={6}
                      value={testForm.questions}
                      onChange={(e) => setTestForm({ ...testForm, questions: e.target.value })}
                      placeholder='[{"question": "What is 2+2?", "options": ["3","4","5","6"], "answer": 1}]'
                      className="font-mono text-xs"
                    />
                  </div>
                  <Button onClick={handleCreateTest} className="w-full gradient-primary border-0 text-primary-foreground">
                    Create Test
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="rounded-2xl border border-border bg-card">
              {tests.map((test: any) => (
                <div key={test.id} className="flex items-center justify-between border-b border-border px-6 py-4 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-foreground">{test.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{test.type}</Badge>
                      <Badge variant="outline">{test.difficulty}</Badge>
                      <span className="text-xs text-muted-foreground">{test.time_limit} min</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteTest(test.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {tests.length === 0 && (
                <div className="px-6 py-8 text-center text-muted-foreground">No tests created yet</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="problems" className="mt-4 space-y-4">
            <Dialog open={problemDialogOpen} onOpenChange={setProblemDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary border-0 text-primary-foreground gap-2">
                  <Plus className="h-4 w-4" /> Create Problem
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Coding Problem</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input value={problemForm.title} onChange={(e) => setProblemForm({ ...problemForm, title: e.target.value })} />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea rows={4} value={problemForm.description} onChange={(e) => setProblemForm({ ...problemForm, description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Difficulty</Label>
                      <Select value={problemForm.difficulty} onValueChange={(v) => setProblemForm({ ...problemForm, difficulty: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Topic</Label>
                      <Input value={problemForm.topic} onChange={(e) => setProblemForm({ ...problemForm, topic: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label>Company Tags (JSON array)</Label>
                    <Input value={problemForm.company_tags} onChange={(e) => setProblemForm({ ...problemForm, company_tags: e.target.value })} placeholder='["Google", "Amazon"]' />
                  </div>
                  <div>
                    <Label>Test Cases (JSON)</Label>
                    <Textarea
                      rows={4}
                      value={problemForm.test_cases}
                      onChange={(e) => setProblemForm({ ...problemForm, test_cases: e.target.value })}
                      placeholder='[{"input": "[2,7,11,15], 9", "output": "[0,1]"}]'
                      className="font-mono text-xs"
                    />
                  </div>
                  <Button onClick={handleCreateProblem} className="w-full gradient-primary border-0 text-primary-foreground">
                    Create Problem
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="rounded-2xl border border-border bg-card">
              {problems.map((problem: any) => (
                <div key={problem.id} className="flex items-center justify-between border-b border-border px-6 py-4 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-foreground">{problem.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{problem.difficulty}</Badge>
                      <span className="text-xs text-muted-foreground">{problem.topic}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteProblem(problem.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {problems.length === 0 && (
                <div className="px-6 py-8 text-center text-muted-foreground">No problems created yet</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminPage;
