import { Link } from "@tanstack/react-router";
import { Building2, Calendar, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import type { Complaint } from "@/types";

export function ComplaintCard({ complaint }: { complaint: Complaint }) {
  return (
    <Link
      to="/app/complaints/$id"
      params={{ id: complaint.id }}
      className="block"
    >
      <Card className="group p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-elevated)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-mono uppercase tracking-wide text-muted-foreground">
              {complaint.id}
            </p>
            <h3 className="mt-0.5 truncate text-sm font-semibold group-hover:text-primary">
              {complaint.title}
            </h3>
          </div>
          <PriorityBadge priority={complaint.urgency} />
        </div>
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
          {complaint.description}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {complaint.building}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {complaint.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(complaint.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <StatusBadge status={complaint.status} />
          <span className="text-[11px] text-muted-foreground">{complaint.department}</span>
        </div>
      </Card>
    </Link>
  );
}
