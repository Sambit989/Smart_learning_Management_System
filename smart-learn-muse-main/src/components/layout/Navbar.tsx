import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Bell, Search } from "lucide-react";
import NotificationPanel from "@/components/common/NotificationPanel";
import api from "@/services/api";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      // Fetch from both sources to provide complete suggestions
      const [enrolled, rec] = await Promise.all([
        api.get(`/student/courses?search=${query}`),
        api.get(`/student/recommendations?search=${query}`)
      ]);

      const allResults = [...enrolled.data, ...rec.data];

      // Filter for strictly "related" matches (prioritize Title matches)
      const filtered = allResults
        .filter((c: any) => c.title.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);

      setSuggestions(filtered);
    } catch (err) {
      console.error("Failed to fetch suggestions", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) fetchSuggestions(search);
      else setSuggestions([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const applySearch = (value: string) => {
    const searchParams = new URLSearchParams(location.search);
    if (value.trim()) {
      searchParams.set("search", value);
    } else {
      searchParams.delete("search");
    }
    setSearch(value);
    navigate(`${location.pathname}?${searchParams.toString()}`);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applySearch(search);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data && Array.isArray(res.data)) {
        const unread = res.data.filter((n: any) => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  }

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <header className="sticky top-0 z-30 h-16 glass-card border-b border-border/50 flex items-center justify-between px-6">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setShowSuggestions(false)}
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 w-full mt-2 glass-card rounded-xl border border-border shadow-xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
            {suggestions.map((s) => (
              <div
                key={s.id}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent input onBlur from firing before click
                  applySearch(s.title);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-primary/5 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Search className="w-3 h-3 text-muted-foreground" />
                <span className="font-medium text-foreground">{s.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) fetchUnreadCount();
            }}
            className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <NotificationPanel onClose={() => setShowNotifications(false)} onRead={() => fetchUnreadCount()} />
          )}
        </div>
      </div>
    </header>
  );
}
