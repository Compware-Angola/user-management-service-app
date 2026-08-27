import { delay, logs } from "@/lib/mock-db";
import type { LogEntry, LogLevel, LogStats, Paginated } from "@/lib/types";
import { paginate } from "./api";

export interface LogFilters {
  search?: string;
  platformId?: string | "ALL";
  level?: LogLevel | "ALL";
  action?: string | "ALL";
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

function applyFilters(filters: LogFilters): LogEntry[] {
  const term = (filters.search ?? "").trim().toLowerCase();
  return logs.filter((l) => {
    if (
      term &&
      ![l.actor, l.action, l.message, l.ip, l.platformCode].some((v) =>
        v.toLowerCase().includes(term),
      )
    )
      return false;
    if (filters.platformId && filters.platformId !== "ALL" && l.platformId !== filters.platformId)
      return false;
    if (filters.level && filters.level !== "ALL" && l.level !== filters.level) return false;
    if (filters.action && filters.action !== "ALL" && l.action !== filters.action) return false;
    if (filters.from && l.timestamp < new Date(filters.from).toISOString()) return false;
    if (filters.to && l.timestamp > new Date(`${filters.to}T23:59:59`).toISOString()) return false;
    return true;
  });
}

/** GET /logs */
export async function listLogs(filters: LogFilters = {}): Promise<Paginated<LogEntry>> {
  const rows = applyFilters(filters);
  return delay(paginate(rows, filters.page ?? 1, filters.pageSize ?? 15));
}

/** GET /logs/stats */
export async function getLogStats(filters: LogFilters = {}): Promise<LogStats> {
  const rows = applyFilters(filters);
  const byPlatform = new Map<string, { total: number; errors: number }>();
  for (const l of rows) {
    const entry = byPlatform.get(l.platformCode) ?? { total: 0, errors: 0 };
    entry.total += 1;
    if (l.level === "ERROR") entry.errors += 1;
    byPlatform.set(l.platformCode, entry);
  }
  return delay({
    total: rows.length,
    errors: rows.filter((l) => l.level === "ERROR").length,
    warnings: rows.filter((l) => l.level === "WARNING").length,
    platforms: byPlatform.size,
    byPlatform: [...byPlatform.entries()]
      .map(([platformCode, v]) => ({ platformCode, ...v }))
      .sort((a, b) => b.total - a.total),
  });
}

export function logActions(): string[] {
  return [...new Set(logs.map((l) => l.action))].sort();
}

export function logsToCsv(rows: LogEntry[]): string {
  const header = "timestamp,platform,level,action,actor,ip,duration_ms,message";
  const body = rows
    .map((l) =>
      [
        l.timestamp,
        l.platformCode,
        l.level,
        l.action,
        l.actor,
        l.ip,
        l.durationMs,
        `"${l.message}"`,
      ].join(","),
    )
    .join("\n");
  return `${header}\n${body}`;
}
