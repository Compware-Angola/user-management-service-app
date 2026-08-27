import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, Search, Shield, Upload } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { DataPagination } from "@/components/common/DataPagination";
import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { PlatformTag } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePendingUsers, useBulkImport } from "@/hooks/useMigration";
import { usePlatformOptions } from "@/hooks/usePlatforms";

export const Route = createFileRoute("/migration/pending")({
  head: () => ({
    meta: [
      { title: "Utilizadores Pendentes — Identity Access Admin" },
      {
        name: "description",
        content:
          "Utilizadores encontrados em plataformas legacy mas ainda não registados na nova estrutura.",
      },
    ],
  }),
  component: PendingPage,
});

function PendingPage() {
  const [search, setSearch] = useState("");
  const [platformId, setPlatformId] = useState("ALL");
  const [match, setMatch] = useState<"ALL" | "WITH" | "WITHOUT">("ALL");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ processed: number; total: number } | null>(
    null,
  );

  const filters = useMemo(
    () => ({ search, platformId, match, page, pageSize: 10 }),
    [search, platformId, match, page],
  );

  const query = usePendingUsers(filters);
  const platforms = usePlatformOptions();
  const bulkImport = useBulkImport();

  function reset<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  function toggleSelect(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleAll() {
    const ids = query.data?.data.map((u) => u.id) ?? [];
    if (selected.length === ids.length) {
      setSelected([]);
    } else {
      setSelected(ids);
    }
  }

  function handleBulkImport() {
    setBulkProgress({ processed: 0, total: selected.length });
    bulkImport.mutate(
      { ids: selected, onProgress: (processed, total) => setBulkProgress({ processed, total }) },
      {
        onSuccess: () => {
          setBulkOpen(false);
          setBulkProgress(null);
          setSelected([]);
        },
      },
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Utilizadores Pendentes"
        description="Utilizadores encontrados em plataformas legacy mas ainda não registados na nova estrutura."
        actions={
          selected.length > 0 ? (
            <Button onClick={() => setBulkOpen(true)}>
              <Upload className="size-4" />
              Importar selecionados ({selected.length})
            </Button>
          ) : undefined
        }
      />

      <Card className="shadow-none">
        <div className="grid gap-3 border-b border-border p-4 md:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nome, username, email..."
              value={search}
              onChange={(e) => reset(setSearch)(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={platformId} onValueChange={reset(setPlatformId)}>
            <SelectTrigger>
              <SelectValue placeholder="Plataforma de origem" />
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
          <Select value={match} onValueChange={reset(setMatch)}>
            <SelectTrigger>
              <SelectValue placeholder="Correspondência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              <SelectItem value="WITH">Com correspondência</SelectItem>
              <SelectItem value="WITHOUT">Sem correspondência</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={
                    selected.length === (query.data?.data.length ?? 0) && selected.length > 0
                  }
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Username</TableHead>
              <TableHead className="hidden md:table-cell">Nome</TableHead>
              <TableHead className="hidden lg:table-cell">Email</TableHead>
              <TableHead className="w-[100px]">Plataforma</TableHead>
              <TableHead className="hidden md:table-cell w-[100px]">ID antigo</TableHead>
              <TableHead className="w-[120px]">Correspondência</TableHead>
              <TableHead className="w-[80px] text-right">Ação</TableHead>
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
                    title="Não foi possível carregar os dados"
                    description={(query.error as Error).message}
                    action={<Button onClick={() => query.refetch()}>Tentar novamente</Button>}
                  />
                </TableCell>
              </TableRow>
            ) : query.data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <EmptyState
                    icon={CheckCircle2}
                    title="Nenhum utilizador pendente"
                    description="Todos os utilizadores legacy foram migrados."
                  />
                </TableCell>
              </TableRow>
            ) : (
              query.data?.data.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.includes(u.id)}
                      onCheckedChange={() => toggleSelect(u.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{u.username}</TableCell>
                  <TableCell className="hidden md:table-cell font-medium">{u.name}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <PlatformTag code={u.platformCode} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                    {u.legacyId}
                  </TableCell>
                  <TableCell>
                    {u.matchUserId ? (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle2 className="size-3" />
                        {u.matchScore}%
                      </Badge>
                    ) : (
                      <Badge variant="neutral">Sem correspondência</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/migration/import" search={{ legacyId: u.id }}>
                        Importar
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

      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Migrar {selected.length} utilizadores?</DialogTitle>
            <DialogDescription>
              Os utilizadores serão associados à nova estrutura de Identity + Platform Access.
            </DialogDescription>
          </DialogHeader>
          {bulkProgress ? (
            <div className="space-y-4 py-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{
                    width: `${Math.round((bulkProgress.processed / bulkProgress.total) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {bulkProgress.processed} de {bulkProgress.total} processados
              </p>
            </div>
          ) : (
            <DialogFooter>
              <Button variant="outline" onClick={() => setBulkOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleBulkImport}>Confirmar</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
