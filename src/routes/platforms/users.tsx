import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Search, UsersRound } from "lucide-react";
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


export const Route = createFileRoute("/platforms/users")({
  head: () => ({
    meta: [
      { title: "Utilizadores por Plataforma — Identity Access Admin" },
      {
        name: "description",
        content: "Visualização de utilizadores agrupados por plataforma.",
      },
    ],
  }),
  component: PlatformUsersPage,
});

function PlatformUsersPage() {
  const [search, setSearch] = useState("");
  const [platformId, setPlatformId] = useState("ALL");
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({ search, platformId, page, pageSize: 10 }),
    [search, platformId, page],
  );

  const query = useAccessList(filters);
  const platforms = { data: [] as { id: string; code: string; name: string }[] };

  return (
    <AppShell>
      <PageHeader
        title="Utilizadores por Plataforma"
        description="Visualização de utilizadores agrupados por plataforma."
      />

      <Card className="shadow-none">
        <div className="grid gap-3 border-b border-border p-4 md:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por utilizador, plataforma..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-8"
            />
          </div>
          <Select
            value={platformId}
            onValueChange={(v) => {
              setPlatformId(v);
              setPage(1);
            }}
          >
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
              <TableHead>Plataforma</TableHead>
              <TableHead>Utilizador</TableHead>
              <TableHead className="hidden md:table-cell">Username</TableHead>
              <TableHead className="hidden lg:table-cell">Email</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="hidden md:table-cell w-[100px]">Origem</TableHead>
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
                    title="Não foi possível carregar os dados"
                    description={(query.error as Error).message}
                    action={<Button onClick={() => query.refetch()}>Tentar novamente</Button>}
                  />
                </TableCell>
              </TableRow>
            ) : query.data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState
                    icon={UsersRound}
                    title="Nenhum registo encontrado"
                    description="Ajusta os filtros para encontrar resultados."
                  />
                </TableCell>
              </TableRow>
            ) : (
              query.data?.data.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <PlatformTag code={a.platformCode} />
                  </TableCell>
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
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/platforms/$id" params={{ id: a.platformId }}>
                        Ver plataforma
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
