import { access, delay, users } from "@/lib/mock-db";
import type { Origin, Paginated, User, UserStatus } from "@/lib/types";
import { paginate } from "./api";

export interface UserFilters {
  search?: string;
  status?: UserStatus | "ALL";
  origin?: Origin | "ALL";
  platformId?: string | "ALL";
  page?: number;
  pageSize?: number;
}

/** GET /identity/users */
export async function listUsers(filters: UserFilters = {}): Promise<Paginated<User>> {
  const { search = "", status = "ALL", origin = "ALL", platformId = "ALL" } = filters;
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const term = search.trim().toLowerCase();

  let rows = users.filter((u) => {
    if (term && ![u.name, u.username, u.email, u.id].some((v) => v.toLowerCase().includes(term)))
      return false;
    if (status !== "ALL" && u.status !== status) return false;
    if (origin !== "ALL" && u.origin !== origin) return false;
    return true;
  });

  if (platformId !== "ALL") {
    const ids = new Set(access.filter((a) => a.platformId === platformId).map((a) => a.userId));
    rows = rows.filter((u) => ids.has(u.id));
  }

  return delay(paginate(rows, page, pageSize));
}

/** GET /identity/users/:id */
export async function getUser(id: string): Promise<User> {
  const user = users.find((u) => u.id === id);
  if (!user) throw new Error("Utilizador não encontrado");
  return delay(user);
}

export interface UserInput {
  name: string;
  username: string;
  email: string;
  status: UserStatus;
}

/** POST /identity/users */
export async function createUser(input: UserInput, origin: Origin = "CENTRAL"): Promise<User> {
  const user: User = {
    id: String(Math.max(...users.map((u) => Number(u.id))) + 1),
    ...input,
    origin,
    createdAt: new Date().toISOString(),
    lastAccessAt: null,
    platformCount: 0,
  };
  users.unshift(user);
  return delay(user);
}

/** PATCH /identity/users/:id */
export async function updateUser(id: string, input: Partial<UserInput>): Promise<User> {
  const user = users.find((u) => u.id === id);
  if (!user) throw new Error("Utilizador não encontrado");
  Object.assign(user, input);
  return delay(user);
}
