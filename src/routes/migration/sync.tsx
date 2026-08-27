import { createFileRoute } from "@tanstack/react-router";
import { RefreshCcw } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { PlatformTag } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSyncOverview, useSyncPlatform } from "@/hooks/useMigration";
import { formatNumber } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/migration/sync")({
  head: () => ({
    meta: [
      { title: "Sincronização — Identity Access Admin" },
      {
        name: "description",
        content:
          "Estado de sincronização entre plataformas legacy e a nova estrutura centralizada.",
      },
    ],
  }),
  component: SyncPage,
});

function SyncPage() {
  const query = useSyncOverview();
  const syncPlatform = useSyncPlatform();

  function handleSync(platformId: string) {
    syncPlatform.mutate(platformId, {
      onSuccess: (data) => {
        toast.success(`Sincronização concluída. ${data.found} utilizadores encontrados.`);
      },
    });
  }

  function handleSyncAll() {
    if (!query.data) return;
    for (const row of query.data) {
      if (row.pending > 0) {
        syncPlatform.mutate(row.platformId);
      }
    }
    toast.info("Sincronização de todas as plataformas iniciada.");
  }

  return (
    <AppShell>
      <PageHeader
        title="Sincronização"
        description="Estado de sincronização entre plataformas legacy e a nova estrutura."
        actions={
          <Button onClick={handleSyncAll} disabled={!query.data?.length}>
            <RefreshCcw className="size-4" />
            Sincronizar todas
          </Button>
        }
      />

      <Card className="shadow-none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plataforma</TableHead>
              <TableHead className="text-right">Total Legacy</TableHead>
              <TableHead className="text-right">Central</TableHead>
              <TableHead className="text-right">Pendentes</TableHead>
              <TableHead className="w-[120px] text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              <TableSkeleton rows={6} columns={5} />
            ) : !query.data?.length ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState
                    icon={RefreshCcw}
                    title="Nenhuma plataforma encontrada"
                    description="Adicione plataformas para poder sincronizar."
                  />
                </TableCell>
              </TableRow>
            ) : (
              query.data.map((row) => (
                <TableRow key={row.platformId}>
                  <TableCell>
                    <PlatformTag code={row.platformCode} />
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatNumber(row.legacyTotal)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatNumber(row.centralTotal)}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.pending > 0 ? (
                      <Badge variant="warning">{formatNumber(row.pending)}</Badge>
                    ) : (
                      <Badge variant="success">0</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSync(row.platformId)}
                      disabled={syncPlatform.isPending}
                    >
                      <RefreshCcw className="size-4" />
                      Sincronizar
                    </Button>
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
