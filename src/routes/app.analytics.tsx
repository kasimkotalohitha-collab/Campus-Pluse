import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { useData } from "@/contexts/data-context";

export const Route = createFileRoute("/app/analytics")({
  component: AnalyticsPage,
});

const COLORS = ["#6C63FF", "#8B7FFF", "#4FC3F7", "#4CAF50", "#FFB74D", "#EF5350", "#26C6DA"];

function AnalyticsPage() {
  const { complaints, departments } = useData();

  const byCategory = useMemo(() => {
    const m = new Map<string, number>();
    complaints.forEach((c) => m.set(c.category, (m.get(c.category) ?? 0) + 1));
    return Array.from(m, ([name, value]) => ({ name, value }));
  }, [complaints]);

  const resolution = useMemo(() => {
    const days = 8;
    const arr = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("en", { month: "short", day: "numeric" });
      arr.push({
        day: label,
        submitted: Math.floor(Math.random() * 10) + 3,
        resolved: Math.floor(Math.random() * 8) + 2,
      });
    }
    return arr;
  }, []);

  const workload = departments.map((d) => ({ name: d.name, active: d.workload, done: d.resolved }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Deep insights across categories and teams.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold">Resolution trends (last 8 days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resolution}>
                <defs>
                  <linearGradient id="s" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#6C63FF" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#6C63FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="r" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4CAF50" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#4CAF50" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="submitted" stroke="#6C63FF" fill="url(#s)" strokeWidth={2} />
                <Area type="monotone" dataKey="resolved" stroke="#4CAF50" fill="url(#r)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold">Category distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={90} label>
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold">Department workload</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workload}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} angle={-20} textAnchor="end" height={80} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="active" fill="#6C63FF" radius={[6, 6, 0, 0]} />
                <Bar dataKey="done" fill="#4CAF50" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
