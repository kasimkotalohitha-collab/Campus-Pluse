import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
AlertTriangle,
CheckCircle2,
Clock,
FileText,
Layers,
Loader2,
MessageSquarePlus,
TrendingUp,
} from "lucide-react";
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

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ComplaintCard } from "@/components/complaint-card";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";

import type {
AIAnalysis,
Category,
Complaint,
ComplaintComment,
ComplaintStatus,
ComplaintTimelineEvent,
Priority,
} from "@/types";

export const Route = createFileRoute("/app/dashboard")({
component: DashboardPage,
});

type ComplaintRow = {
id: string;
title: string;
description: string;
category: string | null;
priority: string | null;
status: string | null;
location: string | null;
submitted_by: string | null;
created_at: string | null;
updated_at: string | null;
building: string | null;
anonymous: boolean | null;
images: string[] | null;
submitted_by_name: string | null;
department: string | null;
ai: AIAnalysis | null;
timeline: ComplaintTimelineEvent[] | null;
comments: ComplaintComment[] | null;
assigned_to: string | null;
admin_notes: string | null;
};

function mapComplaint(row: ComplaintRow): Complaint {
const createdAt = row.created_at ?? new Date().toISOString();

return {
id: row.id,
title: row.title,
description: row.description,
category: (row.category ?? "Other") as Category,
building: row.building ?? "N/A",
location: row.location ?? "N/A",
urgency: (row.priority ?? "Medium") as Priority,
anonymous: row.anonymous ?? false,
images: row.images ?? [],
status: (row.status ?? "Submitted") as ComplaintStatus,
submittedBy: row.submitted_by ?? "",
submittedByName: row.submitted_by_name ?? "Unknown",
assignedTo: row.assigned_to ?? undefined,
department: row.department ?? "General Admin",
createdAt,
updatedAt: row.updated_at ?? createdAt,
ai: row.ai ?? {
category: (row.category ?? "Other") as Category,
priority: (row.priority ?? "Medium") as Priority,
confidence: 0,
department: row.department ?? "General Admin",
estimatedResolution: "Not available",
keywords: [],
},
timeline:
row.timeline ??
[
{
id: `timeline-${row.id}`,
status: (row.status ?? "Submitted") as ComplaintStatus,
note: "Complaint received.",
actor: "System",
timestamp: createdAt,
},
],
comments: row.comments ?? [],
adminNotes: row.admin_notes ?? undefined,
};
}

function DashboardPage() {
const { user } = useAuth();

const [complaints, setComplaints] = useState<Complaint[]>([]);
const [loading, setLoading] = useState(true);
const [loadError, setLoadError] = useState("");

useEffect(() => {
let active = true;


async function loadComplaints() {
  if (!user) {
    if (active) {
      setComplaints([]);
      setLoading(false);
    }

    return;
  }

  setLoading(true);
  setLoadError("");

  let query = supabase
    .from("complaints")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (user.role !== "admin") {
    query = query.eq(
      "submitted_by",
      user.id,
    );
  }

  const { data, error } = await query;

  if (!active) {
    return;
  }

  if (error) {
    console.error(
      "Supabase dashboard error:",
      error,
    );

    setLoadError(
      error.message,
    );

    setComplaints([]);
  } else {
    setComplaints(
      (
        (data ?? []) as ComplaintRow[]
      ).map(
        mapComplaint,
      ),
    );
  }

  setLoading(false);
}

loadComplaints();

return () => {
  active = false;
};


}, [
user?.id,
user?.role,
]);

const stats = useMemo(() => {
const total =
complaints.length;


const pending =
  complaints.filter(
    (complaint) =>
      complaint.status !==
        "Resolved" &&
      complaint.status !==
        "Rejected",
  ).length;

const resolved =
  complaints.filter(
    (complaint) =>
      complaint.status ===
      "Resolved",
  ).length;

const high =
  complaints.filter(
    (complaint) =>
      complaint.urgency ===
        "High" ||
      complaint.urgency ===
        "Critical",
  ).length;

return {
  total,
  pending,
  resolved,
  high,
};


}, [
complaints,
]);

const firstName =
user?.name
?.trim()
.split(/\s+/)[0] ||
"Student";

return ( <div className="space-y-6"> <div className="flex flex-wrap items-end justify-between gap-4"> <div> <h1 className="text-2xl font-semibold tracking-tight">
{user?.role ===
"admin"
? "Admin overview"
: `Hi, ${firstName}`} </h1>

```
      <p className="text-sm text-muted-foreground">
        {user?.role ===
        "admin"
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
    <StatCard
      label="Total complaints"
      value={
        loading
          ? "..."
          : stats.total
      }
      icon={FileText}
    />

    <StatCard
      label="Pending"
      value={
        loading
          ? "..."
          : stats.pending
      }
      icon={Clock}
      tone="warning"
    />

    <StatCard
      label="Resolved"
      value={
        loading
          ? "..."
          : stats.resolved
      }
      icon={CheckCircle2}
      tone="success"
    />

    <StatCard
      label="High priority"
      value={
        loading
          ? "..."
          : stats.high
      }
      icon={
        AlertTriangle
      }
      tone="destructive"
    />
  </div>

  {loadError && (
    <Card className="border-destructive/40 p-4">
      <p className="text-sm font-medium text-destructive">
        Could not load complaints
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {loadError}
      </p>
    </Card>
  )}

  {loading ? (
    <Card className="flex min-h-48 items-center justify-center p-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />

        Loading complaints...
      </div>
    </Card>
  ) : (
    <>
      {user?.role ===
      "admin" ? (
        <AdminCharts
          complaints={
            complaints
          }
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              Recent complaints
            </h2>

            <Button
              asChild
              variant="ghost"
              size="sm"
            >
              <Link to="/app/complaints">
                View all
              </Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {complaints
              .slice(
                0,
                6,
              )
              .map(
                (
                  complaint,
                ) => (
                  <ComplaintCard
                    key={
                      complaint.id
                    }
                    complaint={
                      complaint
                    }
                  />
                ),
              )}

            {complaints.length ===
              0 && (
              <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
                No complaints yet. Submit your first one.
              </p>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />

            <h2 className="text-sm font-semibold">
              Activity feed
            </h2>
          </div>

          {complaints.length ===
          0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No recent activity.
            </p>
          ) : (
            <ul className="space-y-3">
              {complaints
                .slice(
                  0,
                  6,
                )
                .map(
                  (
                    complaint,
                  ) => (
                    <li
                      key={
                        complaint.id
                      }
                      className="flex items-start gap-3 rounded-lg border border-border p-3 text-xs"
                    >
                      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Layers className="h-3.5 w-3.5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">
                          {
                            complaint.title
                          }
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <StatusBadge
                            status={
                              complaint.status
                            }
                            className="text-[10px]"
                          />

                          <span className="text-muted-foreground">
                            {new Date(
                              complaint.updatedAt,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </li>
                  ),
                )}
            </ul>
          )}
        </Card>
      </div>
    </>
  )}
</div>


);
}

const chartColors = [
"#6C63FF",
"#8B7FFF",
"#4FC3F7",
"#4CAF50",
"#FFB74D",
"#EF5350",
];

function AdminCharts({
complaints,
}: {
complaints: Complaint[];
}) {
const byCategory =
useMemo(() => {
const map =
new Map<
string,
number
>();


  complaints.forEach(
    (
      complaint,
    ) => {
      map.set(
        complaint.category,
        (
          map.get(
            complaint.category,
          ) ??
          0
        ) +
          1,
      );
    },
  );

  return Array.from(
    map,
    (
      [
        name,
        value,
      ],
    ) => ({
      name,
      value,
    }),
  );
}, [
  complaints,
]);


const byPriority =
useMemo(() => {
const map =
new Map<
string,
number
>();


  complaints.forEach(
    (
      complaint,
    ) => {
      map.set(
        complaint.urgency,
        (
          map.get(
            complaint.urgency,
          ) ??
          0
        ) +
          1,
      );
    },
  );

  return Array.from(
    map,
    (
      [
        name,
        value,
      ],
    ) => ({
      name,
      value,
    }),
  );
}, [
  complaints,
]);


const byMonth =
useMemo(() => {
const map =
new Map<
string,
number
>();


  for (
    let index = 5;
    index >= 0;
    index--
  ) {
    const date =
      new Date();

    date.setMonth(
      date.getMonth() -
        index,
    );

    map.set(
      date.toLocaleString(
        "default",
        {
          month:
            "short",
        },
      ),
      0,
    );
  }

  complaints.forEach(
    (
      complaint,
    ) => {
      const month =
        new Date(
          complaint.createdAt,
        ).toLocaleString(
          "default",
          {
            month:
              "short",
          },
        );

      if (
        map.has(
          month,
        )
      ) {
        map.set(
          month,
          (
            map.get(
              month,
            ) ??
            0
          ) +
            1,
        );
      }
    },
  );

  return Array.from(
    map,
    (
      [
        month,
        count,
      ],
    ) => ({
      month,
      count,
    }),
  );
}, [
  complaints,
]);


return ( <div className="grid gap-4 lg:grid-cols-3"> <Card className="p-5 lg:col-span-2"> <h3 className="mb-4 text-sm font-semibold">
Monthly complaints </h3>


    <div className="h-64">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <LineChart
          data={
            byMonth
          }
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
          />

          <XAxis
            dataKey="month"
            stroke="var(--muted-foreground)"
            fontSize={
              11
            }
          />

          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={
              11
            }
          />

          <Tooltip
            contentStyle={{
              background:
                "var(--card)",
              border:
                "1px solid var(--border)",
              borderRadius:
                8,
              fontSize:
                12,
            }}
          />

          <Line
            type="monotone"
            dataKey="count"
            stroke="#6C63FF"
            strokeWidth={
              2.5
            }
            dot={{
              r: 4,
              fill: "#6C63FF",
            }}
            activeDot={{
              r: 6,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </Card>

  <Card className="p-5">
    <h3 className="mb-4 text-sm font-semibold">
      Priority distribution
    </h3>

    <div className="h-64">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <PieChart>
          <Pie
            data={
              byPriority
            }
            dataKey="value"
            nameKey="name"
            innerRadius={
              45
            }
            outerRadius={
              80
            }
            paddingAngle={
              2
            }
          >
            {byPriority.map(
              (
                _,
                index,
              ) => (
                <Cell
                  key={
                    index
                  }
                  fill={
                    chartColors[
                      index %
                        chartColors.length
                    ]
                  }
                />
              ),
            )}
          </Pie>

          <Tooltip
            contentStyle={{
              background:
                "var(--card)",
              border:
                "1px solid var(--border)",
              borderRadius:
                8,
              fontSize:
                12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </Card>

  <Card className="p-5 lg:col-span-3">
    <h3 className="mb-4 text-sm font-semibold">
      Complaints by category
    </h3>

    <div className="h-64">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart
          data={
            byCategory
          }
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
          />

          <XAxis
            dataKey="name"
            stroke="var(--muted-foreground)"
            fontSize={
              11
            }
          />

          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={
              11
            }
          />

          <Tooltip
            contentStyle={{
              background:
                "var(--card)",
              border:
                "1px solid var(--border)",
              borderRadius:
                8,
              fontSize:
                12,
            }}
          />

          <Bar
            dataKey="value"
            fill="#6C63FF"
            radius={[
              6,
              6,
              0,
              0,
            ]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </Card>
</div>


);
}
