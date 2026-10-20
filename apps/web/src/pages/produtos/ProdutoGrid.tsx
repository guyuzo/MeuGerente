import type { Categoria, Produto } from "@meugerente/shared";
import { Archive, ArchiveRestore, CalendarPlus, Pencil } from "lucide-react";
import { useMemo } from "react";
import { corCategoria, LinkPilula, ProductThumb } from "../../components/shared";
import { Card } from "../../components/ui/Card";
import { cn } from "../../lib/utils";

interface ProdutoGridProps {
  produtos: Produto[];
  categoriasPorId: Map<string, Categoria>;
  onEditar: (produto: Produto) => void;
  onCriarConteudo: (produto: Produto) => void;
  onArquivar: (produto: Produto) => void;
}

const SEM_CATEGORIA_ID = "__sem_categoria__";

function agruparPorCategoria(
  produtos: Produto[],
  categoriasPorId: Map<string, Categoria>,
): [string, Produto[]][] {
  const grupos = new Map<string, Produto[]>();
  for (const produto of produtos) {
    const chave = produto.categoriaId && categoriasPorId.has(produto.categoriaId) ? produto.categoriaId : SEM_CATEGORIA_ID;
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave)!.push(produto);
  }
  const entradas = [...grupos.entries()];
  entradas.sort(([a], [b]) => {
    if (a === SEM_CATEGORIA_ID) return 1;
    if (b === SEM_CATEGORIA_ID) return -1;
    return categoriasPorId.get(a)!.nome.localeCompare(categoriasPorId.get(b)!.nome, "pt-BR");
  });
  return entradas;
}

export function ProdutoGrid({ produtos, categoriasPorId, onEditar, onCriarConteudo, onArquivar }: ProdutoGridProps) {
  const grupos = useMemo(() => agruparPorCategoria(produtos, categoriasPorId), [produtos, categoriasPorId]);

  return (
    <div className="space-y-6">
      {grupos.map(([chave, itens]) => {
        const categoria = chave === SEM_CATEGORIA_ID ? undefined : categoriasPorId.get(chave);
        const tinta = categoria ? corCategoria(categoria.cor).tinta : "bg-neutral-100";
        return (
          <div key={chave} className={`p-4 rounded-lg ${tinta}`}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-h3 text-neutral-900">
                {categoria?.emoji ? `${categoria.emoji} ` : ""}
                {categoria?.nome ?? "Sem categoria"}
              </h2>
              <span className="text-caption text-neutral-600">{itens.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {itens.map((produto) => (
                <Card key={produto.id} className={cn("flex items-center gap-3", produto.arquivado && "opacity-50")}>
                  <ProductThumb
                    emoji={produto.emoji || categoria?.emoji}
                    imagemUrl={produto.imagemUrl}
                    nome={produto.nome}
                  />
                  <p className="text-body-strong font-medium truncate flex-1">{produto.nome}</p>
                  {produto.linkTiktok && <LinkPilula href={produto.linkTiktok} />}
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      title="Criar conteúdo"
                      onClick={() => onCriarConteudo(produto)}
                      className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-150 hover:text-neutral-900"
                    >
                      <CalendarPlus size={16} />
                    </button>
                    <button
                      type="button"
                      title="Editar"
                      onClick={() => onEditar(produto)}
                      className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-150 hover:text-neutral-900"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      title={produto.arquivado ? "Desarquivar" : "Arquivar"}
                      onClick={() => onArquivar(produto)}
                      className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-150 hover:text-neutral-900"
                    >
                      {produto.arquivado ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
