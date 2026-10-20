import type { Categoria, CategoriaCor } from "@meugerente/shared";
import { ChevronDown, Plus } from "lucide-react";
import { type FormEvent, useState } from "react";
import { EmojiPicker } from "../ui/EmojiPicker";
import { Button } from "../ui/Button";
import { Field, Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { useCategorias, useCriarCategoria } from "../../hooks/useCategorias";
import { cn } from "../../lib/utils";
import { corCategoria } from "./categoria-cores";
import { CorCategoriaPicker } from "./CorCategoriaPicker";

interface CategoriaPickerProps {
  value?: string;
  onChange: (categoriaId: string | undefined) => void;
}

/** Escolha de categoria com cor — reaproveitada no form de Produto e na criação rápida de Amostra. */
export function CategoriaPicker({ value, onChange }: CategoriaPickerProps) {
  const [aberto, setAberto] = useState(false);
  const [nomeNova, setNomeNova] = useState("");
  const [emojiNovo, setEmojiNovo] = useState("");
  const [corNova, setCorNova] = useState<CategoriaCor>("neutral");
  const categoriasQuery = useCategorias();
  const criar = useCriarCategoria();

  const categorias = categoriasQuery.data ?? [];
  const selecionada = categorias.find((c) => c.id === value);

  async function handleCriar(e: FormEvent) {
    e.preventDefault();
    if (!nomeNova.trim()) return;
    const nova = await criar.mutateAsync({ nome: nomeNova.trim(), cor: corNova, emoji: emojiNovo || undefined });
    onChange(nova.id);
    setNomeNova("");
    setEmojiNovo("");
    setCorNova("neutral");
    setAberto(false);
  }

  function selecionar(categoria: Categoria) {
    onChange(categoria.id);
    setAberto(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="w-full h-10 px-3 rounded-md bg-neutral-150 text-body text-neutral-900 flex items-center justify-between gap-2 hover:bg-neutral-200"
      >
        <span className="flex items-center gap-2 truncate">
          {selecionada && (
            <span
              className={cn("w-2.5 h-2.5 rounded-full shrink-0", corCategoria(selecionada.cor).dot)}
            />
          )}
          <span className="truncate">
            {selecionada ? `${selecionada.emoji ? `${selecionada.emoji} ` : ""}${selecionada.nome}` : "Selecionar categoria"}
          </span>
        </span>
        <ChevronDown size={16} className="shrink-0 text-neutral-600" />
      </button>

      <Modal aberto={aberto} titulo="Categoria" onFechar={() => setAberto(false)}>
        <div className="space-y-4">
          {categorias.length > 0 && (
            <div className="space-y-1 max-h-52 overflow-y-auto">
              {categorias.map((categoria) => (
                <button
                  key={categoria.id}
                  type="button"
                  onClick={() => selecionar(categoria)}
                  className={cn(
                    "w-full flex items-center gap-2 h-10 px-3 rounded-md text-body text-left hover:bg-neutral-150",
                    categoria.id === value && "bg-neutral-150 font-medium",
                  )}
                >
                  <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", corCategoria(categoria.cor).dot)} />
                  {categoria.emoji && <span>{categoria.emoji}</span>}
                  {categoria.nome}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleCriar} className="pt-3 border-t border-neutral-200 space-y-3">
            <p className="text-caption text-neutral-600 flex items-center gap-1">
              <Plus size={13} />
              Nova categoria
            </p>
            <div className="flex items-end gap-3">
              <EmojiPicker value={emojiNovo} onChange={setEmojiNovo} />
              <Field label="Nome" htmlFor="nomeNovaCategoria" className="flex-1">
                <Input id="nomeNovaCategoria" value={nomeNova} onChange={(e) => setNomeNova(e.target.value)} />
              </Field>
              <CorCategoriaPicker value={corNova} onChange={setCorNova} />
            </div>
            <Button type="submit" variant="secondary" disabled={criar.isPending || !nomeNova.trim()} className="w-full justify-center">
              {criar.isPending ? "Criando..." : "Criar e usar"}
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
}
