import { useEffect, useState } from "react";
import { AlertTriangle, Info, CheckCircle, AlertCircle, X, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/services/api";

const iconMap: any = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
  alert: AlertCircle,
};

const colorMap: any = {
  warning: "text-warning bg-warning/10",
  info: "text-info bg-info/10",
  success: "text-success bg-success/10",
  alert: "text-accent bg-accent/10",
};

export default function NotificationPanel({ onClose, onRead }: { onClose: () => void, onRead: () => void }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      onRead();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put(`/notifications/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      onRead();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="absolute right-0 top-12 w-96 glass-card rounded-xl shadow-xl border border-border/50 overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <h3 className="font-semibold text-foreground">Notifications</h3>
        <div className="flex gap-2">
          <button onClick={markAllAsRead} className="p-1 rounded-md hover:bg-secondary text-xs flex items-center gap-1 text-muted-foreground" title="Mark all as read">
            <CheckCheck className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground text-sm">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">No notifications</div>
        ) : (
          notifications.map((n) => {
            const Icon = iconMap[n.type] || Info;
            return (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`p-4 border-b border-border/30 hover:bg-secondary/50 transition-colors cursor-pointer ${!n.is_read ? "bg-primary/5" : ""}`}
              >
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[n.type] || colorMap.info}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                  </div>
                  {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />}
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
