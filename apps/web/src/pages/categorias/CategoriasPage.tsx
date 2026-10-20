import type { CategoriaCor } from "@meugerente/shared";
import { Plus, Tag, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { CorCategoriaPicker } from "../../components/shared";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { EmojiPicker } from "../../components/ui/EmojiPicker";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Input } from "../../components/ui/Input";
import { Spinner } from "../../components/ui/Spinner";
import { useAtualizarCategoria, useCategorias, useCriarCategoria, useDeletarCategoria } from "../../hooks/useCategorias";

export function CategoriasPage() {
  const categoriasQuery = useCategorias();
  const atualizar = useAtualizarCategoria();
  const deletar = useDeletarCategoria();
  const criar = useCriarCategoria();

  const [nomeNovo, setNomeNovo] = useState("");
  const [emojiNovo, setEmojiNovo] = useState("");
  const [corNova, setCorNova] = useState<CategoriaCor>("neutral");

  async function handleCriar(e: FormEvent) {
    e.preventDefault();
    if (!nomeNovo.trim()) return;
    await criar.mutateAsync({ nome: nomeNovo.trim(), cor: corNova, emoji: emojiNovo || undefined });
    setNomeNovo("");
    setEmojiNovo("");
    setCorNova("neutral");
  }

  function handleExcluir(id: string) {
    if (!window.confirm("Excluir essa categoria? Produtos com ela ficam sem categoria.")) return;
    deletar.mutate(id);
  }

  const categorias = categoriasQuery.data ?? [];

  return (
    <div>
      <PageHeader titulo="Categorias" descricao="Organize os produtos por categoria, cada uma com sua cor e emoji." />

      {categoriasQuery.isLoading && <Spinner label="Carregando categorias..." />}

      {categoriasQuery.isError && <ErrorState onTentarNovamente={() => categoriasQuery.refetch()} />}

      {categoriasQuery.isSuccess && categorias.length === 0 && (
        <EmptyState icon={Tag} titulo="Nenhuma categoria ainda" descricao="Crie a primeira categoria abaixo." />
      )}

      {categoriasQuery.isSuccess && categorias.length > 0 && (
        <div className="max-w-xl space-y-2 mb-6">
          {categorias.map((categoria) => (
            <div key={categoria.id} className="flex items-center gap-3 p-3 rounded-md bg-neutral-100">
              <EmojiPicker
                value={categoria.emoji}
                onChange={(emoji) => atualizar.mutate({ id: categoria.id, input: { emoji } })}
              />
              <CorCategoriaPicker
                value={categoria.cor}
                onChange={(cor) => atualizar.mutate({ id: categoria.id, input: { cor } })}
              />
              <Input
                value={categoria.nome}
                onChange={(e) =>
                  atualizar.mutate({ id: categoria.id, input: { nome: e.target.value } })
                }
                className="flex-1"
              />
              <button
                type="button"
                title="Excluir categoria"
                onClick={() => handleExcluir(categoria.id)}
                className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-200 hover:text-error"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleCriar} className="max-w-xl flex items-center gap-3 p-3 rounded-md border border-dashed border-neutral-400">
        <EmojiPicker value={emojiNovo} onChange={setEmojiNovo} />
        <CorCategoriaPicker value={corNova} onChange={setCorNova} />
        <Input
          placeholder="Nome da nova categoria"
          value={nomeNovo}
          onChange={(e) => setNomeNovo(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="secondary" disabled={criar.isPending || !nomeNovo.trim()}>
          <Plus size={16} />
          Criar
        </Button>
      </form>
    </div>
  );
}
