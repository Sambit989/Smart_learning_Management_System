import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
// import { badges } from "@/data/dummyData";
import { Flame, Zap, Trophy, Medal } from "lucide-react";
import api from "@/services/api";

export default function GamificationPanel() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [studentStats, setStudentStats] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lbRes, statsRes, badgesRes] = await Promise.all([
          api.get('/student/leaderboard'),
          api.get('/student/stats'),
          api.get('/student/badges')
        ]);
        setLeaderboard(lbRes.data);
        setStudentStats(statsRes.data);
        setBadges(badgesRes.data);
      } catch (error) {
        console.error("Failed to fetch gamification data", error);
      }
    };
    fetchData();
  }, []);

  if (!user || !studentStats) return null;

  const xpToNext = 500 - (studentStats.xp % 500);
  const xpPercent = ((studentStats.xp % 500) / 500) * 100;

  return (
    <div className="space-y-4">
      {/* XP & Level */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-xp/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-xp" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Level {studentStats.level}</p>
              <p className="text-xs text-muted-foreground">{studentStats.xp.toLocaleString()} XP</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-accent/10 px-2.5 py-1 rounded-full">
            <Flame className="w-4 h-4 text-accent" />
            <span className="text-sm font-bold text-accent">{studentStats.streak}</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Next level</span>
            <span>{xpToNext} XP to go</span>
          </div>
          <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 1 }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, hsl(270 76% 58%), hsl(290 80% 55%))" }}
            />
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-warning" />
          Badges
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {badges.map((badge) => {
            const isEarned = studentStats.badges?.some((b: any) => b.badge_id === badge.id);
            return (
              <motion.div
                key={badge.id}
                whileHover={{ scale: 1.05 }}
                className={`flex flex-col items-center p-2 rounded-lg text-center ${isEarned ? "bg-secondary" : "bg-secondary/40 opacity-50"
                  }`}
              >
                <span className="text-2xl mb-1">{badge.icon}</span>
                <span className="text-[10px] font-medium text-foreground leading-tight">{badge.name}</span>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Medal className="w-4 h-4 text-primary" />
          Leaderboard
        </h3>
        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center gap-3 p-2 rounded-lg ${entry.name === user.name ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary/50"
                } transition-colors`}
            >
              <span className={`w-6 text-center text-sm font-bold ${entry.rank === 1 ? "text-warning" : entry.rank === 2 ? "text-muted-foreground" : entry.rank === 3 ? "text-accent" : "text-muted-foreground"
                }`}>
                {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : `#${entry.rank}`}
              </span>
              <span className="text-lg">{entry.avatar}</span>
              <div className="flex-1">
                <p className={`text-sm font-medium ${entry.name === user.name ? "text-primary" : "text-foreground"}`}>
                  {entry.name === user.name ? "You" : entry.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">{entry.xp.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">🔥 {entry.streak}d</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
