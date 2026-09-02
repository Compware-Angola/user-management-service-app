import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Boxes, Calendar, CheckCircle2, Clock, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { DataPagination } from "@/components/common/DataPagination";
import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { OriginBadge, PlatformTag, StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePlatform } from "@/hooks/usePlatforms";
import { useAccessByPlatform, useCreateAccess, useDeleteAccess } from "@/hooks/usePlatformAccess";
import { useUsers } from "@/hooks/useUsers";
import { formatDate, formatNumber } from "@/lib/format";

export const Route = createFileRoute("/$id")({
  head: () => ({
    meta: [{ title: "Detalhe da Plataforma — Identity Access Admin" }],
  }),
  component: PlatformDetailPage,
});

function PlatformDetailPage() {
  const { id } = useParams({ from: "/platforms/$id" });
  const platform = usePlatform(id);
  const access = useAccessByPlatform(id, { page: 1, pageSize: 100 });
  const createAccess = useCreateAccess();

  const [addOpen, setAddOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState("");

  const usersQuery = useUsers({ search: userSearch, page: 1, pageSize: 20 });
  const linkedUserIds = new Set(access.data?.data.map((a) => a.userId) ?? []);
  const availableUsers = usersQuery.data?.data.filter((u) => !linkedUserIds.has(u.id)) ?? [];

  function handleAdd() {
    for (const userId of selectedUsers) {
      createAccess.mutate({ userId, platformId: id });
    }
    setAddOpen(false);
    setSelectedUsers([]);
    setUserSearch("");
  }

  return (
    <AppShell>
      <PageHeader
        title={platform.data?.name ?? "Plataforma"}
        description="Detalhe da plataforma e utilizadores associados."
        actions={
          <Button variant="outline" asChild>
            <Link to="/platforms">
              <ArrowLeft className="size-4" />
              Voltar
            </Link>
          </Button>
        }
      />

      {platform.isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : platform.isError ? (
        <Card className="p-6 text-center text-muted-foreground">Plataforma não encontrada.</Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="p-4 shadow-none">
              <p className="text-xs font-medium uppercase text-muted-foreground">Código</p>
              <PlatformTag code={platform.data.code} />
            </Card>
            <Card className="p-4 shadow-none">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Total de utilizadores
              </p>
              <p className="font-mono text-2xl font-semibold">
                {formatNumber(platform.data.userCount)}
              </p>
            </Card>
            <Card className="p-4 shadow-none">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Utilizadores ativos
              </p>
              <p className="font-mono text-2xl font-semibold text-success">
                {formatNumber(platform.data.activeUserCount)}
              </p>
            </Card>
            <Card className="p-4 shadow-none">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Utilizadores pendentes
              </p>
              <p className="font-mono text-2xl font-semibold text-warning">
                {formatNumber(platform.data.pendingUserCount)}
              </p>
            </Card>
          </div>

          <Card className="shadow-none">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h2 className="text-sm font-semibold text-foreground">Utilizadores associados</h2>
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <Plus className="size-4" />
                Adicionar Utilizadores
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilizador</TableHead>
                  <TableHead className="hidden md:table-cell">Username</TableHead>
                  <TableHead className="hidden lg:table-cell">Email</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="hidden md:table-cell w-[100px]">Origem</TableHead>
                  <TableHead className="hidden lg:table-cell w-[120px]">
                    Data de associação
                  </TableHead>
                  <TableHead className="w-[60px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {access.isLoading ? (
                  <TableSkeleton rows={6} columns={7} />
                ) : !access.data?.data.length ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <EmptyState
                        icon={Boxes}
                        title="Nenhum utilizador associado"
                        description="Adiciona utilizadores a esta plataforma."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  access.data.data.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.userName}</TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-xs">
                        {a.username}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {a.email}
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
                        <Button variant="ghost" size="icon" asChild>
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
          </Card>
        </>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar utilizadores à plataforma</DialogTitle>
            <DialogDescription>Pesquisa e seleciona os utilizadores a associar.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Pesquisar utilizador..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
          />
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {availableUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum utilizador disponível.
              </p>
            ) : (
              availableUsers.map((u) => (
                <label
                  key={u.id}
                  className="flex items-center gap-3 rounded-md border border-border px-3 py-2 hover:bg-muted cursor-pointer"
                >
                  <Checkbox
                    checked={selectedUsers.includes(u.id)}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedUsers((prev) => [...prev, u.id]);
                      else setSelectedUsers((prev) => prev.filter((id) => id !== u.id));
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {u.username} · {u.email}
                    </p>
                  </div>
                </label>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdd} disabled={selectedUsers.length === 0}>
              Adicionar selecionados
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
