import { useState } from "react";
import { AlertTriangle, Plus, Search, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { StatusBadge as UserStatusBadge } from "@/components/common/StatusBadge";
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

import { formatDate } from "@/lib/format";
import { useQueryIdentity } from "@/hooks/identify/useIdentify";

function UsersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [origin, setOrigin] = useState("ALL");
  const [platformId, setPlatformId] = useState("ALL");

  const query = useQueryIdentity();
  const platforms = { data: [] as { id: string; code: string; name: string }[] };

  const users = query.data ?? [];

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
              <SelectItem value="PENDING">Pendente</SelectItem>
            </SelectContent>
          </Select>
          <Select value={origin} onValueChange={setOrigin}>
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
          <Select value={platformId} onValueChange={setPlatformId}>
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
              <TableHead className="hidden md:table-cell">Telefone</TableHead>
              <TableHead className="hidden xl:table-cell w-[140px]">Último acesso</TableHead>
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
                      <Button>
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
                  <TableCell>
                    <UserStatusBadge status={user.status === 1 ? "ACTIVE" : "INACTIVE"} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {user.phone}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </AppShell>
  );
}
export { UsersPage };
