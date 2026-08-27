import { delay, legacyUsers, migrationHistory, platforms, users } from "@/lib/mock-db";
import type {
  LegacyUser,
  MigrationRecord,
  MigrationResult,
  Paginated,
  SyncRow,
  User,
} from "@/lib/types";
import { paginate } from "./api";
import { createAccess } from "./platform-access.service";
import { createUser } from "./users.service";

export interface PendingFilters {
  search?: string;
  platformId?: string | "ALL";
  match?: "ALL" | "WITH" | "WITHOUT";
  page?: number;
  pageSize?: number;
}

/** GET /migration/pending */
export async function listPending(filters: PendingFilters = {}): Promise<Paginated<LegacyUser>> {
  const term = (filters.search ?? "").trim().toLowerCase();
  const rows = legacyUsers.filter((l) => {
    if (l.status !== "PENDING") return false;
    if (
      term &&
      ![l.username, l.name, l.email, l.legacyId].some((v) => v.toLowerCase().includes(term))
    )
      return false;
    if (filters.platformId && filters.platformId !== "ALL" && l.platformId !== filters.platformId)
      return false;
    if (filters.match === "WITH" && !l.matchUserId) return false;
    if (filters.match === "WITHOUT" && l.matchUserId) return false;
    return true;
  });
  return delay(paginate(rows, filters.page ?? 1, filters.pageSize ?? 10));
}

export async function getPending(id: string): Promise<LegacyUser> {
  const row = legacyUsers.find((l) => l.id === id);
  if (!row) throw new Error("Registo legacy não encontrado");
  return delay(row, 120);
}

/** Sugestões de correspondência (matching). */
export async function findMatches(
  legacy: LegacyUser,
): Promise<Array<{ user: User; score: number }>> {
  const results = users
    .map((user) => {
      let score = 0;
      if (user.email.toLowerCase() === legacy.email.toLowerCase()) score += 60;
      if (user.username.toLowerCase() === legacy.username.toLowerCase()) score += 25;
      const a = user.name.toLowerCase();
      const b = legacy.name.toLowerCase();
      if (a === b) score += 38;
      else if (a.split(" ")[0] === b.split(" ")[0]) score += 18;
      if (legacy.matchUserId === user.id) score = Math.max(score, legacy.matchScore ?? 80);
      return { user, score };
    })
    .filter((r) => r.score >= 40)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
  return delay(results, 200);
}

export interface ImportInput {
  legacyId: string;
  /** Identidade existente a associar; quando ausente cria uma nova identidade. */
  userId?: string;
  admin?: string;
}

/** POST /migration/import */
export async function importLegacyUser(input: ImportInput): Promise<MigrationRecord> {
  const legacy = legacyUsers.find((l) => l.id === input.legacyId);
  if (!legacy) throw new Error("Registo legacy não encontrado");

  let user = input.userId ? users.find((u) => u.id === input.userId) : undefined;
  if (!user) {
    user = await createUser(
      { name: legacy.name, username: legacy.username, email: legacy.email, status: "ACTIVE" },
      "IMPORTED",
    );
  }

  let result: MigrationResult = "SUCCESS";
  try {
    await createAccess({
      userId: user.id,
      platformId: legacy.platformId,
      status: "ACTIVE",
      legacyId: legacy.legacyId,
      origin: "IMPORTED",
    });
  } catch {
    result = "MANUAL";
  }

  legacy.status = "IMPORTED";

  const record: MigrationRecord = {
    id: `m${migrationHistory.length + 1}`,
    date: new Date().toISOString(),
    userName: user.name,
    platformCode: legacy.platformCode,
    from: "LEGACY",
    to: "CENTRAL",
    operation: "IMPORT",
    admin: input.admin ?? "Admin",
    result,
  };
  migrationHistory.unshift(record);
  return delay(record, 250);
}

/** POST /migration/import/bulk */
export async function importLegacyUsersBulk(
  ids: string[],
  onProgress?: (processed: number, total: number) => void,
): Promise<{ processed: number; migrated: number; manual: number }> {
  let migrated = 0;
  let manual = 0;
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i] as string;
    const legacy = legacyUsers.find((l) => l.id === id);
    const record = legacy
      ? await importLegacyUser({ legacyId: id })
      : ({ result: "FAILED" } as MigrationRecord);
    if (record.result === "SUCCESS") migrated += 1;
    else manual += 1;
    onProgress?.(i + 1, ids.length);
  }
  return { processed: ids.length, migrated, manual };
}

/** GET /migration/history */
export async function listHistory(
  filters: {
    search?: string;
    platformCode?: string | "ALL";
    result?: MigrationResult | "ALL";
    admin?: string | "ALL";
    page?: number;
    pageSize?: number;
  } = {},
): Promise<Paginated<MigrationRecord>> {
  const term = (filters.search ?? "").trim().toLowerCase();
  const rows = migrationHistory.filter((m) => {
    if (term && !m.userName.toLowerCase().includes(term)) return false;
    if (
      filters.platformCode &&
      filters.platformCode !== "ALL" &&
      m.platformCode !== filters.platformCode
    )
      return false;
    if (filters.result && filters.result !== "ALL" && m.result !== filters.result) return false;
    if (filters.admin && filters.admin !== "ALL" && m.admin !== filters.admin) return false;
    return true;
  });
  return delay(paginate(rows, filters.page ?? 1, filters.pageSize ?? 10));
}

/** GET /migration/sync */
export async function listSync(): Promise<SyncRow[]> {
  return delay(
    platforms.map((p) => {
      const pending = legacyUsers.filter(
        (l) => l.platformId === p.id && l.status === "PENDING",
      ).length;
      return {
        platformId: p.id,
        platformCode: p.code,
        legacyTotal: p.userCount + pending,
        centralTotal: p.userCount,
        pending,
      };
    }),
  );
}

export async function syncPlatform(platformId: string): Promise<{ found: number }> {
  const found = legacyUsers.filter(
    (l) => l.platformId === platformId && l.status === "PENDING",
  ).length;
  return delay({ found }, 600);
}
