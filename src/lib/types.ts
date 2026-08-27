export type UserStatus = "ACTIVE" | "INACTIVE" | "PENDING";
export type Origin = "CENTRAL" | "LEGACY" | "IMPORTED";
export type AccessStatus = "ACTIVE" | "INACTIVE" | "PENDING";
export type PlatformStatus = "ACTIVE" | "INACTIVE";
export type MigrationResult = "SUCCESS" | "FAILED" | "MANUAL";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  status: UserStatus;
  origin: Origin;
  createdAt: string;
  lastAccessAt: string | null;
  platformCount: number;
}

export interface Platform {
  id: string;
  code: string;
  name: string;
  description: string;
  status: PlatformStatus;
  createdAt: string;
  userCount: number;
  activeUserCount: number;
  pendingUserCount: number;
}

export interface PlatformAccess {
  id: string;
  userId: string;
  userName: string;
  username: string;
  email: string;
  platformId: string;
  platformCode: string;
  status: AccessStatus;
  origin: Origin;
  linkedAt: string;
  legacyId: string | null;
}

export interface LegacyUser {
  id: string;
  username: string;
  name: string;
  email: string;
  platformId: string;
  platformCode: string;
  legacyId: string;
  status: "PENDING" | "IMPORTED";
  matchUserId: string | null;
  matchScore: number | null;
}

export interface MigrationRecord {
  id: string;
  date: string;
  userName: string;
  platformCode: string;
  from: Origin;
  to: Origin;
  operation: "IMPORT" | "BULK_IMPORT" | "LINK";
  admin: string;
  result: MigrationResult;
}

export interface SyncRow {
  platformId: string;
  platformCode: string;
  legacyTotal: number;
  centralTotal: number;
  pending: number;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalPlatforms: number;
  activeAccess: number;
  pendingMigration: number;
}

export type LogLevel = "INFO" | "WARNING" | "ERROR" | "DEBUG";

export interface LogEntry {
  id: string;
  timestamp: string;
  platformId: string;
  platformCode: string;
  level: LogLevel;
  action: string;
  actor: string;
  message: string;
  ip: string;
  durationMs: number;
}

export interface LogStats {
  total: number;
  errors: number;
  warnings: number;
  platforms: number;
  byPlatform: Array<{ platformCode: string; total: number; errors: number }>;
}
