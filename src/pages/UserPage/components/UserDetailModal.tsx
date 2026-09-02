import { useState } from "react";
import { Loader2, Link as LinkIcon, User, Mail, Phone, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useQueryIdentityUser } from "@/hooks/identify/useIdentify";
import { useQueryPlatforms } from "@/hooks/usePlatforms";
import { useCreatePlatformAccess } from "@/hooks/useCreatePlatformAccess";
import { StatusBadge } from "@/components/common/StatusBadge";

interface UserDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number | null;
}

const UserDetailModal = ({ open, onOpenChange, userId }: UserDetailModalProps) => {
  const { data: user, isLoading, error } = useQueryIdentityUser(userId ?? undefined);
  const { data: platformsResponse } = useQueryPlatforms();
  const { mutate: createAccess, isPending, error: accessError } = useCreatePlatformAccess();

  const [platformCode, setPlatformCode] = useState("");
  const [platformUserKey, setPlatformUserKey] = useState("");

  function handleClose(next: boolean) {
    if (!isPending) {
      onOpenChange(next);
      if (!next) {
        setPlatformCode("");
        setPlatformUserKey("");
      }
    }
  }

  function handleLink() {
    if (!userId || !platformCode || !platformUserKey) return;
    createAccess(
      { userId, platformCode, platformUserKey },
      {
        onSuccess: () => {
          setPlatformCode("");
          setPlatformUserKey("");
        },
      },
    );
  }

  const linkedPlatformCodes = user?.userPlatforms?.map((up) => up.platform.code) ?? [];
  const availablePlatforms = platformsResponse?.data?.filter((p) => !linkedPlatformCodes.includes(p.code)) ?? [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Utilizador</DialogTitle>
          <DialogDescription>Informações do utilizador e plataformas vinculadas.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive py-4">{error.message}</p>
        ) : user ? (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="text-sm font-medium">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Username</p>
                  <p className="text-sm font-medium font-mono">{user.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  <p className="text-sm font-medium">{user.phone || "—"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Estado</p>
                <StatusBadge status={user.status === 1 ? "ACTIVE" : "INACTIVE"} />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">Plataformas vinculadas</h4>
              {user.userPlatforms?.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Este utilizador não tem plataformas vinculadas.
                </p>
              ) : (
                <div className="space-y-2">
                  {user.userPlatforms?.map((up) => (
                    <div
                      key={up.id}
                      className="flex items-center justify-between rounded-md border border-border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">
                          {up.platform.code.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{up.platform.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {up.platform.code}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Chave</p>
                        <p className="text-sm font-mono">{up.platformUserKey}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-semibold mb-3">Vincular a nova plataforma</h4>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Select value={platformCode} onValueChange={setPlatformCode} disabled={isPending}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecionar plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlatforms.map((p) => (
                      <SelectItem key={p.id} value={p.code}>
                        {p.code} — {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Platform User Key"
                  value={platformUserKey}
                  onChange={(e) => setPlatformUserKey(e.target.value)}
                  disabled={isPending}
                  className="flex-1"
                />
                <Button
                  onClick={handleLink}
                  disabled={!platformCode || !platformUserKey || isPending}
                  size="default"
                >
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LinkIcon className="size-4" />
                  )}
                  Vincular
                </Button>
              </div>
              {accessError && (
                <p className="mt-2 text-sm text-destructive">{accessError.message}</p>
              )}
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { UserDetailModal };
