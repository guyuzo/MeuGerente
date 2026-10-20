import { Package } from "lucide-react";
import { cn } from "../../lib/utils";

interface ProductThumbProps {
  emoji?: string;
  imagemUrl?: string;
  nome: string;
  size?: "sm" | "md";
}

/** Miniatura de produto com fallback — reaproveitada em Produtos, Amostras, Calendário e Dashboard. */
export function ProductThumb({ emoji, imagemUrl, nome, size = "md" }: ProductThumbProps) {
  const dimensao = size === "sm" ? "w-8 h-8" : "w-10 h-10";

  if (emoji) {
    return (
      <div
        className={cn(dimensao, "rounded-md bg-neutral-150 flex items-center justify-center")}
        style={{ fontSize: size === "sm" ? 16 : 20 }}
      >
        <span role="img" aria-label={nome}>
          {emoji}
        </span>
      </div>
    );
  }

  if (imagemUrl) {
    return <img src={imagemUrl} alt={nome} className={cn(dimensao, "rounded-md object-cover bg-neutral-150")} />;
  }

  return (
    <div className={cn(dimensao, "rounded-md bg-neutral-150 flex items-center justify-center text-neutral-500")}>
      <Package size={size === "sm" ? 14 : 16} />
    </div>
  );
}
