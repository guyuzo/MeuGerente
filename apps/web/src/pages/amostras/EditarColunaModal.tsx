import type { AmostraColuna, AmostraColunaCor } from "@meugerente/shared";
import { type FormEvent, useEffect, useState } from "react";
import { CorSwatchPicker } from "../../components/shared";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { useAtualizarAmostraColuna } from "../../hooks/useAmostraColunas";

interface EditarColunaModalProps {
  coluna?: AmostraColuna;
  onFechar: () => void;
}

/** Renomear e recolorir uma coluna customizada do quadro de Amostras. */
export function EditarColunaModal({ coluna, onFechar }: EditarColunaModalProps) {
  const [nome, setNome] = useState("");
  const [cor, setCor] = useState<AmostraColunaCor>("neutral");
  const atualizar = useAtualizarAmostraColuna();

  useEffect(() => {
    if (coluna) {
      setNome(coluna.nome);
      setCor(coluna.cor);
    }
  }, [coluna]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!coluna || !nome.trim()) return;
    await atualizar.mutateAsync({ id: coluna.id, input: { nome: nome.trim(), cor } });
    onFechar();
  }

  return (
    <Modal aberto={!!coluna} titulo="Editar coluna" onFechar={onFechar}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nome" htmlFor="nomeColunaEditar">
          <Input id="nomeColunaEditar" required value={nome} onChange={(e) => setNome(e.target.value)} />
        </Field>
        <Field label="Cor" htmlFor="corColunaEditar">
          <CorSwatchPicker value={cor} onChange={setCor} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="submit" disabled={atualizar.isPending || !nome.trim()}>
            {atualizar.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
