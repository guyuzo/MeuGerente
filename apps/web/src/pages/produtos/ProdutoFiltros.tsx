import type { Categoria } from "@meugerente/shared";
import { Checkbox } from "../../components/ui/Checkbox";
import { Select } from "../../components/ui/Select";

export interface ProdutoFiltrosState {
  categoriaId: string;
  comAmostra: boolean;
  mostrarArquivados: boolean;
}

export const FILTROS_INICIAIS: ProdutoFiltrosState = {
  categoriaId: "todas",
  comAmostra: false,
  mostrarArquivados: false,
};

interface ProdutoFiltrosProps {
  categorias: Categoria[];
  filtros: ProdutoFiltrosState;
  onChange: (filtros: ProdutoFiltrosState) => void;
}

/** Barra de filtros do módulo Produtos: categoria e com/sem amostra. */
export function ProdutoFiltros({ categorias, filtros, onChange }: ProdutoFiltrosProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        className="w-auto"
        value={filtros.categoriaId}
        onChange={(e) => onChange({ ...filtros, categoriaId: e.target.value })}
      >
        <option value="todas">Todas as categorias</option>
        {categorias.map((categoria) => (
          <option key={categoria.id} value={categoria.id}>
            {categoria.nome}
          </option>
        ))}
      </Select>

      <Checkbox
        className="h-10 px-3 rounded-md bg-neutral-150"
        checked={filtros.comAmostra}
        onChange={(comAmostra) => onChange({ ...filtros, comAmostra })}
        label="Só com amostra"
      />

      <Checkbox
        className="h-10 px-3 rounded-md bg-neutral-150"
        checked={filtros.mostrarArquivados}
        onChange={(mostrarArquivados) => onChange({ ...filtros, mostrarArquivados })}
        label="Mostrar arquivados"
      />
    </div>
  );
}
