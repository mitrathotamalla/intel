import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Trophy, Medal, Crown, Flame, Code2, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface LeaderboardEntry {
  user_id: string;
  name: string;
  department: string;
  avatar_url: string;
  problems_solved: number;
  total_score: number;
  activity_count: number;
}

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from("leaderboard")
        .select("*")
        .limit(50);

      if (!error && data) {
        setEntries(data.map(d => ({
          user_id: d.user_id || "",
          name: d.name || "",
          department: d.department || "",
          avatar_url: d.avatar_url || "",
          problems_solved: d.problems_solved || 0,
          total_score: d.total_score || 0,
          activity_count: d.activity_count || 0,
        })));
      }
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  const hasData = entries.length > 0 && entries.some(e => e.total_score > 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground">Campus rankings based on overall preparation score</p>
        </motion.div>

        {!hasData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-12 text-center"
          >
            <Trophy className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold text-foreground">No rankings yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Start solving coding problems and taking tests to appear on the leaderboard!
            </p>
          </motion.div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <div className="grid gap-4 sm:grid-cols-3">
              {entries.slice(0, 3).map((entry, i) => {
                const badges = ["🥇", "🥈", "🥉"];
                return (
                  <motion.div
                    key={entry.user_id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`relative overflow-hidden rounded-2xl border border-border p-6 text-center ${
                      i === 0 ? "gradient-hero sm:order-2" : "bg-card"
                    }`}
                  >
                    {i === 0 && <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_0%,hsl(38_92%_50%),transparent_70%)]" />}
                    <div className="relative">
                      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-3xl">
                        {badges[i] || (
                          <div className={`flex h-16 w-16 items-center justify-center rounded-full ${i === 0 ? "gradient-amber" : "gradient-primary"}`}>
                            {i === 0 ? <Crown className="h-7 w-7 text-amber-foreground" /> : <Medal className="h-7 w-7 text-primary-foreground" />}
                          </div>
                        )}
                      </div>
                      <div className={`text-2xl font-bold ${i === 0 ? "text-primary-foreground" : "text-foreground"}`}>
                        #{i + 1}
                      </div>
                      <div className={`text-lg font-semibold ${i === 0 ? "text-primary-foreground" : "text-foreground"}`}>
                        {entry.name || "Anonymous"}
                      </div>
                      <div className={`text-sm ${i === 0 ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {entry.department || "—"}
                      </div>
                      <div className={`mt-3 text-3xl font-black ${i === 0 ? "text-primary-foreground" : "text-gradient"}`}>
                        {entry.total_score.toLocaleString()}
                      </div>
                      <div className={`text-xs ${i === 0 ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        XP Points
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Full Leaderboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-border bg-card"
            >
              <div className="hidden border-b border-border px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:grid md:grid-cols-12 md:gap-4">
                <div className="col-span-1">Rank</div>
                <div className="col-span-3">Student</div>
                <div className="col-span-2">Department</div>
                <div className="col-span-2">Problems</div>
                <div className="col-span-2">Score</div>
                <div className="col-span-2">Activity</div>
              </div>
              {entries.map((entry, i) => {
                const isCurrentUser = entry.user_id === user?.id;
                const rank = i + 1;
                const badges = ["🥇", "🥈", "🥉"];
                return (
                  <motion.div
                    key={entry.user_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.04 }}
                    className={`border-b border-border px-6 py-4 last:border-0 md:grid md:grid-cols-12 md:items-center md:gap-4 ${
                      isCurrentUser ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="col-span-1 mb-2 md:mb-0">
                      <span className={`text-lg font-bold ${rank <= 3 ? "text-gradient" : "text-muted-foreground"}`}>
                        {badges[rank - 1] || `#${rank}`}
                      </span>
                    </div>
                    <div className="col-span-3 mb-2 md:mb-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                          {(entry.name || "?").charAt(0)}
                        </div>
                        <span className={`text-sm font-medium ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
                          {entry.name || "Anonymous"} {isCurrentUser && "(You)"}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2 mb-2 text-sm text-muted-foreground md:mb-0">{entry.department || "—"}</div>
                    <div className="col-span-2 mb-2 md:mb-0">
                      <span className="flex items-center gap-1 text-sm text-foreground">
                        <Code2 className="h-3.5 w-3.5 text-primary" />
                        {entry.problems_solved}
                      </span>
                    </div>
                    <div className="col-span-2 mb-2 md:mb-0">
                      <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald" />
                        {entry.total_score.toLocaleString()}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="flex items-center gap-1 text-sm text-foreground">
                        <Flame className="h-3.5 w-3.5 text-amber" />
                        {entry.activity_count} total
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LeaderboardPage;
