import { Brain, Clock, Gauge, Layers, Users2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PriorityBadge } from "@/components/status-badge";
import type { AIAnalysis } from "@/types";

export function AIAnalysisCard({ analysis }: { analysis: AIAnalysis }) {
  const pct = Math.round(analysis.confidence * 100);
  return (
    <Card className="relative overflow-hidden border-primary/20 p-6">
      <div className="absolute inset-x-0 top-0 h-1 gradient-primary" />
      <div className="mb-4 flex items-center gap-3">
        <div className="gradient-primary flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground shadow-[var(--shadow-glow)]">
          <Brain className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">AI Analysis</h3>
          <p className="text-xs text-muted-foreground">Powered by CampusPulse AI</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Metric icon={Layers} label="Category" value={analysis.category} />
        <Metric icon={Gauge} label="Priority" value={<PriorityBadge priority={analysis.priority} />} />
        <Metric icon={Users2} label="Suggested Dept." value={analysis.department} />
        <Metric icon={Clock} label="Est. Resolution" value={analysis.estimatedResolution} />
      </div>

      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">Confidence</span>
          <span className="font-semibold">{pct}%</span>
        </div>
        <Progress value={pct} className="h-2" />
      </div>

      {analysis.keywords.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {analysis.keywords.map((k) => (
            <span
              key={k}
              className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent-foreground"
            >
              #{k}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Brain;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
