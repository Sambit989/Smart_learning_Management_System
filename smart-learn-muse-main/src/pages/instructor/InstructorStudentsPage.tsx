import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Users, Search, UserCheck, Mail, ChevronRight, MoreVertical
} from "lucide-react";
import api from "@/services/api";
import { toast } from "sonner";

export default function InstructorStudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await api.get('/instructor/students');
            setStudents(res.data);
        } catch (error) {
            toast.error("Failed to load students");
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.course.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-black text-foreground tracking-tight">Student Roster</h1>
                <p className="text-muted-foreground font-medium">Track performance and engagement across your courses</p>
            </div>

            <div className="glass-card rounded-3xl border border-border/40 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-black text-foreground">All Students</h3>
                        <p className="text-sm text-muted-foreground font-medium">{students.length} students enrolled</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Filter by name or course..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-secondary/30 border border-border/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-secondary/10">
                                <th className="px-8 py-5 text-left text-[10px] font-black uppercase text-muted-foreground tracking-widest">Student</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black uppercase text-muted-foreground tracking-widest">Course</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black uppercase text-muted-foreground tracking-widest">Progress</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black uppercase text-muted-foreground tracking-widest">Quiz Avg</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black uppercase text-muted-foreground tracking-widest">Risk Level</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black uppercase text-muted-foreground tracking-widest">Last Active</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {filteredStudents.map((s) => (
                                <tr key={s.id} className="hover:bg-primary/5 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
                                                {s.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{s.name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tight mt-0.5">ID: #ST{s.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-xs font-bold text-muted-foreground">{s.course}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3 w-32">
                                            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                                                <div className="h-full bg-primary rounded-full" style={{ width: `${s.progress}%` }} />
                                            </div>
                                            <span className="text-xs font-bold text-foreground">{s.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-xs font-bold">{s.quizAvg}%</td>
                                    <td className="px-8 py-5">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider
                      ${s.risk === 'low' ? 'bg-success/10 text-success' :
                                                s.risk === 'medium' ? 'bg-warning/10 text-warning' :
                                                    'bg-accent/10 text-accent'}
                    `}>
                                            {s.risk}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-xs text-muted-foreground font-medium">
                                        {s.lastActive ? new Date(s.lastActive).toLocaleDateString() : 'Never'}
                                    </td>
                                </tr>
                            ))}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <UserCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                                        <p className="text-muted-foreground font-medium">No students found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
