import { useState } from "react";
import { AlertTriangle, Boxes, Eye, Plus, Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { PlatformTag, StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQueryPlatforms } from "@/hooks/usePlatforms";
import { formatDate } from "@/lib/format";
import { AddPlatformModal } from "./components/AddPlatformModal";

function PlatformsPage() {
  const [open, setOpen] = useState(false);

  const query = useQueryPlatforms();
  const data = query.data ?? [];

  return (
    <AppShell>
      <PageHeader
        title="Todas as Plataformas"
        description="Gestão de plataformas ligadas à identidade central."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Nova Plataforma
          </Button>
        }
      />

      <Card className="shadow-none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Id</TableHead>
              <TableHead className="w-[100px]">Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Descrição</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="hidden lg:table-cell w-[120px]">Criada em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              <TableSkeleton rows={8} columns={6} />
            ) : query.isError ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    icon={AlertTriangle}
                    title="Não foi possível carregar as plataformas"
                    description={query.error.message}
                    action={<Button onClick={() => query.refetch()}>Tentar novamente</Button>}
                  />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    icon={Boxes}
                    title="Nenhuma plataforma encontrada"
                    description="Cria uma nova plataforma para começar."
                    action={
                      <Button onClick={() => setOpen(true)}>
                        <Plus className="size-4" />
                        Nova Plataforma
                      </Button>
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              data.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>
                    <PlatformTag code={p.code} />
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {p.description}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={p.status === 1 ? "ACTIVE" : "INACTIVE"} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {formatDate(p.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
      <AddPlatformModal onOpenChange={setOpen} open={open} />
    </AppShell>
  );
}

export { PlatformsPage };
