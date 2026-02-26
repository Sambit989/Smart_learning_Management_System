import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Activity, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import api from "@/services/api";

export default function AdminReportsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        try {
            const res = await api.get('/admin/reports');
            setData(res.data);
        } catch (error) {
            console.error("Error fetching reports", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                    System Reports
                </h1>
                <p className="text-muted-foreground mt-2">Real-time analytics, logs, and system health status.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity Feed */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                    className="glass-card rounded-2xl p-6 border border-border/50 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Activity className="w-5 h-5 text-primary" />
                            </div>
                            Student Activity
                        </h3>
                        <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md">Live feed</span>
                    </div>

                    <div className="space-y-0 relative">
                        {/* Timeline Line */}
                        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border z-0" />

                        {data?.recentActivity?.slice(0, 8).map((act: any, i: number) => (
                            <div key={act.id || i} className="relative z-10 flex items-start gap-4 p-3 rounded-xl hover:bg-secondary/30 transition-colors group">
                                <div className="w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow-sm flex-shrink-0 mt-1">
                                    <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-foreground">
                                        {act.course === 'General Platform Learning' ? (
                                            <><span className="font-semibold">{act.user}</span> was active on the <span className="font-medium text-primary">platform</span></>
                                        ) : (
                                            <><span className="font-semibold">{act.user}</span> studied <span className="font-medium text-primary">{act.course}</span></>
                                        )}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {new Date(act.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                        </span>
                                        <span className="text-xs font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                            {act.time_spent_minutes}m
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {(!data?.recentActivity || data.recentActivity.length === 0) && (
                            <div className="text-center py-10 text-muted-foreground">
                                <Activity className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p>No recent activity recorded.</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* System Health / Logs */}
                <div className="space-y-6">
                    {/* Health Status Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div whileHover={{ scale: 1.02 }} className="bg-success/10 border border-success/20 p-4 rounded-xl">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-medium text-success uppercase tracking-wider">System Status</p>
                                    <h4 className="text-xl font-bold text-success-foreground mt-1">{data?.pendingIssues === 0 ? "Healthy" : "Needs Review"}</h4>
                                </div>
                                <CheckCircle className="w-6 h-6 text-success" />
                            </div>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} className="bg-warning/10 border border-warning/20 p-4 rounded-xl">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-medium text-warning uppercase tracking-wider">Pending Issues</p>
                                    <h4 className="text-xl font-bold text-warning-foreground mt-1">{data?.pendingIssues || 0} Alerts</h4>
                                </div>
                                <AlertTriangle className="w-6 h-6 text-warning" />
                            </div>
                        </motion.div>
                    </div>

                    {/* Logs List */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        className="glass-card rounded-2xl p-6 border border-border/50 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <div className="p-2 bg-accent/10 rounded-lg">
                                    <FileText className="w-5 h-5 text-accent" />
                                </div>
                                System Logs
                            </h3>
                            <button className="text-xs font-medium text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                                <Download className="w-3.5 h-3.5" /> Export
                            </button>
                        </div>

                        <div className="space-y-3">
                            {data?.systemLogs?.length > 0 ? (
                                data.systemLogs.map((log: any, i: number) => {
                                    const isError = log.type === 'alert' || log.type === 'warning';
                                    const Icon = isError ? AlertTriangle : (log.type === 'success' ? CheckCircle : FileText);
                                    const colorTheme = isError ? 'text-destructive bg-destructive/10 border-destructive/20' :
                                        (log.type === 'success' ? 'text-success bg-success/10 border-success/20' : 'text-foreground bg-secondary/20 border-border/50');

                                    return (
                                        <div key={log.id || i} className={`flex items-center gap-3 p-3 rounded-lg border ${colorTheme}`}>
                                            <Icon className="w-4 h-4 flex-shrink-0" />
                                            <span className="text-sm">{log.title} - {log.message}</span>
                                            <span className="ml-auto text-xs opacity-70 flex-shrink-0">
                                                {new Date(log.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-6 text-muted-foreground text-sm">No system logs available.</div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
