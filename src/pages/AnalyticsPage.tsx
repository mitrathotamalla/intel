import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  BarChart3,
  Target,
  Brain,
  AlertTriangle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProblems: 0,
    totalTests: 0,
    totalSpeech: 0,
    avgTestScore: 0,
    difficultyBreakdown: [] as any[],
    topicPerformance: [] as any[],
    radarData: [] as any[],
    weakAreas: [] as any[],
    readinessScore: 0,
  });

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [subRes, attRes, speechRes, probRes] = await Promise.all([
        supabase.from("coding_submissions").select("problem_id, status, score").eq("user_id", user.id),
        supabase.from("test_attempts").select("test_id, score, completed_at, tests(type, difficulty)").eq("user_id", user.id).not("completed_at", "is", null),
        supabase.from("speech_sessions").select("fluency_score, grammar_score, confidence_score").eq("user_id", user.id),
        supabase.from("coding_problems").select("id, topic, difficulty"),
      ]);

      const submissions = subRes.data || [];
      const attempts = (attRes.data || []) as any[];
      const speechSessions = speechRes.data || [];
      const allProblems = probRes.data || [];

      const accepted = submissions.filter((s: any) => s.status === "accepted");
      const acceptedIds = new Set(accepted.map((s: any) => s.problem_id));

      // Difficulty breakdown
      const easy = accepted.filter((s: any) => {
        const prob = allProblems.find((p: any) => p.id === s.problem_id);
        return prob?.difficulty === "easy";
      }).length;
      const medium = accepted.filter((s: any) => {
        const prob = allProblems.find((p: any) => p.id === s.problem_id);
        return prob?.difficulty === "medium";
      }).length;
      const hard = accepted.filter((s: any) => {
        const prob = allProblems.find((p: any) => p.id === s.problem_id);
        return prob?.difficulty === "hard";
      }).length;

      const difficultyBreakdown = [
        { name: "Easy", value: easy, color: "hsl(160, 84%, 39%)" },
        { name: "Medium", value: medium, color: "hsl(38, 92%, 50%)" },
        { name: "Hard", value: hard, color: "hsl(0, 84%, 60%)" },
      ];

      // Topic performance
      const topicMap = new Map<string, { total: number; solved: number }>();
      allProblems.forEach((p: any) => {
        const topic = p.topic || "General";
        const entry = topicMap.get(topic) || { total: 0, solved: 0 };
        entry.total++;
        if (acceptedIds.has(p.id)) entry.solved++;
        topicMap.set(topic, entry);
      });
      const topicPerformance = Array.from(topicMap.entries())
        .map(([topic, { total, solved }]) => ({
          topic,
          score: total > 0 ? Math.round((solved / total) * 100) : 0,
        }))
        .sort((a, b) => b.score - a.score);

      // Test type scores
      const typeScores = new Map<string, number[]>();
      attempts.forEach((a: any) => {
        const type = a.tests?.type || "general";
        const arr = typeScores.get(type) || [];
        arr.push(a.score || 0);
        typeScores.set(type, arr);
      });
      const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

      const avgTestScore = attempts.length > 0
        ? Math.round(attempts.reduce((a: number, b: any) => a + (b.score || 0), 0) / attempts.length)
        : 0;

      const avgSpeech = speechSessions.length > 0
        ? Math.round(speechSessions.reduce((a: number, b: any) => a + ((b.fluency_score + b.grammar_score + b.confidence_score) / 3), 0) / speechSessions.length)
        : 0;

      const codingScore = allProblems.length > 0 ? Math.round((acceptedIds.size / allProblems.length) * 100) : 0;

      const radarData = [
        { subject: "Coding", A: codingScore },
        { subject: "Aptitude", A: avg(typeScores.get("aptitude") || []) },
        { subject: "Verbal", A: avg(typeScores.get("verbal") || []) },
        { subject: "Communication", A: avgSpeech },
        { subject: "Technical MCQ", A: avg(typeScores.get("technical") || []) },
      ];

      // Weak areas
      const weakAreas = [...topicPerformance]
        .filter((t) => t.score < 70)
        .sort((a, b) => a.score - b.score)
        .slice(0, 3)
        .map((t) => ({
          topic: t.topic,
          score: t.score,
          recommendation: `Practice more ${t.topic} problems to improve your score.`,
        }));

      const readinessScore = Math.round(
        (codingScore * 0.4 + avgTestScore * 0.35 + avgSpeech * 0.25) || 0
      );

      setStats({
        totalProblems: acceptedIds.size,
        totalTests: attempts.length,
        totalSpeech: speechSessions.length,
        avgTestScore,
        difficultyBreakdown,
        topicPerformance,
        radarData,
        weakAreas,
        readinessScore,
      });
      setLoading(false);
    };
    fetch();
  }, [user]);

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
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Your comprehensive preparation overview</p>
        </motion.div>

        {/* Placement Readiness */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl gradient-hero p-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-primary-foreground/70">
            <Target className="h-5 w-5" />
            <span className="text-sm font-medium">Placement Readiness Score</span>
          </div>
          <div className="my-3 text-6xl font-black text-primary-foreground">{stats.readinessScore}%</div>
          <p className="text-sm text-primary-foreground/60">
            Based on {stats.totalProblems} problems, {stats.totalTests} tests, and {stats.totalSpeech} speech sessions
          </p>
          <div className="mx-auto mt-4 max-w-md">
            <div className="h-3 overflow-hidden rounded-full bg-primary-foreground/20">
              <div className="h-3 rounded-full gradient-accent" style={{ width: `${stats.readinessScore}%` }} />
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Topic Performance */}
          {stats.topicPerformance.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <BarChart3 className="h-5 w-5 text-primary" />
                Topic Performance
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topicPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis type="number" domain={[0, 100]} fontSize={12} stroke="hsl(220, 9%, 46%)" />
                  <YAxis type="category" dataKey="topic" fontSize={12} width={80} stroke="hsl(220, 9%, 46%)" />
                  <Tooltip />
                  <Bar dataKey="score" radius={[0, 6, 6, 0]} fill="hsl(234, 89%, 54%)" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Skill Radar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Brain className="h-5 w-5 text-primary" />
              Skill Profile
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={stats.radarData}>
                <PolarGrid stroke="hsl(220, 13%, 91%)" />
                <PolarAngleAxis dataKey="subject" fontSize={11} stroke="hsl(220, 9%, 46%)" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={10} stroke="hsl(220, 9%, 46%)" />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="hsl(234, 89%, 54%)"
                  fill="hsl(234, 89%, 54%)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Difficulty Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h3 className="mb-4 text-lg font-semibold text-foreground">Problems by Difficulty</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.difficultyBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                >
                  {stats.difficultyBreakdown.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex justify-center gap-4">
              {stats.difficultyBreakdown.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Weak Areas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-border bg-card p-6 lg:col-span-2"
          >
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <AlertTriangle className="h-5 w-5 text-amber" />
              Focus Areas
            </h3>
            {stats.weakAreas.length > 0 ? (
              <div className="space-y-4">
                {stats.weakAreas.map((area, i) => (
                  <div key={i} className="rounded-xl bg-muted/50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{area.topic}</span>
                      <span className="text-sm font-bold text-amber">{area.score}%</span>
                    </div>
                    <Progress value={area.score} className="mb-2 h-2" />
                    <p className="text-xs text-muted-foreground">💡 {area.recommendation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Complete more coding problems and tests to see personalized focus areas.
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
