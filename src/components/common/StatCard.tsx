import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  hint?: string;
  tone?: "default" | "warning";
}) {
  return (
    <Card className="flex items-start justify-between gap-4 p-5 shadow-none">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="font-mono text-2xl font-semibold text-foreground">{formatNumber(value)}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-md border border-border bg-muted",
          tone === "warning" && "border-warning/30 bg-warning/15",
        )}
      >
        <Icon
          className={cn("size-4 text-muted-foreground", tone === "warning" && "text-warning")}
        />
      </div>
    </Card>
  );
}
