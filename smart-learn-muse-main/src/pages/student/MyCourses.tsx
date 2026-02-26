import { useEffect, useState } from "react";
import CourseCard from "@/components/cards/CourseCard";
import api from "@/services/api";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MyCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get('/student/courses');
                const mapCourse = (c: any) => ({
                    id: c.id,
                    title: c.title,
                    description: c.description,
                    lessons: 12, // Mock default
                    duration: "4h 30m", // Mock default
                    rating: 4.8, // Mock default
                    // image: "..." removed default here to avoid override issues
                    progress: 0,
                    category: "General",
                    level: "Beginner",
                    difficulty: "Beginner",
                    instructor: "StartLearn Instructor",
                    skills: ["React", "JavaScript", "Frontend"],
                    students: 120,
                    recommended: false,
                    mlScore: 0,
                    ...c,
                    image: c.image || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80"
                });
                setCourses(res.data.map(mapCourse));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleView = (courseId: number) => {
        navigate(`/student/course/${courseId}`);
    };

    if (loading) return <div className="p-8">Loading courses...</div>;

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-primary" />
                    My Courses
                </h1>
                <p className="text-muted-foreground text-sm mt-1">Continue where you left off</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.length > 0 ? (
                    courses.map((c: any, i) => (
                        <CourseCard key={c.id} course={c} index={i} isEnrolled={true} onView={handleView} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        You haven't enrolled in any courses yet.
                    </div>
                )}
            </div>
        </div>
    );
}
