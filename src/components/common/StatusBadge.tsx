import { Badge } from "@/components/ui/badge";
import type {
  AccessStatus,
  MigrationResult,
  Origin,
  PlatformStatus,
  UserStatus,
} from "@/lib/types";

type AnyStatus = UserStatus | AccessStatus | PlatformStatus;

const statusMap: Record<
  AnyStatus,
  { label: string; variant: "success" | "neutral" | "warning"; dot: string }
> = {
  ACTIVE: { label: "Ativo", variant: "success", dot: "●" },
  INACTIVE: { label: "Inativo", variant: "neutral", dot: "○" },
  PENDING: { label: "Pendente", variant: "warning", dot: "◐" },
};

export function StatusBadge({ status }: { status: AnyStatus }) {
  const config = statusMap[status];
  return (
    <Badge variant={config.variant} className="gap-1.5">
      <span aria-hidden className="text-[0.7em] leading-none">
        {config.dot}
      </span>
      {config.label}
    </Badge>
  );
}

const originMap: Record<
  Origin,
  { label: string; variant: "info" | "warning" | "success"; icon: string }
> = {
  CENTRAL: { label: "Central", variant: "info", icon: "✓" },
  LEGACY: { label: "Legacy", variant: "warning", icon: "⚠" },
  IMPORTED: { label: "Importado", variant: "success", icon: "✓" },
};

export function OriginBadge({ origin }: { origin: Origin }) {
  const config = originMap[origin];
  return (
    <Badge variant={config.variant} className="gap-1.5">
      <span aria-hidden>{config.icon}</span>
      {config.label}
    </Badge>
  );
}

const resultMap: Record<
  MigrationResult,
  { label: string; variant: "success" | "danger" | "warning" }
> = {
  SUCCESS: { label: "Sucesso", variant: "success" },
  FAILED: { label: "Falhou", variant: "danger" },
  MANUAL: { label: "Intervenção manual", variant: "warning" },
};

export function ResultBadge({ result }: { result: MigrationResult }) {
  const config = resultMap[result];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function PlatformTag({ code }: { code: string }) {
  return (
    <span className="inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.7rem] font-semibold tracking-wide text-foreground">
      {code}
    </span>
  );
}

const levelMap: Record<
  string,
  { label: string; variant: "info" | "warning" | "danger" | "neutral" }
> = {
  INFO: { label: "INFO", variant: "info" },
  WARNING: { label: "WARN", variant: "warning" },
  ERROR: { label: "ERROR", variant: "danger" },
  DEBUG: { label: "DEBUG", variant: "neutral" },
};

export function LogLevelBadge({ level }: { level: string }) {
  const config = levelMap[level] ?? levelMap["INFO"]!;
  return (
    <Badge variant={config.variant} className="font-mono text-[0.68rem]">
      {config.label}
    </Badge>
  );
}
