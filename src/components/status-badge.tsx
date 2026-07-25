import { cn } from "@/lib/utils";
import type { ComplaintStatus, Priority } from "@/types";

const statusStyles: Record<ComplaintStatus, string> = {
  Submitted: "bg-muted text-muted-foreground border-border",
  "Under Review": "bg-info/10 text-info border-info/20",
  Assigned: "bg-accent text-accent-foreground border-accent",
  "In Progress": "bg-warning/15 text-warning-foreground border-warning/30",
  Resolved: "bg-success/10 text-success border-success/20",
  Rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const priorityStyles: Record<Priority, string> = {
  Low: "bg-muted text-muted-foreground border-border",
  Medium: "bg-info/10 text-info border-info/20",
  High: "bg-warning/15 text-warning-foreground border-warning/30",
  Critical: "bg-destructive/10 text-destructive border-destructive/30",
};

export function StatusBadge({ status, className }: { status: ComplaintStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status],
        className,
      )}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        priorityStyles[priority],
        className,
      )}
    >
      {priority}
    </span>
  );
}
