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
  const { complaints, departments, users } = useData();

  const totals = useMemo(() => {
    const submitted = complaints.length;
    const resolved = complaints.filter((c) => c.status === "Resolved").length;
    const pending = complaints.filter(
      (c) => c.status !== "Resolved" && c.status !== "Rejected"
    ).length;
    const inProgress = complaints.filter(
      (c) => c.status === "In Progress" || c.status === "Assigned" || c.status === "Under Review"
    ).length;
    return {
      submitted,
      resolved,
      pending,
      inProgress,
    };
  }, [complaints]);

  const byCategory = useMemo(() => {
    const count = new Map<string, number>();
    complaints.forEach((c) => count.set(c.category, (count.get(c.category) ?? 0) + 1));
    return Array.from(count, ([name, value]) => ({ name, value }));
  }, [complaints]);

  const byPriority = useMemo(() => {
    const count = new Map<string, number>();
    complaints.forEach((c) => count.set(c.urgency, (count.get(c.urgency) ?? 0) + 1));
    return Array.from(count, ([name, value]) => ({ name, value }));
  }, [complaints]);

  const byDepartment = useMemo(() => {
    const count = new Map<string, number>();
    complaints.forEach((c) => count.set(c.department, (count.get(c.department) ?? 0) + 1));
    return Array.from(count, ([name, value]) => ({ name, value }));
  }, [complaints]);

  const facultyWorkload = useMemo(() => {
    const workload = new Map<string, { name: string; assigned: number; resolved: number }>();

    users
      .filter((user) => user.role === "faculty")
      .forEach((faculty) => {
        workload.set(faculty.id, {
          name: faculty.name,
          assigned: 0,
          resolved: 0,
        });
      });

    complaints.forEach((complaint) => {
      if (!complaint.assignedTo) return;
      const faculty = workload.get(complaint.assignedTo);
      if (!faculty) return;
      faculty.assigned += 1;
      if (complaint.status === "Resolved") {
        faculty.resolved += 1;
      }
    });

    return Array.from(workload.values()).sort((a, b) => b.assigned - a.assigned);
  }, [complaints, users]);

  const resolution = useMemo(() => {
    const days = 8;
    const today = new Date();
    const data = [] as { day: string; submitted: number; resolved: number }[];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const label = date.toLocaleDateString("en", { month: "short", day: "numeric" });
      data.push({ day: label, submitted: 0, resolved: 0 });
    }

    complaints.forEach((complaint) => {
      const created = new Date(complaint.createdAt);
      const createdLabel = created.toLocaleDateString("en", { month: "short", day: "numeric" });
      const createdEntry = data.find((item) => item.day === createdLabel);
      if (createdEntry) {
        createdEntry.submitted += 1;
      }

      if (complaint.status === "Resolved") {
        const updated = new Date(complaint.updatedAt || complaint.createdAt);
        const resolvedLabel = updated.toLocaleDateString("en", { month: "short", day: "numeric" });
        const resolvedEntry = data.find((item) => item.day === resolvedLabel);
        if (resolvedEntry) {
          resolvedEntry.resolved += 1;
        }
      }
    });

    return data;
  }, [complaints]);

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
          <div className="grid gap-4 sm:grid-cols-2">
            <StatSummary label="Total complaints" value={totals.submitted} />
            <StatSummary label="Resolved" value={totals.resolved} />
            <StatSummary label="Pending" value={totals.pending} />
            <StatSummary label="In progress" value={totals.inProgress} />
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
          <h3 className="mb-4 text-sm font-semibold">Priority distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byPriority}>
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
                <Bar dataKey="value" fill="#FFB74D" radius={[6, 6, 0, 0]} />
              </BarChart>
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

        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold">Top faculty workload</h3>
          <div className="space-y-3">
            {facultyWorkload.slice(0, 5).map((faculty) => (
              <div key={faculty.name} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{faculty.name}</p>
                  <p className="text-xs text-muted-foreground">Resolved {faculty.resolved} complaint{faculty.resolved === 1 ? "" : "s"}</p>
                </div>
                <div className="flex items-center gap-6 text-xs">
                  <div className="text-right">
                    <p className="text-muted-foreground">Assigned</p>
                    <p className="text-base font-semibold">{faculty.assigned}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Resolved</p>
                    <p className="text-base font-semibold text-success">{faculty.resolved}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatSummary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
