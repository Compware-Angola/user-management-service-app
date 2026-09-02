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
import { useMutationCreatePlatform } from "@/hooks/usePlatforms";

interface AddPlatformModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialForm = {
  code: "",
  name: "",
  description: "",
};

const AddPlatformModal = ({ open, onOpenChange }: AddPlatformModalProps) => {
  const [form, setForm] = useState(initialForm);
  const { mutate, isPending, error } = useMutationCreatePlatform();

  function handleClose(next: boolean) {
    if (!isPending) {
      onOpenChange(next);
      if (!next) setForm(initialForm);
    }
  }

  function handleCreate() {
    mutate(form, {
      onSuccess: () => {
        setForm(initialForm);
        onOpenChange(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome</label>
            <Input
              placeholder="Ex: Invoice Management"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <Input
              placeholder="Descrição da plataforma"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              disabled={isPending}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error.message}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={!form.code || !form.name || isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Criar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { AddPlatformModal };
