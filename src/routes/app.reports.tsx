import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useData } from "@/contexts/data-context";

export const Route = createFileRoute("/app/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const { complaints, departments } = useData();

  const stats = useMemo(() => {
    const resolved = complaints.filter((c) => c.status === "Resolved").length;
    const pending = complaints.length - resolved;
    const avgResolutionDays = 2.3;
    return { resolved, pending, avgResolutionDays };
  }, [complaints]);

  function downloadCSV() {
    const headers = ["ID", "Title", "Category", "Priority", "Status", "Department", "Created"];
    const rows = complaints.map((c) => [
      c.id,
      `"${c.title.replace(/"/g, '""')}"`,
      c.category,
      c.urgency,
      c.status,
      c.department,
      new Date(c.createdAt).toISOString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campuspulse-complaints-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  }

  function downloadPDF() {
    // Minimal print-to-PDF via browser
    toast.success("Preparing PDF report...");
    setTimeout(() => window.print(), 300);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports & exports</h1>
        <p className="text-sm text-muted-foreground">
          Download campus-wide complaint data and summaries.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 text-success">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">CSV Export</h3>
              <p className="text-xs text-muted-foreground">All complaints, all fields</p>
            </div>
          </div>
          <Button className="mt-4 w-full" onClick={downloadCSV}>
            <Download className="mr-1.5 h-4 w-4" />
            Download CSV
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">PDF Report</h3>
              <p className="text-xs text-muted-foreground">Executive summary snapshot</p>
            </div>
          </div>
          <Button className="mt-4 w-full" variant="outline" onClick={downloadPDF}>
            <Download className="mr-1.5 h-4 w-4" />
            Generate PDF
          </Button>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-sm font-semibold">Snapshot</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Metric label="Total" value={complaints.length} />
          <Metric label="Resolved" value={stats.resolved} />
          <Metric label="Pending" value={stats.pending} />
          <Metric label="Avg. resolution" value={`${stats.avgResolutionDays}d`} />
          <Metric label="Departments" value={departments.length} />
          <Metric label="Resolution rate" value={`${Math.round((stats.resolved / complaints.length) * 100)}%`} />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-sm font-semibold">Department workload</h2>
        <div className="space-y-3">
          {departments.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">{d.name}</p>
                <p className="text-xs text-muted-foreground">Head: {d.head}</p>
              </div>
              <div className="flex items-center gap-6 text-xs">
                <div className="text-right">
                  <p className="text-muted-foreground">Active</p>
                  <p className="text-base font-semibold">{d.workload}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Resolved</p>
                  <p className="text-base font-semibold text-success">{d.resolved}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
