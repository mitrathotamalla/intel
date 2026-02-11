import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Code2,
  BookOpen,
  Mic,
  Flame,
  TrendingUp,
  Target,
  Clock,
  ArrowRight,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const progressData = [
  { day: "Mon", problems: 3, score: 65 },
  { day: "Tue", problems: 5, score: 72 },
  { day: "Wed", problems: 2, score: 68 },
  { day: "Thu", problems: 7, score: 78 },
  { day: "Fri", problems: 4, score: 75 },
  { day: "Sat", problems: 8, score: 82 },
  { day: "Sun", problems: 6, score: 80 },
];

const Dashboard = () => {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({
    problemsSolved: 0,
    testsCompleted: 0,
    speechSessions: 0,
    streak: 0,
  });
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      const [submissionsRes, attemptsRes, problemsRes, testsRes] = await Promise.all([
        supabase
          .from("coding_submissions")
          .select("*")
          .eq("user_id", user.id),
        supabase
          .from("test_attempts")
          .select("*, tests(title, type)")
          .eq("user_id", user.id)
          .order("started_at", { ascending: false })
          .limit(5),
        supabase
          .from("coding_problems")
          .select("id, title, difficulty, topic")
          .limit(4),
        supabase
          .from("tests")
          .select("id, title, type, difficulty")
          .limit(4),
      ]);

      const acceptedCount = (submissionsRes.data || []).filter(
        (s: any) => s.status === "accepted"
      ).length;
      const completedTests = (attemptsRes.data || []).filter(
        (a: any) => a.completed_at
      ).length;

      setStats({
        problemsSolved: acceptedCount,
        testsCompleted: completedTests,
        speechSessions: 0,
        streak: 0,
      });

      setRecentAttempts(attemptsRes.data || []);

      // Build recommendations from available content
      const recs: any[] = [];
      (problemsRes.data || []).slice(0, 2).forEach((p: any) => {
        recs.push({
          title: p.title,
          difficulty: p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1),
          topic: p.topic || "General",
          type: "coding",
        });
      });
      (testsRes.data || []).slice(0, 2).forEach((t: any) => {
        recs.push({
          title: t.title,
          difficulty: t.difficulty.charAt(0).toUpperCase() + t.difficulty.slice(1),
          topic: t.type,
          type: "test",
        });
      });
      setRecommendations(recs);
      setLoading(false);
    };

    fetchDashboardData();
  }, [user]);

  const displayName = profile?.name || "Student";

  const statCards = [
    { icon: Code2, label: "Problems Solved", value: stats.problemsSolved.toString(), change: "Keep going!", gradient: "gradient-primary" },
    { icon: BookOpen, label: "Tests Completed", value: stats.testsCompleted.toString(), change: "Stay consistent", gradient: "gradient-accent" },
    { icon: Mic, label: "Speech Sessions", value: stats.speechSessions.toString(), change: "Practice daily", gradient: "gradient-amber" },
    { icon: Flame, label: "Day Streak", value: stats.streak.toString(), change: "Build your streak!", gradient: "gradient-primary" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Welcome back, {displayName}! 👋</h1>
          <p className="mt-1 text-muted-foreground">
            Keep preparing. Every problem you solve brings you closer to your dream placement.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.gradient}`}>
                  <stat.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <TrendingUp className="h-4 w-4 text-emerald" />
              </div>
              <div className="mt-4 text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              <div className="mt-1 text-xs text-emerald">{stat.change}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts and Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Progress Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="rounded-2xl border border-border bg-card p-6 lg:col-span-2"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Weekly Progress</h3>
                <p className="text-sm text-muted-foreground">Your preparation score trend</p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                This Week
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={progressData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(234, 89%, 54%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(234, 89%, 54%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} stroke="hsl(220, 9%, 46%)" />
                <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="hsl(220, 9%, 46%)" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(220, 13%, 91%)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="score" stroke="hsl(234, 89%, 54%)" strokeWidth={2.5} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h3 className="mb-4 text-lg font-semibold text-foreground">Recent Activity</h3>
            <div className="space-y-4">
              {recentAttempts.length > 0 ? (
                recentAttempts.map((attempt: any, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    {attempt.completed_at ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {attempt.completed_at ? "Completed" : "Started"}: {attempt.tests?.title || "Test"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {attempt.completed_at ? `Score: ${attempt.score}` : "In progress"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">
                  No activity yet. Start solving problems or taking tests!
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                <Target className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Recommended for You</h3>
                <p className="text-sm text-muted-foreground">Based on available content</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {recommendations.map((rec: any, i: number) => (
                <Link
                  key={i}
                  to={rec.type === "coding" ? "/coding" : "/assessments"}
                  className="group rounded-xl border border-border p-4 transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        rec.difficulty === "Easy"
                          ? "bg-emerald/10 text-emerald"
                          : rec.difficulty === "Medium"
                          ? "bg-amber/10 text-amber"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {rec.difficulty}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                  <h4 className="mb-1 text-sm font-semibold text-foreground">{rec.title}</h4>
                  <p className="text-xs text-muted-foreground">{rec.topic}</p>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Link to="/coding">
            <Button className="h-auto w-full justify-start gap-4 rounded-2xl border border-border bg-card p-5 text-left text-foreground shadow-none hover:border-primary/30 hover:bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
                <Code2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="text-sm font-semibold">Practice Coding</div>
                <div className="text-xs text-muted-foreground">Solve problems</div>
              </div>
            </Button>
          </Link>
          <Link to="/assessments">
            <Button className="h-auto w-full justify-start gap-4 rounded-2xl border border-border bg-card p-5 text-left text-foreground shadow-none hover:border-primary/30 hover:bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-accent">
                <BookOpen className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <div className="text-sm font-semibold">Take a Test</div>
                <div className="text-xs text-muted-foreground">Aptitude & Technical</div>
              </div>
            </Button>
          </Link>
          <Link to="/speech">
            <Button className="h-auto w-full justify-start gap-4 rounded-2xl border border-border bg-card p-5 text-left text-foreground shadow-none hover:border-primary/30 hover:bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-amber">
                <Mic className="h-6 w-6 text-amber-foreground" />
              </div>
              <div>
                <div className="text-sm font-semibold">Speech Practice</div>
                <div className="text-xs text-muted-foreground">AI Interview Coach</div>
              </div>
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
