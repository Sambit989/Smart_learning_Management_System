import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    BarChart3, TrendingUp, Users, BookOpen, AlertTriangle,
    Sparkles, Calendar, ArrowUpRight
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from "recharts";
import api from "@/services/api";
import { toast } from "sonner";

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export default function InstructorAnalyticsPage() {
    const [stats, setStats] = useState<any>({
        totalStudents: 0,
        atRisk: 0,
        avgCompletion: "0%",
        engagementData: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/instructor/stats');
            if (res.data) setStats(res.data);
        } catch (error) {
            toast.error("Failed to load analytics");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const engagementData = stats.engagementData || [];

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-black text-foreground tracking-tight">Advanced Analytics</h1>
                <p className="text-muted-foreground font-medium">Deep dive into course performance and learner behavior</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Completion Rate", value: stats.avgCompletion, icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
                    { label: "Active Learners", value: stats.totalStudents, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "Risk Alerts", value: stats.atRisk, icon: AlertTriangle, color: "text-accent", bg: "bg-accent/10" },
                    { label: "Content Hours", value: "142h", icon: Calendar, color: "text-primary", bg: "bg-primary/10" },
                ].map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card rounded-3xl p-6 border border-border/40 shadow-lg"
                    >
                        <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center mb-4`}>
                            <s.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-3xl font-black text-foreground tracking-tighter">{s.value}</h3>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{s.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Engagement Trend */}
                <div className="glass-card rounded-3xl p-8 border border-border/40 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-foreground">Content Engagement</h3>
                        <BarChart3 className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={engagementData}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, opacity: 0.5 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, opacity: 0.5 }} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                                <Area type="monotone" dataKey="completions" stroke="#10b981" strokeWidth={3} fillOpacity={0.1} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Weekly Activity */}
                <div className="glass-card rounded-3xl p-8 border border-border/40 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-foreground">Weekly Comparisons</h3>
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={engagementData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, opacity: 0.5 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, opacity: 0.5 }} />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="views" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="completions" fill="#10b981" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* AI Recommendations */}
            <div className="glass-card rounded-3xl p-8 border border-border/40 shadow-xl bg-primary/5">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-black text-foreground">AI Intelligence Insights</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-background/50 border border-primary/20">
                        <p className="text-sm font-bold text-foreground mb-2">Top Performing Course</p>
                        <p className="text-xs text-muted-foreground">"Introduction to Python" has 15% higher completion than average.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-background/50 border border-accent/20">
                        <p className="text-sm font-bold text-foreground mb-2">Action Required</p>
                        <p className="text-xs text-muted-foreground">3 students in "Machine Learning" haven't opened Chapter 2 in 10 days.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-background/50 border border-success/20">
                        <p className="text-sm font-bold text-foreground mb-2">Growth Opportunity</p>
                        <p className="text-xs text-muted-foreground">Adding a quiz to "Data Science 101" could improve retention by 20%.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
