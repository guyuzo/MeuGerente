import { cn } from "../../lib/utils";

interface CardMetricaProps {
  label: string;
  valor: string;
  nota?: string;
  destaque?: boolean;
}

/** Cartão de métrica (Dashboard, Análise de Vendas...). Destaque = superfície escura para o dado principal. */
export function CardMetrica({ label, valor, nota, destaque }: CardMetricaProps) {
  return (
    <div className={cn("rounded-xl p-6 flex flex-col gap-1", destaque ? "bg-neutral-900" : "bg-neutral-75")}>
      <span className={cn("text-caption", destaque ? "text-neutral-400" : "text-neutral-600")}>{label}</span>
      <span className={cn("text-display tabular-nums", destaque ? "text-neutral-50" : "text-neutral-900")}>{valor}</span>
      {nota && <span className={cn("text-caption", destaque ? "text-neutral-400" : "text-neutral-600")}>{nota}</span>}
    </div>
  );
}
