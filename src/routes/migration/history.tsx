import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, History, Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { DataPagination } from "@/components/common/DataPagination";
import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { PlatformTag, ResultBadge } from "@/components/common/StatusBadge";
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
import { useMigrationHistory } from "@/hooks/useMigration";
import { usePlatformOptions } from "@/hooks/usePlatforms";
import { formatDateTime } from "@/lib/format";
import type { MigrationResult } from "@/lib/types";

export const Route = createFileRoute("/migration/history")({
  head: () => ({
    meta: [
      { title: "Histórico de Migrações — Identity Access Admin" },
      {
        name: "description",
        content: "Registo completo de todas as operações de migração realizadas.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [search, setSearch] = useState("");
  const [platformCode, setPlatformCode] = useState("ALL");
  const [result, setResult] = useState<MigrationResult | "ALL">("ALL");
  const [admin, setAdmin] = useState("ALL");
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({ search, platformCode, result, admin, page, pageSize: 10 }),
    [search, platformCode, result, admin, page],
  );

  const query = useMigrationHistory(filters);
  const platforms = usePlatformOptions();

  function reset<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <AppShell>
      <PageHeader
        title="Histórico de Migrações"
        description="Registo completo de todas as operações de migração realizadas."
      />

      <Card className="shadow-none">
        <div className="grid gap-3 border-b border-border p-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por utilizador..."
              value={search}
              onChange={(e) => reset(setSearch)(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={platformCode} onValueChange={reset(setPlatformCode)}>
            <SelectTrigger>
              <SelectValue placeholder="Plataforma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as plataformas</SelectItem>
              {platforms.data?.map((p) => (
                <SelectItem key={p.id} value={p.code}>
                  {p.code} — {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={result} onValueChange={reset(setResult)}>
            <SelectTrigger>
              <SelectValue placeholder="Resultado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os resultados</SelectItem>
              <SelectItem value="SUCCESS">Sucesso</SelectItem>
              <SelectItem value="FAILED">Falhou</SelectItem>
              <SelectItem value="MANUAL">Intervenção manual</SelectItem>
            </SelectContent>
          </Select>
          <Select value={admin} onValueChange={reset(setAdmin)}>
            <SelectTrigger>
              <SelectValue placeholder="Administrador" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os admin</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="isaac.bunga">isaac.bunga</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Data</TableHead>
              <TableHead>Utilizador</TableHead>
              <TableHead className="hidden md:table-cell">Plataforma</TableHead>
              <TableHead className="hidden lg:table-cell w-[130px]">Origem → Destino</TableHead>
              <TableHead className="hidden md:table-cell w-[100px]">Operação</TableHead>
              <TableHead className="hidden lg:table-cell w-[100px]">Administrador</TableHead>
              <TableHead className="w-[120px]">Resultado</TableHead>
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
                    title="Não foi possível carregar o histórico"
                    description={(query.error as Error).message}
                    action={<Button onClick={() => query.refetch()}>Tentar novamente</Button>}
                  />
                </TableCell>
              </TableRow>
            ) : query.data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState
                    icon={History}
                    title="Nenhum registo encontrado"
                    description="Ajusta os filtros para encontrar migrações."
                  />
                </TableCell>
              </TableRow>
            ) : (
              query.data?.data.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatDateTime(m.date)}
                  </TableCell>
                  <TableCell className="font-medium">{m.userName}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <PlatformTag code={m.platformCode} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {m.from} → {m.to}
                  </TableCell>
                  <TableCell className="hidden md:table-cell font-mono text-xs">
                    {m.operation}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {m.admin}
                  </TableCell>
                  <TableCell>
                    <ResultBadge result={m.result} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <DataPagination
          page={page}
          pageSize={10}
          total={query.data?.total ?? 0}
          onPageChange={setPage}
        />
      </Card>
    </AppShell>
  );
}
