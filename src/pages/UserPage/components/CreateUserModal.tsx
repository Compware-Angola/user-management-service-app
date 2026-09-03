import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutationCreateIdentity } from "@/hooks/identify/useIdentify";

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  bi: "",
  password: "",
};

const CreateUserModal = ({ open, onOpenChange }: CreateUserModalProps) => {
  const [form, setForm] = useState(initialForm);
  const { mutate, isPending, error } = useMutationCreateIdentity();

  function handleClose(next: boolean) {
    if (!isPending) {
      onOpenChange(next);
      if (!next) setForm(initialForm);
    }
  }

  function handleCreate() {
    mutate(
      {
        ...form,
        avatar: "https://cdn.uma.ao/avatars/default.png",
      },
      {
        onSuccess: () => {
          setForm(initialForm);
          onOpenChange(false);
        },
      },
    );
  }

  const isValid = form.firstName && form.lastName && form.email && form.bi && form.password;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Utilizador</DialogTitle>
          <DialogDescription>
            Regista um novo utilizador na identidade central.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Primeiro nome</label>
              <Input
                placeholder="Ex: Manasses"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ultimo nome</label>
              <Input
                placeholder="Ex: Gomes"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                disabled={isPending}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="Ex: exemplo@uma.ao"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              disabled={isPending}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone</label>
              <Input
                placeholder="Ex: +244923000000"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">BI</label>
              <Input
                placeholder="Ex: 004521547LA042"
                value={form.bi}
                onChange={(e) => setForm((f) => ({ ...f, bi: e.target.value }))}
                disabled={isPending}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Palavra-passe</label>
            <Input
              type="password"
              placeholder="Palavra-passe segura"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              disabled={isPending}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error.message}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={!isValid || isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Criar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { CreateUserModal };
