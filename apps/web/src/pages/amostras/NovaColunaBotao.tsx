import type { AmostraColunaCor } from "@meugerente/shared";
import { Plus } from "lucide-react";
import { type FormEvent, useState } from "react";
import { CorSwatchPicker } from "../../components/shared";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { useCriarAmostraColuna } from "../../hooks/useAmostraColunas";

/** Botão "+ Nova coluna" no fim do quadro de Amostras — coluna livre, não mexe em status/prazo. */
export function NovaColunaBotao() {
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [cor, setCor] = useState<AmostraColunaCor>("neutral");
  const criar = useCriarAmostraColuna();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;
    await criar.mutateAsync({ nome: nome.trim(), cor });
    setAberto(false);
    setNome("");
    setCor("neutral");
  }

  return (
    <div className="w-72 shrink-0">
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="w-full h-11 flex items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-400 text-body-strong font-medium text-neutral-600 hover:bg-neutral-150 hover:text-neutral-900"
      >
        <Plus size={16} />
        Nova coluna
      </button>

      <Modal aberto={aberto} titulo="Nova coluna" onFechar={() => setAberto(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nome" htmlFor="nomeColuna">
            <Input id="nomeColuna" required value={nome} onChange={(e) => setNome(e.target.value)} />
          </Field>
          <Field label="Cor" htmlFor="corColuna">
            <CorSwatchPicker value={cor} onChange={setCor} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={criar.isPending}>
              {criar.isPending ? "Criando..." : "Criar coluna"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
