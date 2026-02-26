import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, BookOpen, TrendingUp, ThumbsUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import api from "@/services/api";

// Data fetched from API


export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeCourses: 0,
    completionRate: 0,
    dropoutRate: 0,
    monthlyGrowth: 0,
    userGrowth: [],
    courseDistribution: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (error) {
        console.error("Error fetching admin stats", error);
      }
    };
    fetchStats();
  }, []);

  const statsList = [
    { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users, color: "bg-primary/10 text-primary", change: `${stats.monthlyGrowth > 0 ? '+' : ''}${stats.monthlyGrowth}% MoM`, positive: stats.monthlyGrowth >= 0 },
    { label: "Active Courses", value: stats.activeCourses, icon: BookOpen, color: "bg-success/10 text-success", change: "System Active", positive: true },
    { label: "Completion Rate", value: `${stats.completionRate}%`, icon: TrendingUp, color: "bg-info/10 text-info", change: "Avg Progress", positive: true },
    { label: "Dropout Rate", value: `${stats.dropoutRate}%`, icon: ThumbsUp, color: "bg-accent/10 text-accent", change: "30d Inactive", positive: stats.dropoutRate < 10 },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">System overview & analytics</p>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        {statsList.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${s.positive ? "text-success" : "text-accent"}`}>
                {s.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {s.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 glass-card rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stats.userGrowth || []}>
              <defs>
                <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 15%, 88%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(225, 10%, 45%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(225, 10%, 45%)" />
              <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(225, 15%, 88%)", borderRadius: "8px" }} />
              <Area type="monotone" dataKey="users" stroke="hsl(239, 84%, 67%)" fill="url(#growthGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Course Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={stats.courseDistribution || []} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                {stats.courseDistribution?.map((entry: any, i: number) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(225, 15%, 88%)", borderRadius: "8px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {stats.courseDistribution?.map((d: any) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                <span className="text-foreground">{d.name}</span>
                <span className="ml-auto text-muted-foreground">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
