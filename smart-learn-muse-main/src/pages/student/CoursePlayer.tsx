import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/api";
import { PlayCircle, CheckCircle, Lock, ChevronLeft, FileText, Download } from "lucide-react";
import { motion } from "framer-motion";

export default function CoursePlayer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeLesson, setActiveLesson] = useState(0);

    const [lessons, setLessons] = useState<any[]>([]);

    useEffect(() => {
        const fetchCourseAndLessons = async () => {
            try {
                const [courseRes, lessonsRes] = await Promise.all([
                    api.get(`/courses/${id}`),
                    api.get(`/courses/${id}/lessons`)
                ]);
                setCourse(courseRes.data);
                setLessons(lessonsRes.data);
            } catch (error) {
                console.error("Failed to load course", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchCourseAndLessons();
    }, [id]);

    if (loading) return <div className="p-8 text-center">Loading course content...</div>;
    if (!course) return <div className="p-8 text-center">Course not found</div>;

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            {/* Sidebar - Lesson List */}
            <div className="w-80 border-r border-border bg-card/50 overflow-y-auto hidden md:block">
                <div className="p-4 border-b border-border">
                    <button
                        onClick={() => navigate('/student')}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                    <h2 className="font-semibold text-lg leading-tight">{course.title}</h2>
                    <p className="text-xs text-muted-foreground mt-1">5 Lessons • 1h 15m</p>
                </div>
                <div className="py-2">
                    {lessons.map((lesson, idx) => (
                        <button
                            key={lesson.id}
                            onClick={() => setActiveLesson(idx)}
                            className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-secondary/50 transition-colors ${activeLesson === idx ? "bg-secondary border-r-2 border-primary" : ""
                                }`}
                        >
                            <div className="mt-1">
                                {idx < activeLesson ? (
                                    <CheckCircle className="w-4 h-4 text-success" />
                                ) : idx === activeLesson ? (
                                    <PlayCircle className="w-4 h-4 text-primary" />
                                ) : (
                                    <Lock className="w-4 h-4 text-muted-foreground" />
                                )}
                            </div>
                            <div>
                                <p className={`text-sm font-medium ${activeLesson === idx ? "text-foreground" : "text-muted-foreground"}`}>
                                    {idx + 1}. {lesson.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-border text-muted-foreground uppercase">{lesson.type}</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content - Video Player */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-6">
                    <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative group">
                        {/* Mock Video Player */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-16 h-16 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg"
                            >
                                <PlayCircle className="w-8 h-8 ml-1" />
                            </motion.button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="text-white text-sm font-medium">{lessons[activeLesson].title}</div>
                            <div className="text-white/70 text-xs">{lessons[activeLesson].duration}</div>
                        </div>
                    </div>

                    <div className="mt-8 space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">{lessons[activeLesson].title}</h1>
                            <p className="text-muted-foreground mt-2">{course.description}</p>
                        </div>

                        <div className="flex gap-4 border-b border-border pb-4">
                            <button className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Lecture Notes
                            </button>
                            <button className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm flex items-center gap-2">
                                <Download className="w-4 h-4" /> Resources
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
