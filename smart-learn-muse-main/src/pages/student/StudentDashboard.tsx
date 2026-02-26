import { useEffect, useState } from "react";
import CourseCard from "@/components/cards/CourseCard";
import GamificationPanel from "@/components/features/GamificationPanel";
import { QuizScoreChart, StudyHoursChart } from "@/components/features/PerformanceCharts";
import StudyPlanner from "@/components/features/StudyPlanner";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, BookOpen, Brain } from "lucide-react";
import api from "@/services/api";
import { useNavigate, useLocation } from "react-router-dom";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtered lists
  const [filteredEnrolled, setFilteredEnrolled] = useState([]);
  const [filteredRecommended, setFilteredRecommended] = useState([]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get("search")?.toLowerCase() || "";

    if (!query) {
      setFilteredEnrolled(enrolledCourses);
      setFilteredRecommended(recommendedCourses);
    } else {
      setFilteredEnrolled(enrolledCourses.filter((c: any) => c.title.toLowerCase().includes(query)));
      setFilteredRecommended(recommendedCourses.filter((c: any) => c.title.toLowerCase().includes(query)));
    }
  }, [location.search, enrolledCourses, recommendedCourses]);


  const [statsData, setStatsData] = useState({
    courses: 0,
    avgScore: "0",
    quizzesDone: 0,
    xp: 0,
    quizTrend: [],
    studyHours: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrolledRes, recommendedRes, allCoursesRes, statsRes] = await Promise.all([
          api.get('/student/courses'),
          api.get('/student/recommendations'),
          api.get('/courses'),
          api.get('/student/stats')
        ]);

        // Transform backend data to match UI component expectation
        const mapCourse = (c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          lessons: 12, // Mock default
          duration: "4h 30m", // Mock default
          rating: 4.8, // Mock default
          // image: Removed default here, handled below
          progress: 0,
          category: "General",
          level: "Beginner",
          difficulty: "Beginner", // Required by CourseCard
          instructor: "StartLearn Instructor",
          skills: ["React", "JavaScript", "Frontend"], // Required by CourseCard
          students: 120, // Required by CourseCard
          recommended: false,
          mlScore: 0,
          ...c,
          image: c.image || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80"
        });

        setEnrolledCourses(enrolledRes.data?.filter(Boolean).map(mapCourse) || []);

        const enrolledIds = new Set((enrolledRes.data || []).map((c: any) => c?.id));

        // If no recommendations (which is likely if ML service is down or new user), show all courses
        let recommendations = [];
        if (recommendedRes.data && Array.isArray(recommendedRes.data) && recommendedRes.data.length > 0) {
          recommendations = recommendedRes.data;
        } else if (allCoursesRes.data && Array.isArray(allCoursesRes.data)) {
          recommendations = allCoursesRes.data;
        }

        // Filter out enrolled courses
        const filteredRecommendations = recommendations
          .filter((c: any) => c && !enrolledIds.has(c.id))
          .map(mapCourse);

        setRecommendedCourses(filteredRecommendations);

        if (statsRes.data) {
          setStatsData(statsRes.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { label: "Courses", value: statsData.courses, icon: BookOpen, color: "bg-primary/10 text-primary" },
    { label: "Avg Score", value: `${statsData.avgScore}%`, icon: TrendingUp, color: "bg-success/10 text-success" },
    { label: "Quizzes Done", value: statsData.quizzesDone, icon: Brain, color: "bg-accent/10 text-accent" },
    { label: "XP Earned", value: statsData.xp.toLocaleString(), icon: Sparkles, color: "bg-xp/10 text-xp" },
  ];

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  const handleEnroll = async (courseId: number) => {
    try {
      await api.post('/student/enroll', { courseId });
      // Refresh data - we can use window.location.reload() for now as it's the simplest way to refresh state
      window.location.reload();
    } catch (error) {
      console.error("Enrollment failed", error);
    }
  };

  const handleView = (courseId: number) => {
    navigate(`/student/course/${courseId}`);
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Here's your learning progress today</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-xl p-4 flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold text-foreground">AI Recommended for You</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {filteredRecommended.length > 0 ? (
                filteredRecommended.slice(0, 4).map((c: any, i) => (
                  <CourseCard key={c.id} course={c} index={i} onEnroll={handleEnroll} />
                ))
              ) : (
                <p className="text-muted-foreground">{location.search ? "No matching courses found." : "No recommendations yet. Complete some courses!"}</p>
              )}
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-4">
            <QuizScoreChart data={statsData.quizTrend || []} />
            <StudyHoursChart data={statsData.studyHours || []} />
          </div>

          {/* Enrolled */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Continue Learning</h2>
            <div className="grid grid-cols-2 gap-4">
              {filteredEnrolled.length > 0 ? (
                filteredEnrolled.map((c: any, i) => (
                  <CourseCard key={c.id} course={c} index={i} isEnrolled={true} onView={handleView} />
                ))
              ) : (
                <p className="text-muted-foreground">{location.search ? "No matching enrolled courses." : "You haven't enrolled in any courses yet."}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <StudyPlanner />
          <GamificationPanel />
        </div>
      </div>
    </div >
  );
}
