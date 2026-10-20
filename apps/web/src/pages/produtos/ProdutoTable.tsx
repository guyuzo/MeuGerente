import type { Categoria, Produto } from "@meugerente/shared";
import { Archive, ArchiveRestore, CalendarPlus, Pencil } from "lucide-react";
import { CategoriaBadge, LinkPilula, ProductThumb } from "../../components/shared";
import { Table, Tbody, Td, Th, Thead, Tr } from "../../components/ui/Table";
import { cn } from "../../lib/utils";

interface ProdutoTableProps {
  produtos: Produto[];
  categoriasPorId: Map<string, Categoria>;
  onEditar: (produto: Produto) => void;
  onCriarConteudo: (produto: Produto) => void;
  onArquivar: (produto: Produto) => void;
}

export function ProdutoTable({ produtos, categoriasPorId, onEditar, onCriarConteudo, onArquivar }: ProdutoTableProps) {
  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Produto</Th>
          <Th>Categoria</Th>
          <Th className="text-right">Ações</Th>
        </Tr>
      </Thead>
      <Tbody>
        {produtos.map((produto) => {
          const categoria = produto.categoriaId ? categoriasPorId.get(produto.categoriaId) : undefined;
          return (
            <Tr key={produto.id} className={cn(produto.arquivado && "opacity-50")}>
              <Td>
                <div className="flex items-center gap-3">
                  <ProductThumb
                    emoji={produto.emoji || categoria?.emoji}
                    imagemUrl={produto.imagemUrl}
                    nome={produto.nome}
                    size="sm"
                  />
                  <span className="text-body-strong font-medium">{produto.nome}</span>
                  {produto.linkTiktok && <LinkPilula href={produto.linkTiktok} />}
                </div>
              </Td>
              <Td>
                {categoria ? <CategoriaBadge categoria={categoria} /> : <span className="text-neutral-600">—</span>}
              </Td>
              <Td>
                <div className="flex justify-end gap-1">
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
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
}
