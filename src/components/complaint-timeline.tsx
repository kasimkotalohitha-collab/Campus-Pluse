import { Check } from "lucide-react";
import type { ComplaintTimelineEvent } from "@/types";
import { cn } from "@/lib/utils";

export function ComplaintTimeline({ events }: { events: ComplaintTimelineEvent[] }) {
  return (
    <ol className="relative space-y-6 border-l border-border pl-6">
      {events.map((e, i) => {
        const isLast = i === events.length - 1;
        return (
          <li key={e.id} className="relative">
            <span
              className={cn(
                "absolute -left-[30px] flex h-6 w-6 items-center justify-center rounded-full border-2 border-background",
                isLast ? "gradient-primary text-primary-foreground" : "bg-success text-success-foreground",
              )}
            >
              <Check className="h-3 w-3" />
            </span>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{e.status}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(e.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{e.note}</p>
              <p className="text-xs text-muted-foreground/80">by {e.actor}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
