import { useState } from "react";
import { motion } from "framer-motion";
import { Megaphone, Send } from "lucide-react";
import api from "@/services/api";

export default function AdminNotificationsPage() {
    const [broadcastTarget, setBroadcastTarget] = useState("all");
    const [broadcastType, setBroadcastType] = useState("info");
    const [broadcastTitle, setBroadcastTitle] = useState("");
    const [broadcastMessage, setBroadcastMessage] = useState("");
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    const handleBroadcast = async () => {
        if (!broadcastTitle || !broadcastMessage) return;
        setIsBroadcasting(true);
        try {
            await api.post('/admin/broadcast', {
                title: broadcastTitle,
                message: broadcastMessage,
                type: broadcastType,
                audience: broadcastTarget
            });
            alert("Broadcast sent successfully!");
            setBroadcastTitle("");
            setBroadcastMessage("");
        } catch (e) {
            console.error(e);
            alert("Error broadcasting notification.");
        } finally {
            setIsBroadcasting(false);
        }
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-foreground">Broadcast Notifications</h1>
                <p className="text-sm text-muted-foreground mt-1">Send announcements and alerts to specific user segments</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="glass-card rounded-2xl p-6 border border-border/50 shadow-sm max-w-2xl"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <div className="p-2 bg-info/10 rounded-lg">
                            <Megaphone className="w-5 h-5 text-info" />
                        </div>
                        System Broadcast Announcement
                    </h3>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground">Target Audience</label>
                            <select value={broadcastTarget} onChange={e => setBroadcastTarget(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm">
                                <option value="all">All Users</option>
                                <option value="student">Students Only</option>
                                <option value="instructor">Instructors Only</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground">Alert Type</label>
                            <select value={broadcastType} onChange={e => setBroadcastType(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm">
                                <option value="info">Info (Blue)</option>
                                <option value="success">Success (Green)</option>
                                <option value="warning">Warning (Yellow)</option>
                                <option value="alert">Alert (Red)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground">Title</label>
                        <input value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm" placeholder="System Maintenance..." />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground">Message</label>
                        <textarea value={broadcastMessage} onChange={e => setBroadcastMessage(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-none" rows={5} placeholder="The platform will be down at..." />
                    </div>
                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleBroadcast}
                            disabled={!broadcastTitle || !broadcastMessage || isBroadcasting}
                            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {isBroadcasting ? "Sending..." : "Send Broadcast"} <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
