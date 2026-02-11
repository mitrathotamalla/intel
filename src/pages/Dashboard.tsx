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

/* ---------------- MOCK DATA ---------------- */

const progressData = [
  { day: "Mon", problems: 3, score: 65 },
  { day: "Tue", problems: 5, score: 72 },
  { day: "Wed", problems: 2, score: 68 },
  { day: "Thu", problems: 7, score: 78 },
  { day: "Fri", problems: 4, score: 75 },
  { day: "Sat", problems: 8, score: 82 },
  { day: "Sun", problems: 6, score: 80 },
];

/* ---------------- DASHBOARD ---------------- */

const Dashboard = () => {
  // ✅ GET ROLE ALSO
  const { profile, user, role } = useAuth();

  const [stats, setStats] = useState({
    problemsSolved: 0,
    testsCompleted: 0,
    speechSessions: 0,
    streak: 0,
  });

  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      const [
        submissionsRes,
        attemptsRes,
        problemsRes,
        testsRes,
      ] = await Promise.all([
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

      const acceptedCount =
        (submissionsRes.data || []).filter(
          (s: any) => s.status === "accepted"
        ).length;

      const completedTests =
        (attemptsRes.data || []).filter(
          (a: any) => a.completed_at
        ).length;

      setStats({
        problemsSolved: acceptedCount,
        testsCompleted: completedTests,
        speechSessions: 0,
        streak: 0,
      });

      setRecentAttempts(attemptsRes.data || []);

      // Build recommendations
      const recs: any[] = [];

      (problemsRes.data || []).slice(0, 2).forEach((p: any) => {
        recs.push({
          title: p.title,
          difficulty:
            p.difficulty.charAt(0).toUpperCase() +
            p.difficulty.slice(1),
          topic: p.topic || "General",
          type: "coding",
        });
      });

      (testsRes.data || []).slice(0, 2).forEach((t: any) => {
        recs.push({
          title: t.title,
          difficulty:
            t.difficulty.charAt(0).toUpperCase() +
            t.difficulty.slice(1),
          topic: t.type,
          type: "test",
        });
      });

      setRecommendations(recs);
      setLoading(false);
    };

    fetchDashboardData();
  }, [user]);

  /* ---------------- NAME / ROLE ---------------- */

  const displayName =
    role === "admin"
      ? "Admin"
      : profile?.name || "Student";

  /* ---------------- STATS ---------------- */

  const statCards = [
    {
      icon: Code2,
      label: "Problems Solved",
      value: stats.problemsSolved.toString(),
      change: "Keep going!",
      gradient: "gradient-primary",
    },
    {
      icon: BookOpen,
      label: "Tests Completed",
      value: stats.testsCompleted.toString(),
      change: "Stay consistent",
      gradient: "gradient-accent",
    },
    {
      icon: Mic,
      label: "Speech Sessions",
      value: stats.speechSessions.toString(),
      change: "Practice daily",
      gradient: "gradient-amber",
    },
    {
      icon: Flame,
      label: "Day Streak",
      value: stats.streak.toString(),
      change: "Build your streak!",
      gradient: "gradient-primary",
    },
  ];

  /* ---------------- UI ---------------- */

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold sm:text-3xl">
            Welcome back, {displayName}! 👋
          </h1>

          {role === "admin" && (
            <p className="mt-1 text-sm text-emerald font-medium">
              🔐 Admin Access Enabled
            </p>
          )}

          <p className="mt-1 text-muted-foreground">
            Keep preparing. Every problem brings you closer.
          </p>
        </motion.div>

        {/* STATS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.gradient}`}
                >
                  <stat.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <TrendingUp className="h-4 w-4 text-emerald" />
              </div>

              <div className="mt-4 text-3xl font-bold">
                {stat.value}
              </div>

              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>

              <div className="mt-1 text-xs text-emerald">
                {stat.change}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ADMIN PANEL (ONLY FOR ADMIN) */}
        {role === "admin" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border bg-card p-6"
          >
            <h3 className="text-lg font-semibold mb-3">
              Admin Panel
            </h3>

            <div className="flex gap-3 flex-wrap">

              <Link to="/admin/users">
                <Button variant="outline">
                  Manage Users
                </Button>
              </Link>

              <Link to="/admin/content">
                <Button variant="outline">
                  Manage Content
                </Button>
              </Link>

              <Link to="/admin/reports">
                <Button variant="outline">
                  View Reports
                </Button>
              </Link>

            </div>
          </motion.div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
