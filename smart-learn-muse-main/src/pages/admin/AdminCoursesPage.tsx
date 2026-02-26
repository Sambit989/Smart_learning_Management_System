import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BookOpen, Search, Trash2, Eye, Users, Calendar, MoreVertical, X } from "lucide-react";
import api from "@/services/api";

// Gradient generator based on string hash
const getGradient = (str: string) => {
    const colors = [
        "from-pink-500 to-rose-500",
        "from-blue-500 to-cyan-500",
        "from-purple-500 to-indigo-500",
        "from-emerald-500 to-teal-500",
        "from-orange-500 to-amber-500",
        "from-indigo-500 to-purple-600",
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export default function AdminCoursesPage() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // New State for Progress Modal
    const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
    const [courseStudents, setCourseStudents] = useState<any[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/admin/courses');
            setCourses(res.data);
        } catch (error) {
            console.error("Error fetching courses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewStudents = async (course: any) => {
        setSelectedCourse(course);
        setLoadingStudents(true);
        try {
            const res = await api.get(`/admin/courses/${course.id}/students`);
            setCourseStudents(res.data);
        } catch (error) {
            console.error("Failed to fetch students", error);
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/admin/courses/${deleteId}`);
            setCourses(courses.filter(c => c.id !== deleteId));
            setDeleteId(null);
        } catch (error) {
            console.error("Error deleting course", error);
        }
    };

    const filtered = courses.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.instructor_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-8">
            {/* ... (Header and Toolbar same as before) ... */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                    Course Management
                </h1>
                <p className="text-muted-foreground mt-2">Manage, monitor, and organize all platform courses.</p>
            </motion.div>

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 bg-card/50 p-4 rounded-xl border border-border/50 backdrop-blur-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search courses or instructors..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg">
                    <BookOpen className="w-4 h-4" />
                    <span>{filtered.length} Courses</span>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                    {filtered.map((course) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            layout
                            className="group relative bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300"
                        >
                            {/* Course Cover Gradient */}
                            <div className={`h-36 w-full bg-gradient-to-br ${getGradient(course.title)} relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                    <BookOpen className="w-16 h-16 text-white" />
                                </div>
                                {/* Floating Badge */}
                                <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full border border-white/10 shadow-sm flex items-center gap-1">
                                    <Users className="w-3 h-3" /> {course.students_count}
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="mb-4">
                                    <h3 className="font-bold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors" title={course.title}>
                                        {course.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                        By <span className="font-medium text-foreground/80">{course.instructor_name}</span>
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <div className="text-xs text-muted-foreground flex items-center gap-1.5" title="Date Created">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(course.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>

                                    <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleViewStudents(course)}
                                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                            title="View Student Progress"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteId(course.id)}
                                            className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                            title="Delete Course"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Progress Modal */}
            <AnimatePresence>
                {selectedCourse && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                            onClick={() => setSelectedCourse(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-xl shadow-2xl p-0 w-full max-w-2xl z-50 overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">Student Progress</h3>
                                    <p className="text-sm text-muted-foreground"> {selectedCourse.title} • {courseStudents.length} Enrolled</p>
                                </div>
                                <button onClick={() => setSelectedCourse(null)} className="p-2 hover:bg-background/50 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-0 overflow-y-auto flex-1">
                                {loadingStudents ? (
                                    <div className="p-10 text-center text-muted-foreground">Loading student data...</div>
                                ) : courseStudents.length === 0 ? (
                                    <div className="p-10 text-center text-muted-foreground flex flex-col items-center gap-2">
                                        <Users className="w-8 h-8 opacity-20" />
                                        <p>No students enrolled in this course yet.</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-secondary/30 text-muted-foreground font-medium text-xs sticky top-0 backdrop-blur-md">
                                            <tr>
                                                <th className="px-6 py-3">Student</th>
                                                <th className="px-6 py-3">Progress</th>
                                                <th className="px-6 py-3">Last Active</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {courseStudents.map((student) => (
                                                <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden text-xs">
                                                                {student.avatar ? <img src={student.avatar} className="w-full h-full object-cover" /> : student.name[0]}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-foreground">{student.name}</p>
                                                                <p className="text-xs text-muted-foreground">{student.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="w-full max-w-[140px]">
                                                            <div className="flex justify-between text-xs mb-1.5">
                                                                <span className="font-medium">{(student.progress || 0)}%</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                                                    style={{ width: `${student.progress || 0}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-muted-foreground">
                                                        {student.last_accessed ? new Date(student.last_accessed).toLocaleDateString() : 'Never'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal (Same as before) */}
            <AnimatePresence>
                {deleteId && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                            onClick={() => setDeleteId(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-popover border border-border rounded-xl shadow-2xl p-6 w-full max-w-sm z-50"
                        >
                            <h3 className="text-lg font-bold text-foreground mb-2">Delete Course?</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                This action cannot be undone. All student progress and data associated with this course will be permanently removed.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setDeleteId(null)}
                                    className="px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg shadow-sm transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
