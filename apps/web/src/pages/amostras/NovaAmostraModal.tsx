import type { AmostraOrigem, Produto } from "@meugerente/shared";
import { type FormEvent, useEffect, useState } from "react";
import { CategoriaPicker } from "../../components/shared";
import { Button } from "../../components/ui/Button";
import { EmojiPicker } from "../../components/ui/EmojiPicker";
import { Field, Input, Textarea } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import { Tabs } from "../../components/ui/Tabs";
import { useCriarAmostra } from "../../hooks/useAmostras";
import { useCriarProduto } from "../../hooks/useProdutos";

interface NovaAmostraModalProps {
  aberto: boolean;
  onFechar: () => void;
  produtos: Produto[];
}

type Modo = "existente" | "novo";

/**
 * Cria uma amostra aqui mesmo, na tela de Amostras — não altera status do produto. Também dá
 * pra cadastrar o produto na hora (mesmos campos do form de Produtos): amostra sempre vem
 * acompanhada de um produto, sem precisar ir em Produtos primeiro.
 */
export function NovaAmostraModal({ aberto, onFechar, produtos }: NovaAmostraModalProps) {
  const [modo, setModo] = useState<Modo>("existente");
  const [produtoId, setProdutoId] = useState("");
  const [nomeNovo, setNomeNovo] = useState("");
  const [emojiNovo, setEmojiNovo] = useState("");
  const [categoriaIdNovo, setCategoriaIdNovo] = useState<string | undefined>(undefined);
  const [observacaoNova, setObservacaoNova] = useState("");
  const [origem, setOrigem] = useState<AmostraOrigem>("gratuita");
  const [custo, setCusto] = useState<number | undefined>(undefined);
  const criarAmostra = useCriarAmostra();
  const criarProduto = useCriarProduto();

  const salvando = criarAmostra.isPending || criarProduto.isPending;

  useEffect(() => {
    if (aberto) {
      setModo(produtos.length === 0 ? "novo" : "existente");
      setProdutoId(produtos[0]?.id ?? "");
      setNomeNovo("");
      setEmojiNovo("");
      setCategoriaIdNovo(undefined);
      setObservacaoNova("");
      setOrigem("gratuita");
      setCusto(undefined);
    }
  }, [aberto, produtos]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    let idAlvo = produtoId;
    if (modo === "novo") {
      if (!nomeNovo.trim()) return;
      const novoProduto = await criarProduto.mutateAsync({
        nome: nomeNovo.trim(),
        emoji: emojiNovo || undefined,
        categoriaId: categoriaIdNovo,
        observacao: observacaoNova || undefined,
      });
      idAlvo = novoProduto.id;
    }
    if (!idAlvo) return;

    await criarAmostra.mutateAsync({ produtoId: idAlvo, origem, custo: origem === "comprada" ? (custo ?? 0) : 0 });
    onFechar();
  }

  return (
    <Modal aberto={aberto} titulo="Nova amostra" onFechar={onFechar}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {produtos.length > 0 && (
          <Tabs
            options={[
              { value: "existente", label: "Produto existente" },
              { value: "novo", label: "Novo produto" },
            ]}
            value={modo}
            onChange={setModo}
          />
        )}

        {modo === "existente" ? (
          <Field label="Produto" htmlFor="produtoId">
            <Select id="produtoId" required value={produtoId} onChange={(e) => setProdutoId(e.target.value)}>
              {produtos.length === 0 && <option value="">Nenhum produto cadastrado</option>}
              {produtos.map((produto) => (
                <option key={produto.id} value={produto.id}>
                  {produto.emoji ? `${produto.emoji} ` : ""}
                  {produto.nome}
                </option>
              ))}
            </Select>
          </Field>
        ) : (
          <>
            <div className="flex items-end gap-3">
              <EmojiPicker value={emojiNovo} onChange={setEmojiNovo} />
              <Field label="Nome" htmlFor="nomeNovo" className="flex-1">
                <Input id="nomeNovo" required value={nomeNovo} onChange={(e) => setNomeNovo(e.target.value)} />
              </Field>
            </div>
            <Field label="Categoria" htmlFor="categoriaIdNovo">
              <CategoriaPicker value={categoriaIdNovo} onChange={setCategoriaIdNovo} />
            </Field>
            <Field label="Observação" htmlFor="observacaoNova">
              <Textarea id="observacaoNova" value={observacaoNova} onChange={(e) => setObservacaoNova(e.target.value)} />
            </Field>
          </>
        )}

        <Field label="Origem" htmlFor="origem">
          <Select id="origem" value={origem} onChange={(e) => setOrigem(e.target.value as AmostraOrigem)}>
            <option value="gratuita">Gratuita</option>
            <option value="comprada">Comprada</option>
            <option value="parceria">Parceria</option>
          </Select>
        </Field>

        {origem === "comprada" && (
          <Field label="Custo (R$)" htmlFor="custo">
            <Input
              id="custo"
              type="number"
              min={0}
              step="0.01"
              value={custo ?? ""}
              onChange={(e) => setCusto(e.target.value ? Number(e.target.value) : undefined)}
            />
          </Field>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="submit" disabled={salvando || (modo === "existente" && !produtoId)}>
            {salvando ? "Criando..." : "Criar amostra"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
