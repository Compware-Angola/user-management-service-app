import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Boxes, Eye, Plus, Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { DataPagination } from "@/components/common/DataPagination";
import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { PlatformTag, StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { usePlatforms, useCreatePlatform } from "@/hooks/usePlatforms";
import { formatDate, formatNumber } from "@/lib/format";
import type { PlatformStatus } from "@/lib/types";

export const Route = createFileRoute("/platforms")({
  head: () => ({
    meta: [
      { title: "Plataformas — Identity Access Admin" },
      {
        name: "description",
        content: "Lista e gestão de todas as plataformas ligadas à identidade central.",
      },
    ],
  }),
  component: PlatformsPage,
});

function PlatformsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PlatformStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    status: "ACTIVE" as PlatformStatus,
  });

  const filters = useMemo(() => ({ search, status, page, pageSize: 10 }), [search, status, page]);
  const query = usePlatforms(filters);
  const createPlatform = useCreatePlatform();

  function reset<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  function handleCreate() {
    createPlatform.mutate(form, {
      onSuccess: () => {
        setCreateOpen(false);
        setForm({ code: "", name: "", description: "", status: "ACTIVE" });
      },
    });
  }

  return (
    <AppShell>
      <PageHeader
        title="Todas as Plataformas"
        description="Gestão de plataformas ligadas à identidade central."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Nova Plataforma
          </Button>
        }
      />

      <Card className="shadow-none">
        <div className="grid gap-3 border-b border-border p-4 md:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por código, nome, descrição..."
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
              <SelectItem value="ACTIVE">Ativa</SelectItem>
              <SelectItem value="INACTIVE">Inativa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Descrição</TableHead>
              <TableHead className="w-[120px] text-right">Utilizadores</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="hidden lg:table-cell w-[120px]">Criada em</TableHead>
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
                    title="Não foi possível carregar as plataformas"
                    description={(query.error as Error).message}
                    action={<Button onClick={() => query.refetch()}>Tentar novamente</Button>}
                  />
                </TableCell>
              </TableRow>
            ) : query.data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState
                    icon={Boxes}
                    title="Nenhuma plataforma encontrada"
                    description="Cria uma nova plataforma para começar."
                    action={
                      <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="size-4" />
                        Nova Plataforma
                      </Button>
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              query.data?.data.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <PlatformTag code={p.code} />
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {p.description}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatNumber(p.userCount)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {formatDate(p.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to="/platforms/$id" params={{ id: p.id }}>
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Plataforma</DialogTitle>
            <DialogDescription>Cria uma nova plataforma para gerir acessos.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Código</label>
              <Input
                placeholder="Ex: INVOICE"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input
                placeholder="Ex: Invoice Management"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Input
                placeholder="Descrição da plataforma"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={!form.code || !form.name}>
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
