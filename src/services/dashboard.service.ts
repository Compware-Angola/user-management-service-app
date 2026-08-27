import { access, delay, legacyUsers, platforms, users } from "@/lib/mock-db";
import type { DashboardStats } from "@/lib/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  return delay({
    totalUsers: 12540,
    activeUsers: 11890,
    totalPlatforms: platforms.length,
    activeAccess: 28430,
    pendingMigration: legacyUsers.filter((l) => l.status === "PENDING").length + 278,
  });
}

export async function getDashboardActivity() {
  return delay({
    localUsers: users.length,
    localAccess: access.length,
  });
}
