import { access, delay, platforms } from "@/lib/mock-db";
import type { Paginated, Platform, PlatformStatus } from "@/lib/types";
import { paginate } from "./api";

export interface PlatformFilters {
  search?: string;
  status?: PlatformStatus | "ALL";
  page?: number;
  pageSize?: number;
}

/** GET /platforms */
export async function listPlatforms(filters: PlatformFilters = {}): Promise<Paginated<Platform>> {
  const term = (filters.search ?? "").trim().toLowerCase();
  const status = filters.status ?? "ALL";
  const rows = platforms.filter((p) => {
    if (term && ![p.code, p.name, p.description].some((v) => v.toLowerCase().includes(term)))
      return false;
    if (status !== "ALL" && p.status !== status) return false;
    return true;
  });
  return delay(paginate(rows, filters.page ?? 1, filters.pageSize ?? 10));
}

/** Lista simples para selects. */
export async function listAllPlatforms(): Promise<Platform[]> {
  return delay(platforms, 120);
}

/** GET /platforms/:id */
export async function getPlatform(id: string): Promise<Platform> {
  const platform = platforms.find((p) => p.id === id || p.code === id);
  if (!platform) throw new Error("Plataforma não encontrada");
  const linked = access.filter((a) => a.platformId === platform.id);
  return delay({
    ...platform,
    userCount: platform.userCount || linked.length,
    activeUserCount: platform.activeUserCount || linked.filter((a) => a.status === "ACTIVE").length,
    pendingUserCount:
      platform.pendingUserCount || linked.filter((a) => a.status === "PENDING").length,
  });
}

export interface PlatformInput {
  code: string;
  name: string;
  description: string;
  status: PlatformStatus;
}

/** POST /platforms */
export async function createPlatform(input: PlatformInput): Promise<Platform> {
  if (platforms.some((p) => p.code.toUpperCase() === input.code.toUpperCase())) {
    throw new Error("Já existe uma plataforma com este código");
  }
  const platform: Platform = {
    id: `p${platforms.length + 1}`,
    ...input,
    code: input.code.toUpperCase(),
    createdAt: new Date().toISOString(),
    userCount: 0,
    activeUserCount: 0,
    pendingUserCount: 0,
  };
  platforms.push(platform);
  return delay(platform);
}
