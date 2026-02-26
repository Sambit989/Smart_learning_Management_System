import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import api from "../services/api";

export type UserRole = "student" | "instructor" | "admin";

interface User {
  id?: number;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  updateUser: (newData: Partial<User>) => void;
  checkConnection: () => Promise<boolean>;
}

const defaultUsers: Record<UserRole, User> = {
  student: { name: "Guest Student", email: "guest@student.com", role: "student", avatar: "🎓", xp: 0, level: 1, streak: 0 },
  instructor: { name: "Guest Instructor", email: "guest@instructor.com", role: "instructor", avatar: "👩‍🏫", xp: 0, level: 0, streak: 0 },
  admin: { name: "Guest Admin", email: "guest@admin.com", role: "admin", avatar: "👨‍💼", xp: 0, level: 0, streak: 0 },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<UserRole>("student");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Persist user and role to localStorage to survive refreshes
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setRoleState(parsedUser.role);
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const login = async (email: string, password: string, loginRole: UserRole) => {
    try {
      console.log("Attempting backend login...");
      const response = await api.post('/auth/login', { email, password, role: loginRole });
      console.log("Backend login success:", response.data);

      const { token, user: apiUser } = response.data;
      localStorage.setItem('token', token);

      setUser({
        ...defaultUsers[loginRole], // Keep UI fields like avatar/level for now
        name: apiUser.name,
        email: apiUser.email,
        role: apiUser.role as UserRole,
        id: apiUser.id
      });
      // Save for persistence
      localStorage.setItem('user', JSON.stringify({
        ...defaultUsers[loginRole],
        name: apiUser.name,
        email: apiUser.email,
        role: apiUser.role as UserRole,
        id: apiUser.id
      }));

      setRole(apiUser.role as UserRole);
      setIsAuthenticated(true);
      // alert("Connected to Backend Successfully!");
      return true;

    } catch (error: any) {
      console.error("Backend login failed:", error);

      const errorMessage = error.response?.data?.message || "Login failed";
      alert(`Login Failed: ${errorMessage}`);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (newData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...newData };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const checkConnection = async () => {
    try {
      await api.get('/');
      return true;
    } catch (e) {
      return false;
    }
  }

  return (
    <AuthContext.Provider value={{ user, role, setRole, isAuthenticated, login, logout, updateUser, checkConnection }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
