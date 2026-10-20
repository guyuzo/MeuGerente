import { ExternalLink } from "lucide-react";

interface LinkPilulaProps {
  href: string;
}

/** Pílula escura "Abrir" — link externo do produto (loja, app etc.), mesma linguagem visual da CategoriaBadge. */
export function LinkPilula({ href }: LinkPilulaProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-neutral-900 text-neutral-50 text-caption font-medium whitespace-nowrap hover:bg-neutral-800"
    >
      <ExternalLink size={12} />
      Abrir
    </a>
  );
}
