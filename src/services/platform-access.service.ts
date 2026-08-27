import { access, delay, nextAccessId, platforms, users } from "@/lib/mock-db";
import type { AccessStatus, Origin, Paginated, PlatformAccess } from "@/lib/types";
import { paginate } from "./api";

export interface AccessFilters {
  search?: string;
  platformId?: string | "ALL";
  status?: AccessStatus | "ALL";
  origin?: Origin | "ALL";
  page?: number;
  pageSize?: number;
}

/** GET /platform-access */
export async function listAccess(filters: AccessFilters = {}): Promise<Paginated<PlatformAccess>> {
  const term = (filters.search ?? "").trim().toLowerCase();
  const rows = access.filter((a) => {
    if (
      term &&
      ![a.userName, a.username, a.email, a.platformCode].some((v) => v.toLowerCase().includes(term))
    )
      return false;
    if (filters.platformId && filters.platformId !== "ALL" && a.platformId !== filters.platformId)
      return false;
    if (filters.status && filters.status !== "ALL" && a.status !== filters.status) return false;
    if (filters.origin && filters.origin !== "ALL" && a.origin !== filters.origin) return false;
    return true;
  });
  return delay(paginate(rows, filters.page ?? 1, filters.pageSize ?? 10));
}

/** GET /platform-access/user/:userId */
export async function listAccessByUser(userId: string): Promise<PlatformAccess[]> {
  return delay(access.filter((a) => a.userId === userId));
}

/** GET /platform-access/platform/:platformId */
export async function listAccessByPlatform(
  platformId: string,
  filters: AccessFilters = {},
): Promise<Paginated<PlatformAccess>> {
  return listAccess({ ...filters, platformId });
}

export interface CreateAccessInput {
  userId: string;
  platformId: string;
  status?: AccessStatus;
  legacyId?: string | null;
  origin?: Origin;
}

/** POST /platform-access */
export async function createAccess(input: CreateAccessInput): Promise<PlatformAccess> {
  const user = users.find((u) => u.id === input.userId);
  const platform = platforms.find((p) => p.id === input.platformId);
  if (!user || !platform) throw new Error("Utilizador ou plataforma inválidos");
  if (access.some((a) => a.userId === user.id && a.platformId === platform.id)) {
    throw new Error(`${user.name} já tem acesso a ${platform.code}`);
  }
  const row: PlatformAccess = {
    id: nextAccessId(),
    userId: user.id,
    userName: user.name,
    username: user.username,
    email: user.email,
    platformId: platform.id,
    platformCode: platform.code,
    status: input.status ?? "ACTIVE",
    origin: input.origin ?? user.origin,
    linkedAt: new Date().toISOString(),
    legacyId: input.legacyId ?? null,
  };
  access.push(row);
  user.platformCount += 1;
  platform.userCount += 1;
  if (row.status === "ACTIVE") platform.activeUserCount += 1;
  return delay(row);
}

/** DELETE /platform-access/:id */
export async function deleteAccess(id: string): Promise<void> {
  const index = access.findIndex((a) => a.id === id);
  if (index < 0) throw new Error("Acesso não encontrado");
  const [row] = access.splice(index, 1);
  const user = users.find((u) => u.id === row?.userId);
  if (user) user.platformCount = Math.max(0, user.platformCount - 1);
  const platform = platforms.find((p) => p.id === row?.platformId);
  if (platform) platform.userCount = Math.max(0, platform.userCount - 1);
  return delay(undefined);
}
