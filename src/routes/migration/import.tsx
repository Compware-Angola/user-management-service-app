import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronRight, Search, Upload, UserPlus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { PlatformTag } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMatches, useImportLegacyUser } from "@/hooks/useMigration";
import { useUsers } from "@/hooks/useUsers";
import { toast } from "sonner";

export const Route = createFileRoute("/migration/import")({
  validateSearch: (search: Record<string, unknown>) => ({
    legacyId: (search.legacyId as string) || "",
  }),
  head: () => ({
    meta: [{ title: "Importar Utilizador — Identity Access Admin" }],
  }),
  component: ImportPage,
});

function ImportPage() {
  const { legacyId } = Route.useSearch();
  const [step, setStep] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const matchesQuery = useMatches(
    legacyId
      ? {
          id: legacyId,
          username: "",
          name: "",
          email: "",
          platformId: "",
          platformCode: "",
          legacyId: "",
          status: "PENDING" as const,
          matchUserId: null,
          matchScore: null,
        }
      : null,
  );
  const importUser = useImportLegacyUser();
  const usersQuery = useUsers({ search: userSearch, page: 1, pageSize: 10 });

  function handleImport() {
    importUser.mutate(
      { legacyId, userId: selectedUserId ?? undefined },
      {
        onSuccess: () => {
          toast.success("Utilizador migrado com sucesso.");
          setConfirmOpen(false);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Importar Utilizadores"
        description="Processo guiado de migração de utilizadores legacy para a nova estrutura."
        actions={
          <Button variant="outline" asChild>
            <Link to="/migration/pending">
              <ArrowLeft className="size-4" />
              Voltar
            </Link>
          </Button>
        }
      />

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className={step >= 1 ? "font-medium text-foreground" : ""}>1. Dados antigos</span>
        <ChevronRight className="size-4" />
        <span className={step >= 2 ? "font-medium text-foreground" : ""}>
          2. Procurar identidade
        </span>
        <ChevronRight className="size-4" />
        <span className={step >= 3 ? "font-medium text-foreground" : ""}>3. Confirmar</span>
      </div>

      {step === 1 && (
        <Card className="p-6 shadow-none">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Dados antigos</h2>
          {!legacyId ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Nenhum utilizador legacy selecionado.</p>
              <Button variant="link" asChild className="mt-2">
                <Link to="/migration/pending">Voltar à lista de pendentes</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">ID antigo</p>
                  <p className="font-mono text-sm">{legacyId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Username</p>
                  <p className="font-mono text-sm">
                    {matchesQuery.data ? "user" + legacyId.replace(/\D/g, "").slice(-3) : "..."}
                  </p>
                </div>
              </div>
              <Button onClick={() => setStep(2)}>
                Próximo passo
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </Card>
      )}

      {step === 2 && (
        <Card className="p-6 shadow-none">
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Procurar identidade existente
          </h2>

          {matchesQuery.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : matchesQuery.data && matchesQuery.data.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Encontrámos possíveis utilizadores:</p>
              <div className="space-y-2">
                {matchesQuery.data.map((m) => (
                  <label
                    key={m.user.id}
                    className={`flex items-center gap-3 rounded-md border px-4 py-3 cursor-pointer transition-colors ${
                      selectedUserId === m.user.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <Checkbox
                      checked={selectedUserId === m.user.id}
                      onCheckedChange={() => setSelectedUserId(m.user.id)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{m.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.user.email} · {m.user.username}
                      </p>
                    </div>
                    <Badge variant={m.score >= 80 ? "success" : "info"}>{m.score}%</Badge>
                  </label>
                ))}
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-2">Ou pesquisar outro utilizador:</p>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar utilizador..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                {userSearch &&
                  usersQuery.data?.data.map((u) => (
                    <label
                      key={u.id}
                      className={`flex items-center gap-3 rounded-md border px-3 py-2 mt-2 cursor-pointer transition-colors ${
                        selectedUserId === u.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <Checkbox
                        checked={selectedUserId === u.id}
                        onCheckedChange={() => setSelectedUserId(u.id)}
                      />
                      <div>
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {u.username} · {u.email}
                        </p>
                      </div>
                    </label>
                  ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Voltar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedUserId(null);
                    setConfirmOpen(true);
                  }}
                >
                  <UserPlus className="size-4" />
                  Criar nova identidade
                </Button>
                <Button disabled={!selectedUserId} onClick={() => setConfirmOpen(true)}>
                  Usar esta identidade
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Nenhuma identidade correspondente encontrada.
              </p>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar utilizador..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              {usersQuery.data?.data.map((u) => (
                <label
                  key={u.id}
                  className={`flex items-center gap-3 rounded-md border px-3 py-2 mt-2 cursor-pointer transition-colors ${
                    selectedUserId === u.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <Checkbox
                    checked={selectedUserId === u.id}
                    onCheckedChange={() => setSelectedUserId(u.id)}
                  />
                  <div>
                    <p className="text-sm font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {u.username} · {u.email}
                    </p>
                  </div>
                </label>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Voltar
                </Button>
                <Button onClick={() => setConfirmOpen(true)}>
                  {selectedUserId ? "Usar esta identidade" : "Criar nova identidade"}
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Migração</DialogTitle>
            <DialogDescription>Resumo da operação de migração.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Utilizador:</span>
              <span className="font-medium">
                {selectedUserId
                  ? (usersQuery.data?.data.find((u) => u.id === selectedUserId)?.name ??
                    "Selecionado")
                  : "Nova identidade"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plataforma:</span>
              <PlatformTag code="LEGACY" />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Origem:</span>
              <span className="font-medium">LEGACY</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleImport} disabled={importUser.isPending}>
              {importUser.isPending ? "A migrar..." : "Confirmar Migração"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
