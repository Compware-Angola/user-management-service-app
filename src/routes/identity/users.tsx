import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Eye, Plus, Search, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { DataPagination } from "@/components/common/DataPagination";
import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import {
  StatusBadge as UserStatusBadge,
  OriginBadge as UserOriginBadge,
} from "@/components/common/StatusBadge";
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
import { useUsers } from "@/hooks/useUsers";
import { usePlatformOptions } from "@/hooks/usePlatforms";
import { formatDate } from "@/lib/format";
import type { Origin, UserStatus } from "@/lib/types";

export const Route = createFileRoute("/identity/users")({
  head: () => ({
    meta: [
      { title: "Utilizadores — Identity Access Admin" },
      {
        name: "description",
        content: "Lista e gestão de todos os utilizadores registados na identidade central.",
      },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<UserStatus | "ALL">("ALL");
  const [origin, setOrigin] = useState<Origin | "ALL">("ALL");
  const [platformId, setPlatformId] = useState("ALL");
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({ search, status, origin, platformId, page, pageSize: 10 }),
    [search, status, origin, platformId, page],
  );

  const query = useUsers(filters);
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
        title="Utilizadores"
        description="Gestão de todos os utilizadores registados na identidade central."
        actions={
          <Button>
            <Plus className="size-4" />
            Novo Utilizador
          </Button>
        }
      />

      <Card className="shadow-none">
        <div className="grid gap-3 border-b border-border p-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nome, username, email..."
              value={search}
              onChange={(e) => reset(setSearch)(e.target.value)}
              className="pl-8"
            />
          </div>
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
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Username</TableHead>
              <TableHead className="hidden lg:table-cell">Email</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="hidden md:table-cell w-[100px]">Plataformas</TableHead>
              <TableHead className="hidden lg:table-cell w-[100px]">Origem</TableHead>
              <TableHead className="hidden xl:table-cell w-[120px]">Último acesso</TableHead>
              <TableHead className="w-[60px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              <TableSkeleton rows={8} columns={9} />
            ) : query.isError ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <EmptyState
                    icon={AlertTriangle}
                    title="Não foi possível carregar os utilizadores"
                    description={(query.error as Error).message}
                    action={<Button onClick={() => query.refetch()}>Tentar novamente</Button>}
                  />
                </TableCell>
              </TableRow>
            ) : query.data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <EmptyState
                    icon={Users}
                    title="Nenhum utilizador encontrado"
                    description="Ajusta os filtros ou cria um novo utilizador."
                    action={
                      <Button>
                        <Plus className="size-4" />
                        Novo Utilizador
                      </Button>
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              query.data?.data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {user.id}
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="hidden md:table-cell font-mono text-xs">
                    {user.username}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <UserStatusBadge status={user.status} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell font-mono text-xs">
                    {user.platformCount} plataforma{user.platformCount !== 1 ? "s" : ""}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <UserOriginBadge origin={user.origin} />
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
                    {formatDate(user.lastAccessAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to="/identity/users/$id" params={{ id: user.id }}>
                        <Eye className="size-4" />
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
