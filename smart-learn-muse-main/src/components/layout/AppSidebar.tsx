import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BookOpen, Brain, BarChart3, Trophy, Calendar,
  Settings, ChevronLeft, ChevronRight, Users, FileText, PlusCircle,
  GraduationCap, Sparkles, LogOut, User, Megaphone
} from "lucide-react";

const studentNav = [
  { title: "Dashboard", path: "/student", icon: LayoutDashboard },
  { title: "My Courses", path: "/student/courses", icon: BookOpen },
  { title: "Quizzes", path: "/student/quiz", icon: Brain },
  { title: "Analytics", path: "/student/analytics", icon: BarChart3 },
  { title: "Achievements", path: "/student/achievements", icon: Trophy },
  { title: "Study Planner", path: "/student/planner", icon: Calendar },
  { title: "Profile", path: "/student/profile", icon: User },
];

const instructorNav = [
  { title: "Dashboard", path: "/instructor", icon: LayoutDashboard },
  { title: "My Courses", path: "/instructor/courses", icon: BookOpen },
  { title: "Students", path: "/instructor/students", icon: Users },
  { title: "Analytics", path: "/instructor/analytics", icon: BarChart3 },
];

const adminNav = [
  { title: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { title: "Users", path: "/admin/users", icon: Users },
  { title: "Courses", path: "/admin/courses", icon: BookOpen },
  { title: "Reports", path: "/admin/reports", icon: FileText },
  { title: "Notifications", path: "/admin/notifications", icon: Megaphone },
];

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { role, user, logout } = useAuth();
  const location = useLocation();

  const navItems = (() => {
    switch (role) {
      case "student": return studentNav;
      case "instructor": return instructorNav;
      case "admin": return adminNav;
      default: return []; // Safe default: Show nothing if role is unknown
    }
  })();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-40 flex flex-col"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <h1 className="text-sm font-bold text-sidebar-foreground">SmartLearn</h1>
              <p className="text-xs text-sidebar-muted">AI Powered</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                ? "gradient-primary text-primary-foreground shadow-md"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "" : "text-sidebar-muted group-hover:text-sidebar-foreground"}`} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 flex-shrink-0 text-sidebar-muted group-hover:text-red-500" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* User info */}
      {!collapsed && user && (
        <NavLink
          to={role === 'student' ? "/student/profile" : "#"}
          className="p-4 border-t border-sidebar-border hover:bg-sidebar-accent transition-colors block"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center text-lg">
              {user.avatar}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-xs text-sidebar-muted capitalize">{user.role}</p>
            </div>
          </div>
        </NavLink>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
}
