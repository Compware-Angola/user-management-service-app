import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeftRight, Plus, Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { DataPagination } from "@/components/common/DataPagination";
import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { OriginBadge, PlatformTag, StatusBadge } from "@/components/common/StatusBadge";
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
import { useAccessList } from "@/hooks/usePlatformAccess";
import { usePlatformOptions } from "@/hooks/usePlatforms";
import { formatDate } from "@/lib/format";
import type { AccessStatus, Origin } from "@/lib/types";

export const Route = createFileRoute("/identity/access")({
  head: () => ({
    meta: [
      { title: "Utilizador ↔ Plataformas — Identity Access Admin" },
      {
        name: "description",
        content: "Relação entre utilizadores e plataformas: acessos, status e origem.",
      },
    ],
  }),
  component: AccessPage,
});

function AccessPage() {
  const [search, setSearch] = useState("");
  const [platformId, setPlatformId] = useState("ALL");
  const [status, setStatus] = useState<AccessStatus | "ALL">("ALL");
  const [origin, setOrigin] = useState<Origin | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({ search, platformId, status, origin, page, pageSize: 10 }),
    [search, platformId, status, origin, page],
  );

  const query = useAccessList(filters);
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
        title="Utilizador ↔ Plataformas"
        description="Relação centralizada de acessos entre utilizadores e plataformas."
        actions={
          <Button>
            <Plus className="size-4" />
            Associar utilizador
          </Button>
        }
      />

      <Card className="shadow-none">
        <div className="grid gap-3 border-b border-border p-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por utilizador, plataforma..."
              value={search}
              onChange={(e) => reset(setSearch)(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={platformId} onValueChange={reset(setPlatformId)}>
            <SelectTrigger>
              <SelectValue placeholder="Plataforma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as plataformas</SelectItem>
              {platforms.data?.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.code} — {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={reset(setStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os status</SelectItem>
              <SelectItem value="ACTIVE">Ativo</SelectItem>
              <SelectItem value="INACTIVE">Inativo</SelectItem>
              <SelectItem value="PENDING">Pendente</SelectItem>
            </SelectContent>
          </Select>
          <Select value={origin} onValueChange={reset(setOrigin)}>
            <SelectTrigger>
              <SelectValue placeholder="Origem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as origens</SelectItem>
              <SelectItem value="CENTRAL">Central</SelectItem>
              <SelectItem value="LEGACY">Legacy</SelectItem>
              <SelectItem value="IMPORTED">Importado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilizador</TableHead>
              <TableHead className="hidden md:table-cell">Username</TableHead>
              <TableHead>Plataforma</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="hidden md:table-cell w-[100px]">Origem</TableHead>
              <TableHead className="hidden lg:table-cell w-[120px]">Data de associação</TableHead>
              <TableHead className="w-[60px] text-right">Ações</TableHead>
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
                    title="Não foi possível carregar os acessos"
                    description={(query.error as Error).message}
                    action={<Button onClick={() => query.refetch()}>Tentar novamente</Button>}
                  />
                </TableCell>
              </TableRow>
            ) : query.data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState
                    icon={ArrowLeftRight}
                    title="Nenhum acesso encontrado"
                    description="Ajusta os filtros ou cria uma nova associação."
                  />
                </TableCell>
              </TableRow>
            ) : (
              query.data?.data.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.userName}</TableCell>
                  <TableCell className="hidden md:table-cell font-mono text-xs">
                    {a.username}
                  </TableCell>
                  <TableCell>
                    <PlatformTag code={a.platformCode} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={a.status} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <OriginBadge origin={a.origin} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {formatDate(a.linkedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/identity/users/$id" params={{ id: a.userId }}>
                        Ver
                      </Link>
                    </Button>
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
