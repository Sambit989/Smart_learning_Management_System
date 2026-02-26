import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, BookOpen, Edit, Trash2, X, ChevronRight, PlayCircle
} from "lucide-react";
import api from "@/services/api";
import { toast } from "sonner";

export default function InstructorCoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [managingCourse, setManagingCourse] = useState<any>(null);
    const [lessons, setLessons] = useState<any[]>([]);
    const [addingLesson, setAddingLesson] = useState(false);
    const [newLesson, setNewLesson] = useState({ title: "", duration: "", type: "video", video_url: "" });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/instructor/courses');
            setCourses(res.data);
        } catch (error) {
            toast.error("Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCourse = async (id: number) => {
        if (!confirm("Are you sure? All lessons will be permanentely lost.")) return;
        try {
            await api.delete(`/instructor/courses/${id}`);
            setCourses(courses.filter(c => c.id !== id));
            toast.success("Course deleted");
        } catch (error) {
            toast.error("Failed to delete course");
        }
    };

    const openLessonManager = async (course: any) => {
        setManagingCourse(course);
        try {
            const res = await api.get(`/instructor/courses/${course.id}/lessons`);
            setLessons(res.data);
        } catch (error) {
            toast.error("Failed to load lessons");
        }
    };

    const handleAddLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post(`/instructor/courses/${managingCourse.id}/lessons`, newLesson);
            setLessons([...lessons, res.data]);
            setAddingLesson(false);
            setNewLesson({ title: "", duration: "", type: "video", video_url: "" });
            toast.success("Lesson added!");
        } catch (error) {
            toast.error("Failed to add lesson");
        }
    };

    const handleDeleteLesson = async (id: number) => {
        try {
            await api.delete(`/instructor/lessons/${id}`);
            setLessons(lessons.filter(l => l.id !== id));
            toast.success("Lesson removed");
        } catch (error) {
            toast.error("Failed to delete lesson");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-black text-foreground tracking-tight">My Courses</h1>
                <p className="text-muted-foreground font-medium">Detailed view of your curriculum and lessons</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <div key={course.id} className="glass-card rounded-3xl overflow-hidden border border-border/40 shadow-lg group hover:shadow-2xl transition-all">
                        <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 relative flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-primary opacity-20" />
                            <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-background/80 backdrop-blur-md text-[10px] font-black uppercase tracking-widest">
                                {course.category || 'Development'}
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-foreground mb-2">{course.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-6 font-medium">
                                {course.description}
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-border/40">
                                <button
                                    onClick={() => openLessonManager(course)}
                                    className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-bold text-xs hover:bg-primary hover:text-white transition-all"
                                >
                                    Manage Lessons
                                </button>
                                <button
                                    onClick={() => handleDeleteCourse(course.id)}
                                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {courses.length === 0 && (
                    <div className="col-span-full py-20 text-center glass-card rounded-[40px] border-2 border-dashed border-border/40">
                        <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground font-bold">No courses yet. Start by creating one from the Dashboard!</p>
                    </div>
                )}
            </div>

            {/* Lesson Manager Overlay */}
            <AnimatePresence>
                {managingCourse && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setManagingCourse(null)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl glass-card rounded-[40px] border border-border/40 shadow-2xl p-8 max-h-[80vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-foreground">Manage Lessons</h2>
                                    <p className="text-sm text-muted-foreground">{managingCourse.title}</p>
                                </div>
                                <button onClick={() => setManagingCourse(null)} className="p-2 rounded-full hover:bg-secondary"><X className="w-6 h-6" /></button>
                            </div>

                            <div className="space-y-4 mb-8">
                                {lessons.map((lesson, idx) => (
                                    <div key={lesson.id} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border/40 group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center font-bold text-xs">{idx + 1}</div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{lesson.title}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{lesson.type} • {lesson.duration}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteLesson(lesson.id)} className="p-2 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {!addingLesson ? (
                                <button onClick={() => setAddingLesson(true)} className="w-full py-4 rounded-2xl border-2 border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary">
                                    <Plus className="w-5 h-5" /> Add New Lesson
                                </button>
                            ) : (
                                <form onSubmit={handleAddLesson} className="space-y-4 p-6 rounded-2xl bg-primary/5 border border-primary/20">
                                    <div className="grid grid-cols-2 gap-4">
                                        <input required placeholder="Lesson Title" value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })} className="col-span-2 bg-background border border-border/50 rounded-xl px-4 py-3 text-sm" />
                                        <input required placeholder="Duration (e.g. 10:00)" value={newLesson.duration} onChange={e => setNewLesson({ ...newLesson, duration: e.target.value })} className="bg-background border border-border/50 rounded-xl px-4 py-3 text-sm" />
                                        <select value={newLesson.type} onChange={e => setNewLesson({ ...newLesson, type: e.target.value })} className="bg-background border border-border/50 rounded-xl px-4 py-3 text-sm">
                                            <option value="video">Video</option>
                                            <option value="quiz">Quiz</option>
                                            <option value="practice">Practice</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="submit" className="flex-1 py-3 bg-primary text-white font-bold rounded-xl text-sm">Save Lesson</button>
                                        <button type="button" onClick={() => setAddingLesson(false)} className="px-6 py-3 bg-secondary rounded-xl font-bold text-sm">Cancel</button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
