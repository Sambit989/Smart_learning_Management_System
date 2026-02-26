import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, MoreVertical, Ban, CheckCircle, Shield, GraduationCap, User, PlusCircle } from "lucide-react";
import api from "@/services/api";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "student" });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (error) {
            console.error("Error fetching users", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (userId: number) => {
        try {
            await api.post('/admin/users/status', { userId });
            setUsers(users.map(u =>
                u.id === userId ? { ...u, status: u.status === 'active' ? 'banned' : 'active' } : u
            ));
        } catch (error) {
            console.error("Error updating status", error);
        }
    };

    const filteredUsers = users.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <Shield className="w-4 h-4 text-purple-500" />;
            case 'instructor': return <GraduationCap className="w-4 h-4 text-blue-500" />;
            default: return <User className="w-4 h-4 text-gray-500" />;
        }
    };

    const handleCreateUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            alert("Name, email and password are required.");
            return;
        }
        setIsCreating(true);
        try {
            await api.post('/admin/users/create', newUser);
            setShowCreateModal(false);
            setNewUser({ name: "", email: "", password: "", role: "student" });
            fetchUsers();
        } catch (error) {
            console.error("Error creating user", error);
            alert("Failed to create user.");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-foreground">User Management</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage users, roles, and account status</p>
            </motion.div>

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <div className="flex gap-2">
                    <div className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium flex items-center gap-2">
                        <Users className="w-4 h-4" /> Total: {users.length}
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                        <PlusCircle className="w-4 h-4" /> Create User
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary/50 text-muted-foreground font-medium uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Stats</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-primary/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                                                {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : <span className="text-lg">👤</span>}
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 capitalize">
                                            {getRoleIcon(user.role)}
                                            <span className="text-foreground">{user.role}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1 text-xs">
                                            <p className="text-warning">⚡ {user.xp || 0} XP</p>
                                            <p className="text-info">🔥 {user.streak || 0} Day Streak</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${user.status === 'banned'
                                            ? "bg-destructive/10 text-destructive border-destructive/20"
                                            : "bg-success/10 text-success border-success/20"
                                            }`}>
                                            {user.status === 'banned' ? 'Banned' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => toggleStatus(user.id)}
                                            className={`p-2 rounded-lg transition-colors ${user.status === 'banned'
                                                ? "bg-success/10 text-success hover:bg-success/20"
                                                : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                                }`}
                                            title={user.status === 'banned' ? "Activate User" : "Ban User"}
                                        >
                                            {user.status === 'banned' ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            No users found matching "{search}"
                        </div>
                    )}
                </div>
            </div>

            {/* Create User Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-border"
                        >
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-4 text-foreground">Create New User</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground block mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            value={newUser.name}
                                            onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground block mb-1">Email</label>
                                        <input
                                            type="email"
                                            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            value={newUser.email}
                                            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground block mb-1">Password</label>
                                        <input
                                            type="password"
                                            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            value={newUser.password}
                                            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground block mb-1">Role</label>
                                        <select
                                            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            value={newUser.role}
                                            onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                        >
                                            <option value="student">Student</option>
                                            <option value="instructor">Instructor</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                        disabled={isCreating}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateUser}
                                        disabled={isCreating}
                                        className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isCreating && <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />}
                                        Create User
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
