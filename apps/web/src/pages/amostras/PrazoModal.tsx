import type { Amostra } from "@meugerente/shared";
import { type FormEvent, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { useAtualizarAmostra } from "../../hooks/useAmostras";

interface PrazoModalProps {
  amostra?: Amostra;
  onFechar: () => void;
}

/** Definir prazo é opcional — sem ele, a amostra não entra na régua de cobrança do Dashboard. */
export function PrazoModal({ amostra, onFechar }: PrazoModalProps) {
  const [prazo, setPrazo] = useState("");
  const atualizar = useAtualizarAmostra();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!amostra || !prazo) return;
    await atualizar.mutateAsync({ id: amostra.id, input: { prazoConteudo: new Date(prazo).toISOString() } });
    onFechar();
    setPrazo("");
  }

  return (
    <Modal aberto={!!amostra} titulo="Qual o prazo para o conteúdo?" onFechar={onFechar}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-body text-neutral-600">
          Amostra recebida sem prazo não entra na régua de cobrança do Dashboard. Defina até quando o conteúdo
          precisa ser publicado.
        </p>
        <Field label="Prazo de conteúdo" htmlFor="prazo">
          <Input id="prazo" type="date" required value={prazo} onChange={(e) => setPrazo(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={atualizar.isPending || !prazo}>
            {atualizar.isPending ? "Salvando..." : "Definir prazo"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
