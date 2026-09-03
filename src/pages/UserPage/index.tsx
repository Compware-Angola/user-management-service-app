import { useEffect, useState } from "react";
import { AlertTriangle, Eye, Plus, Search, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { DataPagination } from "@/components/common/DataPagination";
import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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

import { formatDate } from "@/lib/format";
import { useQueryIdentity, useMutationActivateIdentity } from "@/hooks/identify/useIdentify";
import { useQueryPlatforms } from "@/hooks/usePlatforms";
import { normalizeQueryResponse } from "@/utils/normalize-query-response";
import { UserDetailModal } from "./components/UserDetailModal";
import { CreateUserModal } from "./components/CreateUserModal";

const PAGE_SIZE = 10;

function UsersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [origin, setOrigin] = useState("ALL");
  const [platformId, setPlatformId] = useState("ALL");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const statusMap: Record<string, number | undefined> = {
    ALL: undefined,
    ACTIVE: 1,
    INACTIVE: 0,
    PENDING: 2,
  };

  const query = useQueryIdentity({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: statusMap[status],
    platformCode: platformId === "ALL" ? undefined : platformId,
  });
  const { mutate: toggleStatus, isPending: isToggling } = useMutationActivateIdentity();
  const { data: platformsResponse } = useQueryPlatforms({ limit: 100 });
  const platforms = platformsResponse?.data ?? [];

  const { data: users, total } = normalizeQueryResponse(query.data);

  return (
    <AppShell>
      <PageHeader
        title="Utilizadores"
        description="Gestão de todos os utilizadores registados na identidade central."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
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
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os status</SelectItem>
              <SelectItem value="ACTIVE">Ativo</SelectItem>
              <SelectItem value="INACTIVE">Inativo</SelectItem>
            </SelectContent>
          </Select>

          <Select value={platformId} onValueChange={setPlatformId}>
            <SelectTrigger>
              <SelectValue placeholder="Plataforma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as plataformas</SelectItem>
              {platforms.map((p) => (
                <SelectItem key={p.id} value={p.code}>
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
              <TableHead className="w-[80px] text-center">Ativo</TableHead>
              <TableHead className="hidden md:table-cell">Telefone</TableHead>
              <TableHead className="hidden xl:table-cell w-[140px]">Último acesso</TableHead>
              <TableHead className="w-[60px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              <TableSkeleton rows={8} columns={8} />
            ) : query.isError ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <EmptyState
                    icon={AlertTriangle}
                    title="Não foi possível carregar os utilizadores"
                    description={(query.error as Error).message}
                    action={<Button onClick={() => query.refetch()}>Tentar novamente</Button>}
                  />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <EmptyState
                    icon={Users}
                    title="Nenhum utilizador encontrado"
                    description="Ainda não existem utilizadores registados."
                    action={
                      <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="size-4" />
                        Novo Utilizador
                      </Button>
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
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
                  <TableCell className="text-center">
                    <Switch
                      checked={user.status === 1}
                      disabled={isToggling}
                      onCheckedChange={(checked) => {
                        toggleStatus({ id: user.id, status: checked });
                      }}
                    />
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {user.phone}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Ver detalhes"
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setModalOpen(true);
                      }}
                    >
                      <Eye className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <DataPagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
      </Card>

      <UserDetailModal open={modalOpen} onOpenChange={setModalOpen} userId={selectedUserId} />
      <CreateUserModal open={createOpen} onOpenChange={setCreateOpen} />
    </AppShell>
  );
}
export { UsersPage };
