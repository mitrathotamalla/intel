import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  CheckCircle2,
  Circle,
  Code2,
  Building2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import CodingProblemDetail from "@/components/CodingProblemDetail";

type Difficulty = "easy" | "medium" | "hard";

interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  topic: string;
  company_tags: string[];
  description: string;
  test_cases?: any[];
  solution?: any;
}

const CodingPage = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeDifficulty, setActiveDifficulty] = useState<string | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  const fetchData = async () => {
    const [problemsRes, submissionsRes] = await Promise.all([
      supabase.from("coding_problems").select("*").order("created_at", { ascending: false }),
      user
        ? supabase
            .from("coding_submissions")
            .select("problem_id, status")
            .eq("user_id", user.id)
            .eq("status", "accepted")
        : Promise.resolve({ data: [] }),
    ]);

    const probs = (problemsRes.data || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty as Difficulty,
      topic: p.topic || "",
      company_tags: Array.isArray(p.company_tags) ? p.company_tags : [],
      description: p.description || "",
      test_cases: Array.isArray(p.test_cases) ? p.test_cases : [],
      solution: p.solution,
    }));
    setProblems(probs);

    const solved = new Set<string>(
      ((submissionsRes as any).data || []).map((s: any) => s.problem_id)
    );
    setSolvedIds(solved);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const filtered = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.topic.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = !activeDifficulty || p.difficulty === activeDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const solvedCount = problems.filter((p) => solvedIds.has(p.id)).length;

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
          <h1 className="text-2xl font-bold text-foreground">Coding Practice</h1>
          <p className="text-muted-foreground">
            {solvedCount}/{problems.length} problems solved
          </p>
        </motion.div>

        {/* Progress bar */}
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full gradient-primary transition-all duration-500"
            style={{ width: problems.length > 0 ? `${(solvedCount / problems.length) * 100}%` : "0%" }}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search problems or topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
              <Button
                key={d}
                size="sm"
                variant={activeDifficulty === d ? "default" : "outline"}
                onClick={() => setActiveDifficulty(activeDifficulty === d ? null : d)}
                className={
                  activeDifficulty === d
                    ? d === "easy"
                      ? "gradient-accent border-0 text-accent-foreground"
                      : d === "medium"
                      ? "gradient-amber border-0 text-amber-foreground"
                      : "bg-destructive border-0 text-destructive-foreground"
                    : ""
                }
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Problem list */}
        {problems.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <Code2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold text-foreground">No problems available</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Problems will appear here once an admin adds them.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card">
            <div className="hidden border-b border-border px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:grid md:grid-cols-12 md:gap-4">
              <div className="col-span-1">Status</div>
              <div className="col-span-4">Title</div>
              <div className="col-span-2">Difficulty</div>
              <div className="col-span-3">Topic</div>
              <div className="col-span-2">Companies</div>
            </div>
            {filtered.map((problem, i) => {
              const solved = solvedIds.has(problem.id);
              return (
                <motion.div
                  key={problem.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedProblem(problem)}
                  className="group cursor-pointer border-b border-border px-6 py-4 transition-colors last:border-0 hover:bg-muted/50 md:grid md:grid-cols-12 md:items-center md:gap-4"
                >
                  <div className="col-span-1 mb-2 md:mb-0">
                    {solved ? (
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="col-span-4 mb-2 md:mb-0">
                    <span className="text-sm font-medium text-foreground group-hover:text-primary">
                      {problem.title}
                    </span>
                  </div>
                  <div className="col-span-2 mb-2 md:mb-0">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        problem.difficulty === "easy"
                          ? "bg-accent/10 text-accent"
                          : problem.difficulty === "medium"
                          ? "bg-amber/10 text-amber"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                    </span>
                  </div>
                  <div className="col-span-3 mb-2 md:mb-0">
                    <Badge variant="secondary" className="text-xs">
                      {problem.topic || "General"}
                    </Badge>
                  </div>
                  <div className="col-span-2 flex items-center gap-1">
                    {problem.company_tags.slice(0, 2).map((c: string) => (
                      <span key={c} className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        {c}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Problem Detail Modal */}
      {selectedProblem && user && (
        <CodingProblemDetail
          open={true}
          onClose={() => setSelectedProblem(null)}
          problem={selectedProblem}
          userId={user.id}
          onSolved={() => {
            setSolvedIds((prev) => new Set(prev).add(selectedProblem.id));
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default CodingPage;
