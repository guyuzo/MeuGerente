import { Badge, type BadgeTone } from "../ui/Badge";

interface StatusPillProps {
  label: string;
  tone: BadgeTone;
}

/** Pílula de status de domínio (produto/amostra/conteúdo). Ver status-maps.ts para o rótulo e a cor de cada valor. */
export function StatusPill({ label, tone }: StatusPillProps) {
  return <Badge tone={tone}>{label}</Badge>;
}
