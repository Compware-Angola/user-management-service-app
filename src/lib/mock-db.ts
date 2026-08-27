import type { LegacyUser, MigrationRecord, Platform, PlatformAccess, User } from "./types";

/** Deterministic pseudo-random so SSR and client agree. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const rand = rng(42);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)] as T;
}

const FIRST = [
  "Isaac",
  "João",
  "Maria",
  "Pedro",
  "Ana",
  "Carlos",
  "Luísa",
  "Nuno",
  "Sofia",
  "Miguel",
  "Beatriz",
  "Tiago",
  "Helena",
  "Rui",
  "Catarina",
  "Domingos",
];
const LAST = [
  "Bunga",
  "Manuel",
  "Silva",
  "António",
  "Ferreira",
  "Costa",
  "Neto",
  "Cabral",
  "Domingos",
  "Sebastião",
  "Lopes",
  "Pinto",
];

function iso(daysAgo: number) {
  const base = Date.UTC(2026, 7, 26, 10, 0, 0);
  return new Date(base - daysAgo * 86400000).toISOString();
}

export const platforms: Platform[] = [
  {
    id: "p1",
    code: "INVOICE",
    name: "Invoice Management",
    description: "Faturação e documentos fiscais",
    status: "ACTIVE",
    createdAt: iso(720),
    userCount: 1245,
    activeUserCount: 1198,
    pendingUserCount: 47,
  },
  {
    id: "p2",
    code: "FINANCE",
    name: "Finance Management",
    description: "Gestão financeira e tesouraria",
    status: "ACTIVE",
    createdAt: iso(690),
    userCount: 2430,
    activeUserCount: 2380,
    pendingUserCount: 50,
  },
  {
    id: "p3",
    code: "ACADEMIC",
    name: "Academic Portal",
    description: "Gestão académica e matrículas",
    status: "ACTIVE",
    createdAt: iso(640),
    userCount: 5230,
    activeUserCount: 5018,
    pendingUserCount: 212,
  },
  {
    id: "p4",
    code: "CRM",
    name: "Customer Relationship",
    description: "Clientes, leads e oportunidades",
    status: "ACTIVE",
    createdAt: iso(400),
    userCount: 890,
    activeUserCount: 861,
    pendingUserCount: 29,
  },
  {
    id: "p5",
    code: "HR",
    name: "Human Resources",
    description: "Recursos humanos e assiduidade",
    status: "ACTIVE",
    createdAt: iso(310),
    userCount: 640,
    activeUserCount: 620,
    pendingUserCount: 20,
  },
  {
    id: "p6",
    code: "LOGISTICS",
    name: "Logistics",
    description: "Stock, armazém e distribuição",
    status: "INACTIVE",
    createdAt: iso(220),
    userCount: 210,
    activeUserCount: 180,
    pendingUserCount: 30,
  },
  {
    id: "p7",
    code: "SUPPORT",
    name: "Support Desk",
    description: "Tickets e apoio ao cliente",
    status: "ACTIVE",
    createdAt: iso(180),
    userCount: 320,
    activeUserCount: 300,
    pendingUserCount: 20,
  },
  {
    id: "p8",
    code: "ANALYTICS",
    name: "Analytics Hub",
    description: "Relatórios e indicadores",
    status: "ACTIVE",
    createdAt: iso(120),
    userCount: 145,
    activeUserCount: 140,
    pendingUserCount: 5,
  },
];

export const users: User[] = [];
export const access: PlatformAccess[] = [];

const origins: User["origin"][] = ["CENTRAL", "LEGACY", "IMPORTED"];
const statuses: User["status"][] = ["ACTIVE", "ACTIVE", "ACTIVE", "INACTIVE", "PENDING"];

for (let i = 0; i < 180; i++) {
  const first = pick(FIRST);
  const last = pick(LAST);
  const id = String(1001 + i);
  const username = `${first
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z]/g, "")}${i}`;
  users.push({
    id,
    name: `${first} ${last}`,
    username,
    email: `${username}@email.com`,
    status: pick(statuses),
    origin: pick(origins),
    createdAt: iso(Math.floor(rand() * 700) + 5),
    lastAccessAt: rand() > 0.1 ? iso(Math.floor(rand() * 60)) : null,
    platformCount: 0,
  });
}

users[0] = {
  ...(users[0] as User),
  id: "1001",
  name: "Isaac Bunga",
  username: "isvaldo",
  email: "isaac@email.com",
  status: "ACTIVE",
  origin: "CENTRAL",
  lastAccessAt: iso(0),
};

let accessSeq = 1;
for (const u of users) {
  const n = Math.floor(rand() * 4);
  const pool = [...platforms].sort(() => rand() - 0.5).slice(0, n);
  for (const p of pool) {
    access.push({
      id: `a${accessSeq++}`,
      userId: u.id,
      userName: u.name,
      username: u.username,
      email: u.email,
      platformId: p.id,
      platformCode: p.code,
      status: rand() > 0.15 ? "ACTIVE" : rand() > 0.5 ? "PENDING" : "INACTIVE",
      origin: u.origin,
      linkedAt: iso(Math.floor(rand() * 500)),
      legacyId: u.origin === "CENTRAL" ? null : `OLD-${Math.floor(rand() * 9000) + 1000}`,
    });
  }
  u.platformCount = pool.length;
}

export const legacyUsers: LegacyUser[] = [];
for (let i = 0; i < 64; i++) {
  const first = pick(FIRST);
  const last = pick(LAST);
  const p = platforms[Math.floor(rand() * 5)] as Platform;
  const hasMatch = rand() > 0.45;
  const match = hasMatch ? (users[Math.floor(rand() * users.length)] as User) : null;
  legacyUsers.push({
    id: `l${i + 1}`,
    username: `user${String(i + 1).padStart(3, "0")}`,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@email.com`,
    platformId: p.id,
    platformCode: p.code,
    legacyId: `OLD-${1000 + i * 37}`,
    status: "PENDING",
    matchUserId: match ? match.id : null,
    matchScore: match ? Math.floor(rand() * 25) + 74 : null,
  });
}

export const migrationHistory: MigrationRecord[] = Array.from({ length: 42 }, (_, i) => {
  const u = users[Math.floor(rand() * users.length)] as User;
  const p = platforms[Math.floor(rand() * platforms.length)] as Platform;
  const r = rand();
  return {
    id: `m${i + 1}`,
    date: iso(Math.floor(rand() * 90)),
    userName: u.name,
    platformCode: p.code,
    from: "LEGACY" as const,
    to: "CENTRAL" as const,
    operation: r > 0.6 ? ("BULK_IMPORT" as const) : ("IMPORT" as const),
    admin: rand() > 0.5 ? "Admin" : "isaac.bunga",
    result: r > 0.85 ? ("MANUAL" as const) : r > 0.8 ? ("FAILED" as const) : ("SUCCESS" as const),
  };
}).sort((a, b) => b.date.localeCompare(a.date));

export function nextAccessId() {
  return `a${accessSeq++}`;
}

export function delay<T>(value: T, ms = 320): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

const LOG_ACTIONS = [
  "auth.login",
  "auth.logout",
  "auth.failed",
  "user.created",
  "user.updated",
  "access.granted",
  "access.revoked",
  "platform.sync",
  "migration.import",
  "invoice.issued",
  "report.export",
  "api.request",
];

const LOG_LEVELS: Array<"INFO" | "WARNING" | "ERROR" | "DEBUG"> = [
  "INFO",
  "INFO",
  "INFO",
  "INFO",
  "DEBUG",
  "WARNING",
  "ERROR",
];

const LOG_MESSAGES: Record<string, string> = {
  "auth.login": "Sessão iniciada com sucesso",
  "auth.logout": "Sessão terminada",
  "auth.failed": "Tentativa de autenticação falhada",
  "user.created": "Novo utilizador criado na identidade central",
  "user.updated": "Dados do utilizador atualizados",
  "access.granted": "Acesso à plataforma concedido",
  "access.revoked": "Acesso à plataforma revogado",
  "platform.sync": "Sincronização com a plataforma concluída",
  "migration.import": "Utilizador legacy importado",
  "invoice.issued": "Documento emitido",
  "report.export": "Exportação de relatório gerada",
  "api.request": "Pedido processado pela API",
};

export const logs: import("./types").LogEntry[] = Array.from({ length: 420 }, (_, i) => {
  const p = pick(platforms);
  const action = pick(LOG_ACTIONS);
  const level = action === "auth.failed" ? "ERROR" : pick(LOG_LEVELS);
  const u = users[Math.floor(rand() * users.length)] as User;
  const minutesAgo = Math.floor(rand() * 60 * 24 * 21);
  return {
    id: `log${i + 1}`,
    timestamp: new Date(Date.UTC(2026, 7, 26, 10, 0, 0) - minutesAgo * 60000).toISOString(),
    platformId: p.id,
    platformCode: p.code,
    level,
    action,
    actor: rand() > 0.15 ? u.username : "system",
    message: LOG_MESSAGES[action] ?? "Evento registado",
    ip: `197.${Math.floor(rand() * 255)}.${Math.floor(rand() * 255)}.${Math.floor(rand() * 255)}`,
    durationMs: Math.floor(rand() * 1800) + 12,
  };
}).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
