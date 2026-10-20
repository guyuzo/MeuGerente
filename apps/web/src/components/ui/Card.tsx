import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

/** Cartão flutuante sem sombra — profundidade vem só da escala neutra (design-system.md seção 5). */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("bg-neutral-75 rounded-xl p-6", className)} {...props} />;
}

export function CardInterno({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("bg-neutral-100 rounded-lg p-4", className)} {...props} />;
}
