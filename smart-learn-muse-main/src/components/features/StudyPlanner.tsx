import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Circle, Clock, BookOpen, Brain, Code, Plus, Send, X, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/services/api";

interface StudyPlannerProps {
  isFullPage?: boolean;
}

export default function StudyPlanner({ isFullPage = false }: StudyPlannerProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formattedDate = selectedDate instanceof Date && !isNaN(selectedDate.getTime())
    ? selectedDate.toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchTasks();
  }, [formattedDate]);

  const toMinutes = (t: string) => {
    if (!t) return 0;
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const parse12hToMinutes = (t12: string) => {
    if (!t12 || t12 === "Flexible") return -1;
    try {
      const [timePart, period] = t12.split(' ');
      if (!timePart) return -1;
      let [h, m] = timePart.split(':').map(Number);
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return h * 60 + (m || 0);
    } catch (e) { return -1; }
  };

  const sortTasks = (taskList: any[]) => {
    if (!Array.isArray(taskList)) return [];
    return [...taskList].sort((a, b) => {
      const timeA = a.time || "";
      const timeB = b.time || "";
      const startA = parse12hToMinutes(timeA.split(' - ')[0]);
      const startB = parse12hToMinutes(timeB.split(' - ')[0]);
      if (startA === -1) return 1;
      if (startB === -1) return -1;
      return startA - startB;
    });
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/study-plan?date=${formattedDate}`);
      setTasks(sortTasks(res.data));
    } catch (error) {
      console.error("Failed to fetch study plan", error);
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (id: number) => {
    const updatedTasks = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setTasks(updatedTasks);
    try {
      await api.patch(`/study-plan/${id}/toggle`);
    } catch (error) {
      console.error("Failed to toggle task", error);
      // Revert
      setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newTask.trim()) return;

    if (startTime && endTime) {
      const startMin = toMinutes(startTime);
      const endMin = toMinutes(endTime);

      if (endMin <= startMin) {
        setError("End time must be after start time");
        return;
      }

      const hasOverlap = tasks.some(task => {
        if (!task.time || task.time === "Flexible") return false;
        const [existingStartStr, existingEndStr] = task.time.split(' - ');
        if (!existingStartStr || !existingEndStr) return false;
        const existingStart = parse12hToMinutes(existingStartStr);
        const existingEnd = parse12hToMinutes(existingEndStr);
        return (startMin < existingEnd && endMin > existingStart);
      });

      if (hasOverlap) {
        setError("Time conflict! This slot is already booked.");
        return;
      }
    }

    let timeDisplay = "Flexible";
    if (startTime && endTime) {
      const formatTime = (t: string) => {
        const [h, m] = t.split(':');
        const hour = parseInt(h);
        const suffix = hour >= 12 ? 'PM' : 'AM';
        const h12 = hour % 12 || 12;
        return `${h12}:${m} ${suffix}`;
      };
      timeDisplay = `${formatTime(startTime)} - ${formatTime(endTime)}`;
    }

    try {
      const res = await api.post('/study-plan', {
        title: newTask,
        time: timeDisplay,
        category: 'General',
        date: formattedDate
      });
      if (res.data) {
        setTasks(sortTasks([...tasks, res.data]));
        setNewTask("");
        setStartTime("");
        setEndTime("");
        setIsAdding(false);
      }
    } catch (error) {
      console.error("Failed to add task", error);
      setError("Failed to create task. Please try again.");
    }
  };

  const removeTask = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Calendar Logic
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const [calDate, setCalDate] = useState(new Date());

  const generateMonthDays = () => {
    const year = calDate.getFullYear();
    const month = calDate.getMonth();
    const days = [];
    const firstDay = firstDayOfMonth(year, month);
    const totalDays = daysInMonth(year, month);

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(calDate);
    newDate.setMonth(calDate.getMonth() + offset);
    setCalDate(newDate);
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
  };

  if (loading && tasks.length === 0) return (
    <div className="glass-card p-4 h-[480px] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-muted-foreground">Loading Schedule...</p>
      </div>
    </div>
  );

  const completed = tasks.filter((t) => t.completed).length;
  const percent = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <div className={`flex flex-col gap-6 w-full ${isFullPage ? "lg:flex-row" : ""}`}>

      {isFullPage && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-80 glass-card p-5 rounded-2xl border border-border/40 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-foreground">
              {calDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h4>
            <div className="flex gap-1">
              <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-secondary rounded-lg transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => changeMonth(1)} className="p-1 hover:bg-secondary rounded-lg transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <div key={d} className="text-[10px] font-black text-muted-foreground text-center py-1 uppercase">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {generateMonthDays().map((date, i) => (
              <div key={i} className="aspect-square flex items-center justify-center">
                {date && (
                  <button
                    onClick={() => setSelectedDate(date)}
                    className={`w-full h-full text-xs font-semibold rounded-lg transition-all flex flex-col items-center justify-center gap-0.5 relative
                      ${isSelected(date) ? "bg-primary text-white shadow-lg shadow-primary/30" : "hover:bg-secondary text-foreground"}
                      ${isToday(date) && !isSelected(date) ? "text-primary border border-primary/30" : ""}
                    `}
                  >
                    {date.getDate()}
                    {isToday(date) && <div className={`w-1 h-1 rounded-full ${isSelected(date) ? "bg-white" : "bg-primary"}`} />}
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className={`flex-1 glass-card rounded-2xl p-6 flex flex-col min-h-[500px] border border-border/40 shadow-xl bg-card/30 backdrop-blur-md relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10" />

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-black text-foreground tracking-tight truncate">
                {isToday(selectedDate) ? "Today's Schedule" : selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric' })}
              </h3>
              <p className="text-sm text-muted-foreground font-bold flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                <span className={`w-2 h-2 rounded-full ${tasks.length > 0 && completed === tasks.length ? "bg-success" : "bg-primary animate-pulse"}`} />
                {completed}/{tasks.length} tasks done
              </p>
            </div>
          </div>

          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/10" />
              <motion.circle
                cx="18" cy="18" r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${percent}, 100`}
                strokeLinecap="round"
                className="text-primary transition-all duration-1000"
                initial={{ strokeDasharray: "0, 100" }}
                animate={{ strokeDasharray: `${percent}, 100` }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-black">
              {percent}%
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 mb-8 pr-2 custom-scrollbar relative z-10">
          <AnimatePresence mode="popLayout" initial={false}>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -20 }}
                onClick={() => toggle(task.id)}
                className={`group relative flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border-2 
                  ${task.completed
                    ? "bg-success/5 border-success/20 opacity-60 grayscale-[0.5]"
                    : "bg-background/40 border-border/50 hover:border-primary/40 hover:bg-background/80 hover:shadow-xl hover:-translate-y-0.5"
                  }`}
              >
                <div className={`w-6 h-6 rounded-xl border-2 flex-shrink-0 flex items-center justify-center transition-all duration-300 ${task.completed ? "bg-success border-success rotate-12 scale-110" : "border-muted-foreground/30 group-hover:border-primary group-hover:rotate-12"}`}>
                  {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[15px] font-bold transition-all truncate ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 opacity-80">
                    <div className="flex items-center gap-1.5 text-[11px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {task.time || "Flexible"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => removeTask(task.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all hover:rotate-90 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {!loading && tasks.length === 0 && !isAdding && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 opacity-20 text-center grayscale"
            >
              <Brain className="w-16 h-16 mb-4 text-primary" />
              <p className="text-sm font-black uppercase tracking-[0.2em]">Clear Schedule</p>
              <p className="text-xs font-medium mt-2">Ready for a new goal?</p>
            </motion.div>
          )}
        </div>

        {isAdding ? (
          <form onSubmit={addTask} className="p-6 rounded-3xl bg-card border-2 border-primary/20 animate-in slide-in-from-bottom-8 duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.1)] space-y-5 relative z-20">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-primary uppercase tracking-widest ml-1">Learning Goal</label>
              <input
                autoFocus
                required
                type="text"
                placeholder="What are we mastering today?"
                value={newTask}
                onChange={(e) => { setNewTask(e.target.value); setError(null); }}
                className="w-full bg-secondary/30 border border-border/50 rounded-2xl px-5 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold placeholder:text-muted-foreground/50 hover:bg-secondary/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-1 block text-center">Starts At</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => { setStartTime(e.target.value); setError(null); }}
                  className="w-full bg-secondary/30 border border-border/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-center hover:bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-1 block text-center">Ends At</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => { setEndTime(e.target.value); setError(null); }}
                  className="w-full bg-secondary/30 border border-border/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-center hover:bg-secondary/50"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs bg-destructive/10 text-destructive p-3 rounded-xl font-bold text-center flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setIsAdding(false); setError(null); }}
                className="flex-1 py-4 rounded-2xl text-sm font-black text-muted-foreground hover:bg-secondary transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-[2] py-4 rounded-2xl bg-primary text-white font-black text-sm hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Send className="w-5 h-5" />
                Schedule Goal
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-4 w-full py-5 bg-primary text-white rounded-3xl text-base font-black shadow-[0_15px_30px_-10px_rgba(24,94,224,0.4)] hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 group relative overflow-hidden z-10"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform flex-shrink-0">
              <Plus className="w-5 h-5" />
            </div>
            Create Study Goal
          </button>
        )}
      </div>
    </div>
  );
}
