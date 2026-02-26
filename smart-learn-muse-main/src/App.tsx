import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth, UserRole } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Auth
import LoginPage from "@/pages/auth/LoginPage";

// Student Pages
import StudentDashboard from "@/pages/student/StudentDashboard";
import QuizPage from "@/pages/student/QuizPage";
import CoursePlayer from "@/pages/student/CoursePlayer";
import MyCourses from "@/pages/student/MyCourses";
import AnalyticsPage from "@/pages/student/AnalyticsPage";
import AchievementsPage from "@/pages/student/AchievementsPage";
import StudyPlannerPage from "@/pages/student/StudyPlannerPage";
import ProfilePage from "@/pages/student/ProfilePage";

// Instructor Pages
import InstructorDashboard from "@/pages/instructor/InstructorDashboard";
import InstructorStudentsPage from "@/pages/instructor/InstructorStudentsPage";
import InstructorAnalyticsPage from "@/pages/instructor/InstructorAnalyticsPage";
import InstructorCoursesPage from "@/pages/instructor/InstructorCoursesPage";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminCoursesPage from "@/pages/admin/AdminCoursesPage";
import AdminReportsPage from "@/pages/admin/AdminReportsPage";
import AdminNotificationsPage from "@/pages/admin/AdminNotificationsPage";

// Common
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRole }: { children: JSX.Element, allowedRole: UserRole }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== allowedRole) {
    return <Navigate to={`/${user?.role || 'login'}`} replace />;
  }

  return children;
};

const RootRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  if (isAuthenticated && user?.role) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  return <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Student Routes */}
            <Route path="/student" element={<ProtectedRoute allowedRole="student"><DashboardLayout><StudentDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/student/courses" element={<ProtectedRoute allowedRole="student"><DashboardLayout><MyCourses /></DashboardLayout></ProtectedRoute>} />
            <Route path="/student/quiz" element={<ProtectedRoute allowedRole="student"><DashboardLayout><QuizPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/student/analytics" element={<ProtectedRoute allowedRole="student"><DashboardLayout><AnalyticsPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/student/achievements" element={<ProtectedRoute allowedRole="student"><DashboardLayout><AchievementsPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/student/planner" element={<ProtectedRoute allowedRole="student"><DashboardLayout><StudyPlannerPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/student/profile" element={<ProtectedRoute allowedRole="student"><DashboardLayout hideNavbar={true}><ProfilePage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/student/course/:id" element={<ProtectedRoute allowedRole="student"><DashboardLayout><CoursePlayer /></DashboardLayout></ProtectedRoute>} />

            {/* Instructor Routes */}
            <Route path="/instructor" element={<ProtectedRoute allowedRole="instructor"><DashboardLayout><InstructorDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/instructor/courses" element={<ProtectedRoute allowedRole="instructor"><DashboardLayout><InstructorCoursesPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/instructor/students" element={<ProtectedRoute allowedRole="instructor"><DashboardLayout><InstructorStudentsPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/instructor/analytics" element={<ProtectedRoute allowedRole="instructor"><DashboardLayout><InstructorAnalyticsPage /></DashboardLayout></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><DashboardLayout><AdminDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRole="admin"><DashboardLayout><AdminUsersPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/courses" element={<ProtectedRoute allowedRole="admin"><DashboardLayout><AdminCoursesPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRole="admin"><DashboardLayout><AdminReportsPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute allowedRole="admin"><DashboardLayout><AdminNotificationsPage /></DashboardLayout></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
