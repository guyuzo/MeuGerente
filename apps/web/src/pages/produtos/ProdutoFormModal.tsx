import type { AmostraOrigem, Produto, ProdutoCreateInput, ProdutoUpdateInput } from "@meugerente/shared";
import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CategoriaPicker } from "../../components/shared";
import { Button } from "../../components/ui/Button";
import { EmojiPicker } from "../../components/ui/EmojiPicker";
import { Field, Input, Textarea } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import { useCriarAmostra } from "../../hooks/useAmostras";
import { useAtualizarProduto, useCriarProduto } from "../../hooks/useProdutos";

type OrigemAmostraOuNenhuma = AmostraOrigem | "nenhuma";

interface ProdutoFormModalProps {
  aberto: boolean;
  onFechar: () => void;
  produtoEmEdicao?: Produto;
}

const VAZIO: ProdutoCreateInput = {
  nome: "",
  emoji: "",
  categoriaId: undefined,
  linkTiktok: "",
  observacao: "",
};

/** Form de cadastro/edição manual de produto (PRD seção 8.2). Reaproveita Modal, Field, Input, Button de components/ui. */
export function ProdutoFormModal({ aberto, onFechar, produtoEmEdicao }: ProdutoFormModalProps) {
  const [form, setForm] = useState<ProdutoCreateInput>(produtoEmEdicao ?? VAZIO);
  const [origemAmostra, setOrigemAmostra] = useState<OrigemAmostraOuNenhuma>("nenhuma");
  const criar = useCriarProduto();
  const atualizar = useAtualizarProduto();
  const criarAmostra = useCriarAmostra();
  const navigate = useNavigate();

  const salvando = criar.isPending || atualizar.isPending || criarAmostra.isPending;

  // Recarrega o form sempre que o modal abre, porque a instância continua montada entre uma edição e outra.
  useEffect(() => {
    if (aberto) {
      setForm(produtoEmEdicao ?? VAZIO);
      setOrigemAmostra("nenhuma");
    }
  }, [aberto, produtoEmEdicao]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) return;

    if (produtoEmEdicao) {
      const input: ProdutoUpdateInput = form;
      await atualizar.mutateAsync({ id: produtoEmEdicao.id, input });
      onFechar();
      return;
    }

    const novoProduto = await criar.mutateAsync(form);
    if (origemAmostra !== "nenhuma") {
      await criarAmostra.mutateAsync({ produtoId: novoProduto.id, origem: origemAmostra, custo: 0 });
      onFechar();
      navigate("/amostras");
      return;
    }
    onFechar();
  }

  return (
    <Modal aberto={aberto} titulo={produtoEmEdicao ? "Editar produto" : "Novo produto"} onFechar={onFechar}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-end gap-3">
          <EmojiPicker value={form.emoji} onChange={(emoji) => setForm((f) => ({ ...f, emoji }))} />
          <Field label="Nome" htmlFor="nome" className="flex-1">
            <Input
              id="nome"
              required
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            />
          </Field>
        </div>

        <Field label="Categoria" htmlFor="categoriaId">
          <CategoriaPicker value={form.categoriaId} onChange={(categoriaId) => setForm((f) => ({ ...f, categoriaId }))} />
        </Field>

        <Field label="Link (opcional)" htmlFor="linkTiktok">
          <Input
            id="linkTiktok"
            placeholder="https://..."
            value={form.linkTiktok ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, linkTiktok: e.target.value }))}
          />
        </Field>

        {!produtoEmEdicao && (
          <Field label="Ele é uma amostra?" htmlFor="origemAmostra">
            <Select
              id="origemAmostra"
              value={origemAmostra}
              placeholder="Nenhum dos dois — só radar"
              onChange={(e) => setOrigemAmostra(e.target.value as OrigemAmostraOuNenhuma)}
            >
              <option value="gratuita">Amostra</option>
              <option value="comprada">Comprado</option>
            </Select>
          </Field>
        )}

        <Field label="Observação" htmlFor="observacao">
          <Textarea
            id="observacao"
            value={form.observacao ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, observacao: e.target.value }))}
          />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="submit" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
