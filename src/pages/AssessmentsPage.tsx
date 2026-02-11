import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, BarChart3, Play, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import TestTakingModal from "@/components/TestTakingModal";

interface Question {
  question: string;
  options: string[];
  answer: number;
}

interface Test {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  time_limit: number;
  questions: Question[];
  description: string;
}

const AssessmentsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeType, setActiveType] = useState<string | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [completedMap, setCompletedMap] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  // Test taking state
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);

  const fetchData = async () => {
    const [testsRes, attemptsRes] = await Promise.all([
      supabase.from("tests").select("*").order("created_at", { ascending: false }),
      user
        ? supabase
            .from("test_attempts")
            .select("test_id, score, completed_at")
            .eq("user_id", user.id)
            .not("completed_at", "is", null)
        : Promise.resolve({ data: [] }),
    ]);

    const testList = (testsRes.data || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      type: t.type,
      difficulty: t.difficulty,
      time_limit: t.time_limit,
      questions: Array.isArray(t.questions) ? t.questions : [],
      description: t.description || "",
    }));
    setTests(testList);

    const cMap = new Map<string, number>();
    ((attemptsRes as any).data || []).forEach((a: any) => {
      const existing = cMap.get(a.test_id);
      if (!existing || a.score > existing) {
        cMap.set(a.test_id, a.score);
      }
    });
    setCompletedMap(cMap);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const filtered = tests.filter((t) => !activeType || t.type === activeType);
  const completedCount = tests.filter((t) => completedMap.has(t.id)).length;

  const handleStartTest = async (test: Test) => {
    if (!user) return;
    if (test.questions.length === 0) {
      toast({ title: "No questions", description: "This test has no questions yet.", variant: "destructive" });
      return;
    }

    const { data, error } = await supabase
      .from("test_attempts")
      .insert({
        user_id: user.id,
        test_id: test.id,
        total_questions: test.questions.length,
      } as any)
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setActiveTest(test);
    setActiveAttemptId((data as any).id);
  };

  const handleTestClose = () => {
    setActiveTest(null);
    setActiveAttemptId(null);
    fetchData();
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

  const avgScore = completedMap.size > 0
    ? Math.round(Array.from(completedMap.values()).reduce((a, b) => a + b, 0) / completedMap.size)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground">Assessments</h1>
          <p className="text-muted-foreground">{completedCount} of {tests.length} tests completed</p>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Avg Score", value: `${avgScore}%`, icon: BarChart3, gradient: "gradient-primary" },
            { label: "Tests Taken", value: completedCount.toString(), icon: CheckCircle2, gradient: "gradient-accent" },
            { label: "Available", value: tests.length.toString(), icon: Clock, gradient: "gradient-amber" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.gradient}`}>
                <stat.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {[
            { key: null, label: "All" },
            { key: "aptitude", label: "Aptitude" },
            { key: "technical", label: "Technical" },
            { key: "verbal", label: "Verbal" },
          ].map((filter) => (
            <Button
              key={filter.label}
              size="sm"
              variant={activeType === filter.key ? "default" : "outline"}
              onClick={() => setActiveType(filter.key)}
              className={activeType === filter.key ? "gradient-primary border-0 text-primary-foreground" : ""}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Test Cards */}
        {tests.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold text-foreground">No tests available</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Tests will appear here once an admin creates them.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((test, i) => {
              const isCompleted = completedMap.has(test.id);
              const score = completedMap.get(test.id);
              return (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <Badge
                      variant="secondary"
                      className={
                        test.type === "aptitude"
                          ? "bg-primary/10 text-primary"
                          : test.type === "technical"
                          ? "bg-accent/10 text-accent"
                          : "bg-amber/10 text-amber"
                      }
                    >
                      {test.type}
                    </Badge>
                    {isCompleted && (
                      <div className="flex items-center gap-1 text-accent">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-semibold">{score}%</span>
                      </div>
                    )}
                  </div>

                  <h3 className="mb-3 text-base font-semibold text-foreground">{test.title}</h3>

                  <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {test.questions.length} Qs
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {test.time_limit} min
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        test.difficulty === "easy"
                          ? "bg-accent/10 text-accent"
                          : test.difficulty === "medium"
                          ? "bg-amber/10 text-amber"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleStartTest(test)}
                      className={isCompleted ? "gradient-accent border-0 text-accent-foreground" : "gradient-primary border-0 text-primary-foreground"}
                    >
                      <Play className="mr-1 h-3.5 w-3.5" />
                      {isCompleted ? "Retake" : "Start"}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Test Taking Modal */}
      {activeTest && activeAttemptId && user && (
        <TestTakingModal
          open={true}
          onClose={handleTestClose}
          test={activeTest}
          attemptId={activeAttemptId}
          userId={user.id}
        />
      )}
    </DashboardLayout>
  );
};

export default AssessmentsPage;
