import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Calendar, CheckCircle2, Clock, Mail, Plus, Trash2, User } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { OriginBadge, PlatformTag, StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { useUser } from "@/hooks/useUsers";
import { useAccessByUser, useCreateAccess, useDeleteAccess } from "@/hooks/usePlatformAccess";
import { usePlatformOptions } from "@/hooks/usePlatforms";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/identity/users/$id")({
  head: () => ({
    meta: [{ title: "Detalhe do Utilizador — Identity Access Admin" }],
  }),
  component: UserDetailPage,
});

function UserDetailPage() {
  const { id } = useParams({ from: "/identity/users/$id" });
  const user = useUser(id);
  const access = useAccessByUser(id);
  const platforms = usePlatformOptions();
  const createAccess = useCreateAccess();
  const deleteAccess = useDeleteAccess();

  const [addOpen, setAddOpen] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  function handleAdd() {
    for (const platformId of selectedPlatforms) {
      createAccess.mutate({ userId: id, platformId });
    }
    setAddOpen(false);
    setSelectedPlatforms([]);
  }

  function handleRemoveAccess(accessId: string) {
    deleteAccess.mutate(accessId);
  }

  const linkedPlatformIds = new Set(access.data?.map((a) => a.platformId) ?? []);
  const availablePlatforms = platforms.data?.filter((p) => !linkedPlatformIds.has(p.id)) ?? [];

  return (
    <AppShell>
      <PageHeader
        title={user.data?.name ?? "Utilizador"}
        description="Detalhe do utilizador e plataformas associadas."
        actions={
          <Button variant="outline" asChild>
            <Link to="/identity/users">
              <ArrowLeft className="size-4" />
              Voltar
            </Link>
          </Button>
        }
      />

      {user.isLoading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 w-full lg:col-span-1" />
          <Skeleton className="h-64 w-full lg:col-span-2" />
        </div>
      ) : user.isError ? (
        <Card className="p-6 text-center text-muted-foreground">Utilizador não encontrado.</Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-5 shadow-none">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Informações</h2>
            <dl className="space-y-3">
              {[
                [User, "Nome", user.data.name],
                [User, "Username", user.data.username],
                [Mail, "Email", user.data.email],
                [null, "Status", <StatusBadge status={user.data.status} />],
                [null, "Origem", <OriginBadge origin={user.data.origin} />],
                [Calendar, "Criado em", formatDate(user.data.createdAt)],
                [Clock, "Último acesso", formatDate(user.data.lastAccessAt)],
              ].map(([Icon, label, value]) => (
                <div key={label} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="flex items-center gap-1.5 text-right font-medium">
                    {typeof value === "string" ? value : value}
                  </span>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-5 shadow-none lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Plataformas</h2>
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <Plus className="size-4" />
                Adicionar plataforma
              </Button>
            </div>

            {access.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : !access.data?.length ? (
              <div className="rounded-md border border-dashed border-border p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Este utilizador não possui plataformas associadas.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {access.data.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-border px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <PlatformTag code={a.platformCode} />
                      <div className="leading-tight">
                        <StatusBadge status={a.status} />
                        <p className="mt-1 text-xs text-muted-foreground">
                          Desde: {formatDate(a.linkedAt)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRemoveAccess(a.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar plataforma</DialogTitle>
            <DialogDescription>
              Selecione as plataformas que deseja associar a este utilizador.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {availablePlatforms.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Todas as plataformas já estão associadas.
              </p>
            ) : (
              availablePlatforms.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-3 rounded-md border border-border px-3 py-2 hover:bg-muted cursor-pointer"
                >
                  <Checkbox
                    checked={selectedPlatforms.includes(p.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedPlatforms((prev) => [...prev, p.id]);
                      } else {
                        setSelectedPlatforms((prev) => prev.filter((id) => id !== p.id));
                      }
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium">{p.code}</p>
                    <p className="text-xs text-muted-foreground">{p.name}</p>
                  </div>
                </label>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdd} disabled={selectedPlatforms.length === 0}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
