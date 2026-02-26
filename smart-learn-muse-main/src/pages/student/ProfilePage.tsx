import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    User, Mail, Camera, Shield, Bell, LogOut,
    Check, Edit2, Sparkles, Trophy, Calendar,
    ChevronRight, Save, X
} from "lucide-react";
import api from "@/services/api";
import { toast } from "sonner";

const avatars = ["🎓", "👨‍🎓", "👩‍🎓", "👨‍💻", "👩‍💻", "🤖", "🚀", "🌟", "🦁", "🦊", "🐼", "🐨"];

export default function ProfilePage() {
    const { user: authUser, logout, updateUser } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState("");
    const [selectedAvatar, setSelectedAvatar] = useState("");
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });
    const [notifs, setNotifs] = useState({ email: true, push: true, streak: true });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/student/profile');
            setProfile(res.data);
            setName(res.data.name);
            setSelectedAvatar(res.data.avatar);
        } catch (error) {
            console.error("Failed to fetch profile", error);
            toast.error("Failed to load profile settings");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            toast.error("Passwords do not match!");
            return;
        }
        toast.success("Security settings updated!");
        setActiveTab(null);
        setPasswords({ old: "", new: "", confirm: "" });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.put('/student/profile', { name, avatar: selectedAvatar });
            setProfile(res.data);
            setIsEditing(false);
            toast.success("Profile updated successfully!");
            updateUser({ name: res.data.name, avatar: res.data.avatar });
        } catch (error) {
            console.error("Failed to update profile", error);
            toast.error("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header Profile Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-3xl p-8 relative overflow-hidden group border border-border/40 shadow-xl"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-[80px] -ml-24 -mb-24" />

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full bg-secondary/50 flex items-center justify-center text-6xl shadow-inner border-4 border-background overflow-hidden">
                            <motion.span layoutId="avatar-icon">{selectedAvatar}</motion.span>
                        </div>
                        {isEditing && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 w-full h-full rounded-full bg-black/20 flex items-center justify-center pointer-events-none"
                            >
                                <Camera className="w-8 h-8 text-white opacity-50" />
                            </motion.div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        {isEditing ? (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-background/50 border-2 border-primary/20 rounded-xl px-4 py-2 text-2xl font-bold w-full max-w-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                                />
                                <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                                    {avatars.map(av => (
                                        <button
                                            key={av}
                                            onClick={() => setSelectedAvatar(av)}
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-90
                        ${selectedAvatar === av ? 'bg-primary/20 ring-2 ring-primary border-transparent shadow-lg scale-110' : 'bg-secondary/30 border border-border/50 hover:bg-secondary/50'}
                      `}
                                        >
                                            {av}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center justify-center md:justify-start gap-3">
                                    {profile.name}
                                    <div className="w-6 h-6 rounded-md bg-xp/10 text-xp text-[10px] flex items-center justify-center font-bold">
                                        Lvl {profile.level}
                                    </div>
                                </h1>
                                <p className="text-muted-foreground font-medium mt-1 flex items-center justify-center md:justify-start gap-2">
                                    <Mail className="w-4 h-4" />
                                    {profile.email}
                                </p>
                            </>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 min-w-[140px]">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full px-6 py-3 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group/btn"
                            >
                                <Edit2 className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex flex-col gap-2 w-full">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full px-6 py-3 rounded-2xl bg-success text-white font-bold text-sm shadow-lg shadow-success/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? "Saving..." : "Save"}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setName(profile.name);
                                        setSelectedAvatar(profile.avatar);
                                    }}
                                    className="w-full px-6 py-3 rounded-2xl bg-secondary/50 text-foreground font-bold text-sm hover:bg-secondary transition-all flex items-center justify-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Stats and Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card rounded-3xl p-6 border border-border/40 shadow-lg flex flex-col items-center text-center group"
                >
                    <div className="w-14 h-14 rounded-2xl bg-xp/10 flex items-center justify-center text-xp mb-4 group-hover:scale-110 transition-transform">
                        <Sparkles className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground">{profile.xp?.toLocaleString()}</h3>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Total XP Points</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card rounded-3xl p-6 border border-border/40 shadow-lg flex flex-col items-center text-center group"
                >
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
                        <Trophy className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground">{profile.streak} Days</h3>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Record Streak</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card rounded-3xl p-6 border border-border/40 shadow-lg flex flex-col items-center text-center group"
                >
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                        <Calendar className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground">
                        {profile.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'N/A'}
                    </h3>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Member Since</p>
                </motion.div>
            </div>

            {/* Profile Settings Options */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card rounded-3xl overflow-hidden border border-border/40 shadow-xl"
            >
                <div className="p-6 border-b border-border/40 bg-secondary/10 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-foreground">Account Settings</h3>
                    {activeTab && (
                        <button onClick={() => setActiveTab(null)} className="text-xs font-bold text-primary hover:underline">Back to Menu</button>
                    )}
                </div>

                <div className="p-1">
                    <AnimatePresence mode="wait">
                        {!activeTab ? (
                            <motion.div
                                key="menu"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="divide-y divide-border/40"
                            >
                                {[
                                    { id: 'notif', icon: Bell, title: "Notifications", desc: "Manage your alert preferences", color: "text-orange-500" },
                                    { id: 'security', icon: Shield, title: "Privacy & Security", desc: "Change password and protect account", color: "text-primary" },
                                    { id: 'logout', icon: LogOut, title: "Logout", desc: "Sign out of your active session", color: "text-destructive", action: logout },
                                ].map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={() => item.id === 'logout' ? item.action?.() : setActiveTab(item.id)}
                                        className="w-full p-6 flex items-center justify-between hover:bg-secondary/30 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center ${item.color}`}>
                                                <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-foreground">{item.title}</p>
                                                <p className="text-xs text-muted-foreground font-medium">{item.desc}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ))}
                            </motion.div>
                        ) : activeTab === 'notif' ? (
                            <motion.div
                                key="notif"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="p-6 space-y-6"
                            >
                                {Object.entries(notifs).map(([key, val]) => (
                                    <div key={key} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold capitalize">{key} Notifications</p>
                                            <p className="text-xs text-muted-foreground">Receive alerts about your {key} activity</p>
                                        </div>
                                        <button
                                            onClick={() => setNotifs(prev => ({ ...prev, [key]: !val }))}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${val ? 'bg-primary' : 'bg-secondary'}`}
                                        >
                                            <motion.div
                                                animate={{ x: val ? 24 : 2 }}
                                                className="w-5 h-5 bg-white rounded-full absolute top-0.5"
                                            />
                                        </button>
                                    </div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.form
                                key="security"
                                onSubmit={handlePasswordChange}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="p-6 space-y-4"
                            >
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Current Password</label>
                                    <input
                                        required
                                        type="password"
                                        value={passwords.old}
                                        onChange={(e) => setPasswords(prev => ({ ...prev, old: e.target.value }))}
                                        className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">New Password</label>
                                        <input
                                            required
                                            type="password"
                                            value={passwords.new}
                                            onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                                            className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Confirm New</label>
                                        <input
                                            required
                                            type="password"
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                                            className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
                                >
                                    Update Security Settings
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
