import { performanceData } from "@/data/dummyData";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

export function QuizScoreChart({ data }: { data: any[] }) {
  const chartData = (data || []).map((d, i) => {
    if (typeof d === 'object') return { week: d.week, quizScore: d.score };
    return { week: `W${i + 1}`, quizScore: d };
  });

  if (!data || data.length === 0) {
    return (
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Quiz Performance Trend</h3>
        <div className="h-[200px] flex items-center justify-center text-muted-foreground">No data available</div>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="text-sm font-semibold text-foreground mb-4">Quiz Performance Trend</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="quizGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 15%, 88%)" />
          <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(225, 10%, 45%)" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(225, 10%, 45%)" />
          <Tooltip
            contentStyle={{
              background: "hsl(0, 0%, 100%)",
              border: "1px solid hsl(225, 15%, 88%)",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <Area
            type="monotone"
            dataKey="quizScore"
            stroke="hsl(239, 84%, 67%)"
            fill="url(#quizGrad)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}



export function StudyHoursChart({ data }: { data: any[] }) {
  const [selectedWeek, setSelectedWeek] = useState<any | null>(null);

  const weeklyData = (data || []).map((d, i) => ({
    week: d.week || `W${i + 1}`,
    studyHours: Number(d.hours || d.value || 0),
    original: d
  }));

  const chartData = selectedWeek
    ? selectedWeek.days.map((d: any) => ({ label: d.day, studyHours: Number(d.hours) }))
    : weeklyData;

  const handleBarClick = (data: any) => {
    if (!selectedWeek && data && data.original && data.original.days) {
      setSelectedWeek(data.original);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Weekly Study Hours</h3>
        <div className="h-[200px] flex items-center justify-center text-muted-foreground">No data available</div>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          {selectedWeek ? `Daily Breakdown: ${selectedWeek.week}` : "Weekly Study Hours"}
        </h3>
        {selectedWeek && (
          <button
            onClick={() => setSelectedWeek(null)}
            className="text-xs flex items-center gap-1 text-primary hover:underline"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Weekly
          </button>
        )}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={chartData}
          onClick={(state: any) => {
            if (state && state.activePayload && state.activePayload.length > 0) {
              handleBarClick(state.activePayload[0].payload);
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 15%, 88%)" />
          <XAxis
            dataKey={selectedWeek ? "label" : "week"}
            tick={{ fontSize: 12 }}
            stroke="hsl(225, 10%, 45%)"
          />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(225, 10%, 45%)" />
          <Tooltip
            contentStyle={{
              background: "hsl(0, 0%, 100%)",
              border: "1px solid hsl(225, 15%, 88%)",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <Bar
            dataKey="studyHours"
            fill="hsl(24, 95%, 53%)"
            radius={[4, 4, 0, 0]}
            style={{ cursor: selectedWeek ? "default" : "pointer" }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
