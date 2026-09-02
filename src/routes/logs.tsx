import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Download, RefreshCcw, ScrollText, TriangleAlert } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { DataPagination } from "@/components/common/DataPagination";
import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { LogLevelBadge, PlatformTag } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLogs, useLogStats } from "@/hooks/useLogs";
//import { usePlatformOptions } from "@/hooks/usePlatforms";
import { logActions, logsToCsv } from "@/services/logs.service";
import { formatDateTime, formatNumber } from "@/lib/format";
import type { LogEntry, LogLevel } from "@/lib/types";

export const Route = createFileRoute("/logs")({
  head: () => ({
    meta: [
      { title: "Logs Gerais — Identity Access Admin" },
      {
        name: "description",
        content:
          "Consulta centralizada dos logs de todas as plataformas: autenticações, acessos, migrações e erros.",
      },
      { property: "og:title", content: "Logs Gerais de Todas as Plataformas" },
      {
        property: "og:description",
        content:
          "Auditoria unificada de eventos de todas as plataformas ligadas à identidade central.",
      },
    ],
  }),
  component: LogsPage,
});

function LogsPage() {
  const [search, setSearch] = useState("");
  const [platformId, setPlatformId] = useState("ALL");
  const [level, setLevel] = useState<LogLevel | "ALL">("ALL");
  const [action, setAction] = useState("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<LogEntry | null>(null);

  const filters = useMemo(
    () => ({ search, platformId, level, action, from, to, page, pageSize: 15 }),
    [search, platformId, level, action, from, to, page],
  );

  const query = useLogs(filters);
  const stats = useLogStats({ search, platformId, level, action, from, to });
  //const platforms = usePlatformOptions();
  const actions = useMemo(() => logActions(), []);

  function reset<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  function exportCsv() {
    const csv = logsToCsv(query.data?.data ?? []);
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `logs-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell>
      <PageHeader
        title="Logs Gerais"
        description="Eventos agregados de todas as plataformas ligadas à identidade central."
        actions={
          <>
            <Button variant="outline" onClick={() => query.refetch()}>
              <RefreshCcw className="size-4" />
              Atualizar
            </Button>
            <Button onClick={exportCsv} disabled={!query.data?.data.length}>
              <Download className="size-4" />
              Exportar CSV
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Eventos" value={stats.data?.total ?? 0} icon={ScrollText} />
        <StatCard label="Plataformas" value={stats.data?.platforms ?? 0} icon={ScrollText} />
        <StatCard
          label="Avisos"
          value={stats.data?.warnings ?? 0}
          icon={TriangleAlert}
          tone="warning"
        />
        <StatCard
          label="Erros"
          value={stats.data?.errors ?? 0}
          icon={AlertTriangle}
          tone="warning"
        />
      </div>

      <Card className="shadow-none">
        <div className="grid gap-3 border-b border-border p-4 md:grid-cols-3 xl:grid-cols-6">
          <Input
            placeholder="Pesquisar por ator, ação, IP..."
            value={search}
            onChange={(event) => reset(setSearch)(event.target.value)}
            className="xl:col-span-2"
          />
          <Select value={platformId} onValueChange={reset(setPlatformId)}>
            <SelectTrigger>
              <SelectValue placeholder="Plataforma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as plataformas</SelectItem>
              {/* {platforms.data?.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.code} — {p.name}
                </SelectItem>
              ))} */}
            </SelectContent>
          </Select>
          <Select
            value={level}
            onValueChange={(value) => reset(setLevel)(value as LogLevel | "ALL")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os níveis</SelectItem>
              <SelectItem value="INFO">INFO</SelectItem>
              <SelectItem value="WARNING">WARNING</SelectItem>
              <SelectItem value="ERROR">ERROR</SelectItem>
              <SelectItem value="DEBUG">DEBUG</SelectItem>
            </SelectContent>
          </Select>
          <Select value={action} onValueChange={reset(setAction)}>
            <SelectTrigger>
              <SelectValue placeholder="Ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as ações</SelectItem>
              {actions.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input type="date" value={from} onChange={(e) => reset(setFrom)(e.target.value)} />
            <Input type="date" value={to} onChange={(e) => reset(setTo)(e.target.value)} />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Data/Hora</TableHead>
              <TableHead className="w-[90px]">Nível</TableHead>
              <TableHead className="w-[110px]">Plataforma</TableHead>
              <TableHead className="w-[150px]">Ação</TableHead>
              <TableHead>Mensagem</TableHead>
              <TableHead className="w-[130px]">Ator</TableHead>
              <TableHead className="w-[90px] text-right">Duração</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              <TableSkeleton rows={8} columns={7} />
            ) : query.isError ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState
                    icon={AlertTriangle}
                    title="Não foi possível carregar os logs"
                    description={(query.error as Error).message}
                    action={<Button onClick={() => query.refetch()}>Tentar novamente</Button>}
                  />
                </TableCell>
              </TableRow>
            ) : query.data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState
                    icon={ScrollText}
                    title="Sem eventos"
                    description="Ajusta os filtros para encontrar registos."
                  />
                </TableCell>
              </TableRow>
            ) : (
              query.data?.data.map((log) => (
                <TableRow key={log.id} onClick={() => setSelected(log)} className="cursor-pointer">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatDateTime(log.timestamp)}
                  </TableCell>
                  <TableCell>
                    <LogLevelBadge level={log.level} />
                  </TableCell>
                  <TableCell>
                    <PlatformTag code={log.platformCode} />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{log.action}</TableCell>
                  <TableCell className="text-sm">{log.message}</TableCell>
                  <TableCell className="font-mono text-xs">{log.actor}</TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {formatNumber(log.durationMs)} ms
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <DataPagination
          page={page}
          pageSize={15}
          total={query.data?.total ?? 0}
          onPageChange={setPage}
        />
      </Card>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhe do evento</DialogTitle>
            <DialogDescription>Registo completo do log selecionado.</DialogDescription>
          </DialogHeader>
          {selected ? (
            <dl className="space-y-2 text-sm">
              {[
                ["ID", selected.id],
                ["Data/Hora", formatDateTime(selected.timestamp)],
                ["Nível", selected.level],
                ["Plataforma", selected.platformCode],
                ["Ação", selected.action],
                ["Ator", selected.actor],
                ["IP", selected.ip],
                ["Duração", `${selected.durationMs} ms`],
                ["Mensagem", selected.message],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 border-b border-border pb-1.5"
                >
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-mono text-xs text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
