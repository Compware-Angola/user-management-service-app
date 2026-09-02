import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Boxes, KeyRound, ScrollText, Users, UserCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { CardsSkeleton } from "@/components/common/TableSkeleton";
import { LogLevelBadge, PlatformTag, StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardStats } from "@/services/dashboard.service";
import { useLogs, useLogStats } from "@/hooks/useLogs";
import { formatDateTime, formatNumber } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Identity Access Admin" },
      {
        name: "description",
        content:
          "Visão geral de utilizadores, plataformas, acessos e logs centralizados da estrutura Identity + Platform Access.",
      },
      { property: "og:title", content: "Dashboard — Identity Access Admin" },
      {
        property: "og:description",
        content: "Utilizadores, plataformas, acessos e logs num único painel administrativo.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const stats = useQuery({ queryKey: ["dashboard", "stats"], queryFn: getDashboardStats });
  //const platforms = usePlatforms({ page: 1, pageSize: 6 });
  const logStats = useLogStats({});
  const recentLogs = useLogs({ page: 1, pageSize: 6 });

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="Visão geral da identidade central, plataformas ligadas e atividade recente."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/logs">Ver logs gerais</Link>
            </Button>
            <Button asChild>
              <Link to="/identity/users">Gerir utilizadores</Link>
            </Button>
          </>
        }
      />

      {stats.isLoading || !stats.data ? (
        <CardsSkeleton count={5} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Utilizadores" value={stats.data.totalUsers} icon={Users} />
          <StatCard label="Ativos" value={stats.data.activeUsers} icon={UserCheck} />
          <StatCard label="Plataformas" value={stats.data.totalPlatforms} icon={Boxes} />
          <StatCard label="Acessos ativos" value={stats.data.activeAccess} icon={KeyRound} />
          <StatCard
            label="Pendentes migração"
            value={stats.data.pendingMigration}
            icon={AlertTriangle}
            tone="warning"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 shadow-none lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Plataformas</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/platforms">Ver todas</Link>
            </Button>
          </div>
          {/* <div className="space-y-2">
            {platforms.isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))
              : platforms.data?.data.map((p) => (
                  <Link
                    key={p.id}
                    to="/platforms/$id"
                    params={{ id: p.id }}
                    className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2.5 transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <PlatformTag code={p.code} />
                      <div className="leading-tight">
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-muted-foreground">
                        {formatNumber(p.userCount)} utilizadores
                      </span>
                      <StatusBadge status={p.status} />
                    </div>
                  </Link>
                ))}
          </div> */}
        </Card>

        <Card className="p-5 shadow-none">
          <div className="mb-4 flex items-center gap-2">
            <ScrollText className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Add</h2>
          </div>
        </Card>
      </div>

      <Card className="shadow-none">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-foreground">Últimos eventos</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/logs">Abrir logs gerais</Link>
          </Button>
        </div>
        <div className="divide-y divide-border">
          {recentLogs.data?.data.map((log) => (
            <div key={log.id} className="flex flex-wrap items-center gap-3 px-5 py-2.5 text-sm">
              <LogLevelBadge level={log.level} />
              <PlatformTag code={log.platformCode} />
              <span className="font-mono text-xs text-muted-foreground">{log.action}</span>
              <span className="text-foreground">{log.message}</span>
              <span className="ml-auto font-mono text-xs text-muted-foreground">
                {formatDateTime(log.timestamp)}
              </span>
            </div>
          )) ?? <Skeleton className="m-5 h-24" />}
        </div>
      </Card>
    </AppShell>
  );
}
