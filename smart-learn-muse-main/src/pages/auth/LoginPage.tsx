import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { GraduationCap, ArrowRight } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("student@test.com");
  const [password, setPassword] = useState("123456");
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(`/${user.role}`, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async () => {
    const success = await login(email, password, selectedRole);
    if (success) {
      navigate(`/${selectedRole}`);
    }
  };

  const roles: { role: UserRole; icon: string; label: string; desc: string }[] = [
    { role: "student", icon: "🎓", label: "Student", desc: "Access courses, quizzes & AI recommendations" },
    { role: "instructor", icon: "👩‍🏫", label: "Instructor", desc: "Manage courses & monitor students" },
    { role: "admin", icon: "👨‍💼", label: "Admin", desc: "System management & analytics" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={heroBg} alt="Education" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center p-12">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-primary-foreground">SmartLearn</h1>
            </div>
            <h2 className="text-4xl font-bold text-primary-foreground leading-tight mb-4">
              AI-Powered<br />Learning Platform
            </h2>
            <p className="text-primary-foreground/70 max-w-md">
              Personalized courses, adaptive quizzes, and ML-driven recommendations to accelerate your learning journey.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right - Login */}
      <div className="flex-1 flex items-center justify-center p-8 gradient-bg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
            <p className="text-sm text-muted-foreground mt-1">Select your role to continue</p>
          </div>

          <div className="space-y-3">
            {roles.map((r) => (
              <motion.button
                key={r.role}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole(r.role)}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left ${selectedRole === r.role
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border hover:border-primary/30 glass-card"
                  }`}
              >
                <span className="text-3xl">{r.icon}</span>
                <div>
                  <p className="font-semibold text-foreground">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            Sign In <ArrowRight className="w-4 h-4" />
          </motion.button>

          <p className="text-center text-xs text-muted-foreground">
            Demo mode — click Sign In to explore the dashboard <br />
            (Backend connection will be attempted)
          </p>
        </motion.div>
      </div>
    </div>
  );
}
