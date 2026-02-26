import { useEffect, useState } from "react";
import { QuizScoreChart, StudyHoursChart } from "@/components/features/PerformanceCharts";
import api from "@/services/api";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
    const [statsData, setStatsData] = useState({
        quizTrend: [],
        studyHours: []
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <QuizScoreChart data={statsData.quizTrend || []} />
                <StudyHoursChart data={statsData.studyHours || []} />
            </div>
        </div>
    );
}
