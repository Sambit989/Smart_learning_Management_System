import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, BookOpen, AlertTriangle, TrendingUp, Sparkles,
  ArrowUpRight, ChevronRight, Plus, X, Loader2
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import api from "@/services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({
    totalStudents: 0,
    activeCourses: 0,
    atRisk: 0,
    avgCompletion: "0%",
    engagementData: []
  });
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Course Modal State
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", description: "", category: "Development" });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, studentsRes] = await Promise.all([
        api.get('/instructor/stats'),
        api.get('/instructor/students')
      ]);
      if (statsRes.data) setStats(statsRes.data);
      if (studentsRes.data) setRecentStudents(studentsRes.data.slice(0, 5));
    } catch (error) {
      console.error("Dashboard load error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title.trim()) return toast.error("Please enter a course title");

    setIsSubmitting(true);
    try {
      console.log("Publishing course...", newCourse);
      const res = await api.post('/instructor/courses', newCourse);
      console.log("Course published:", res.data);

      setIsAddingCourse(false);
      setNewCourse({ title: "", description: "", category: "Development" });
      toast.success("Course published successfully! You can find it in 'My Courses'.");

      // Refresh stats to show new count
      fetchDashboardData();
    } catch (error: any) {
      console.error("Publishing fail", error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Failed to publish course";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Instructor Dashboard</h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
            <Sparkles className="w-4 h-4 text-primary" />
            Empowering {stats.totalStudents} students today
          </p>
        </div>
        <button
          onClick={() => setIsAddingCourse(true)}
          className="px-6 py-3 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Course
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Students", value: stats.totalStudents, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Active Courses", value: stats.activeCourses, icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
          { label: "At Risk", value: stats.atRisk, icon: AlertTriangle, color: "text-accent", bg: "bg-accent/10" },
          { label: "Avg. Completion", value: stats.avgCompletion, icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-3xl p-6 border border-border/40 shadow-lg group hover:-translate-y-1 transition-all">
            <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform`}>
              <s.icon className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-black text-foreground tracking-tighter">{s.value}</h3>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Engagement Overview */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-8 border border-border/40 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-foreground">Engagement Overview</h3>
            <button onClick={() => navigate("/instructor/analytics")} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              View Detailed Analytics <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.engagementData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, opacity: 0.5 }} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="views" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions / AI Suggestions */}
        <div className="glass-card rounded-3xl p-8 border border-border/40 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-black text-foreground mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Insights
            </h3>
            <p className="text-sm text-muted-foreground font-medium mb-6">Suggestions based on student data</p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <p className="text-xs font-bold text-primary uppercase mb-1">Retention Alert</p>
                <p className="text-sm font-medium text-foreground">3 students haven't logged in for 5 days. Consider sending a nudge.</p>
              </div>
              <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10">
                <p className="text-xs font-bold text-accent uppercase mb-1">Content Tip</p>
                <p className="text-sm font-medium text-foreground">"Python Basics" quiz has an average score of 62%. Consider adding a review lesson.</p>
              </div>
            </div>
          </div>
          <button onClick={() => navigate("/instructor/courses")} className="w-full mt-6 py-4 rounded-2xl border border-border/60 hover:bg-secondary/50 font-bold text-sm transition-all flex items-center justify-center gap-2">
            <BookOpen className="w-4 h-4" /> Manage My Courses
          </button>
        </div>
      </div>

      {/* Recent Students Table */}
      <div className="glass-card rounded-3xl border border-border/40 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-border/40 flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Recent Learner Activity</h3>
          <button onClick={() => navigate("/instructor/students")} className="text-xs font-bold text-primary hover:underline">View All Students</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody className="divide-y divide-border/40">
              {recentStudents.map((s) => (
                <tr key={s.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">{s.name[0]}</div>
                      <p className="text-sm font-bold text-foreground">{s.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-muted-foreground">{s.course}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${s.progress}%` }} />
                      </div>
                      <span className="text-[10px] font-bold">{s.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => navigate("/instructor/students")} className="p-2 rounded-lg hover:bg-secondary transition-colors"><ChevronRight className="w-4 h-4 text-muted-foreground" /></button>
                  </td>
                </tr>
              ))}
              {recentStudents.length === 0 && (
                <tr>
                  <td className="px-6 py-10 text-center text-muted-foreground text-sm" colSpan={4}>No student activity yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Course Modal */}
      <AnimatePresence>
        {isAddingCourse && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isSubmitting && setIsAddingCourse(false)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg glass-card rounded-[40px] border border-border/40 shadow-2xl p-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-foreground">Create Course</h2>
                  <p className="text-sm text-muted-foreground font-medium mt-1">Design a new learning experience</p>
                </div>
                <button disabled={isSubmitting} onClick={() => setIsAddingCourse(false)} className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-50"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleCreateCourse} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">Course Title</label>
                  <input
                    required
                    placeholder="e.g. Advanced React Architecture"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    className="w-full bg-secondary/30 border border-border/50 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">Description</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="What will students learn?"
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    className="w-full bg-secondary/30 border border-border/50 rounded-2xl px-5 py-4 text-sm font-medium resize-none outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">Category</label>
                  <select value={newCourse.category} onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })} className="w-full bg-secondary/30 border border-border/50 rounded-2xl px-5 py-4 text-sm font-medium outline-none">
                    <option>Development</option>
                    <option>Design</option>
                    <option>Business</option>
                    <option>AI & Data Science</option>
                    <option>Marketing</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  {isSubmitting ? "Publishing..." : "Publish Course"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
