import { useEffect, useState } from "react";
import { QuizScoreChart, StudyHoursChart } from "@/components/features/PerformanceCharts";
import api from "@/services/api";
import { motion } from "framer-motion";
import { BarChart3, BookOpen, TrendingUp, Brain, Sparkles } from "lucide-react";

export default function AnalyticsPage() {
    const [statsData, setStatsData] = useState<any>({
        quizTrend: [],
        studyHours: [],
        courses: 0,
        avgScore: 0,
        quizzesDone: 0,
        xp: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/student/stats');
                setStatsData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-8">Loading analytics...</div>;

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    My Analytics
                </h1>
                <p className="text-muted-foreground text-sm mt-1">Track your learning progress</p>
            </motion.div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Courses", value: statsData.courses || 0, icon: BookOpen, color: "bg-primary/10 text-primary" },
                    { label: "Avg Score", value: `${statsData.avgScore || 0}%`, icon: TrendingUp, color: "bg-success/10 text-success" },
                    { label: "Quizzes Done", value: statsData.quizzesDone || 0, icon: Brain, color: "bg-accent/10 text-accent" },
                    { label: "XP Earned", value: (statsData.xp || 0).toLocaleString(), icon: Sparkles, color: "bg-xp/10 text-xp" },
                ].map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card rounded-xl p-4 flex items-center gap-3 border border-border/40 shadow-sm"
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-foreground">{s.value}</p>
                            <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <QuizScoreChart data={statsData.quizTrend || []} />
                <StudyHoursChart data={statsData.studyHours || []} />
            </div>
        </div>
    );
}
