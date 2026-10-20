import type { Categoria } from "@meugerente/shared";
import { cn } from "../../lib/utils";
import { corCategoria } from "./categoria-cores";

interface CategoriaBadgeProps {
  categoria: Categoria;
}

/** Pílula colorida da categoria (fundo sólido + emoji) — usada na tabela e na grade de Produtos. */
export function CategoriaBadge({ categoria }: CategoriaBadgeProps) {
  const cor = corCategoria(categoria.cor);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-caption font-medium whitespace-nowrap",
        cor.pilula,
      )}
    >
      {categoria.emoji && <span>{categoria.emoji}</span>}
      {categoria.nome}
    </span>
  );
}
