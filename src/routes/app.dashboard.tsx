import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Layers,
  MessageSquarePlus,
  TrendingUp,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/stat-card";
import { ComplaintCard } from "@/components/complaint-card";
import { StatusBadge } from "@/components/status-badge";
import { useAuth } from "@/contexts/auth-context";
import { useData } from "@/contexts/data-context";
import type { Complaint } from "@/types";

export const Route = createFileRoute("/app/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const { complaints } = useData();

  const scoped = useMemo(
    () =>
      user?.role === "admin"
        ? complaints
        : complaints.filter((c) => c.submittedBy === user?.id),
    [complaints, user],
  );

  const stats = useMemo(() => {
    const total = scoped.length;
    const pending = scoped.filter(
      (c) => c.status !== "Resolved" && c.status !== "Rejected",
    ).length;
    const resolved = scoped.filter((c) => c.status === "Resolved").length;
    const high = scoped.filter((c) => c.urgency === "High" || c.urgency === "Critical").length;
    return { total, pending, resolved, high };
  }, [scoped]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {user?.role === "admin" ? "Admin overview" : `Hi, ${user?.name.split(" ")[0]} 👋`}
          </h1>
          <p className="text-sm text-muted-foreground">
            {user?.role === "admin"
              ? "Monitor campus-wide complaints, workload, and resolution health."
              : "Track your complaints, updates, and campus notifications."}
          </p>
        </div>
        <Button
          asChild
          className="gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]"
        >
          <Link to="/app/submit">
            <MessageSquarePlus className="mr-1.5 h-4 w-4" />
            New complaint
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total complaints" value={stats.total} icon={FileText} />
        <StatCard label="Pending" value={stats.pending} icon={Clock} tone="warning" />
        <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle2} tone="success" />
        <StatCard label="High priority" value={stats.high} icon={AlertTriangle} tone="destructive" />
      </div>

      {user?.role === "admin" ? <AdminCharts complaints={scoped} /> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent complaints</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/complaints">View all</Link>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {scoped.slice(0, 6).map((c) => (
              <ComplaintCard key={c.id} complaint={c} />
            ))}
            {scoped.length === 0 && (
              <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
                No complaints yet. Submit your first one.
              </p>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Activity feed</h2>
          </div>
          <ul className="space-y-3">
            {scoped.slice(0, 6).map((c) => (
              <li
                key={c.id}
                className="flex items-start gap-3 rounded-lg border border-border p-3 text-xs"
              >
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Layers className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{c.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusBadge status={c.status} className="text-[10px]" />
                    <span className="text-muted-foreground">
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

const chartColors = ["#6C63FF", "#8B7FFF", "#4FC3F7", "#4CAF50", "#FFB74D", "#EF5350"];

function AdminCharts({ complaints }: { complaints: Complaint[] }) {
  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    complaints.forEach((c) => map.set(c.category, (map.get(c.category) ?? 0) + 1));
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [complaints]);

  const byPriority = useMemo(() => {
    const map = new Map<string, number>();
    complaints.forEach((c) => map.set(c.urgency, (map.get(c.urgency) ?? 0) + 1));
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [complaints]);

  const byMonth = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      map.set(d.toLocaleString("default", { month: "short" }), 0);
    }
    complaints.forEach((c) => {
      const m = new Date(c.createdAt).toLocaleString("default", { month: "short" });
      if (map.has(m)) map.set(m, (map.get(m) ?? 0) + 1);
    });
    return Array.from(map, ([month, count]) => ({ month, count }));
  }, [complaints]);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="p-5 lg:col-span-2">
        <h3 className="mb-4 text-sm font-semibold">Monthly complaints</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={byMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#6C63FF"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#6C63FF" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold">Priority distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={byPriority} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                {byPriority.map((_, i) => (
                  <Cell key={i} fill={chartColors[i % chartColors.length]} />
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

      <Card className="p-5 lg:col-span-3">
        <h3 className="mb-4 text-sm font-semibold">Complaints by category</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" fill="#6C63FF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
