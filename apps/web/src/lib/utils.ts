import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** clsx sozinho não resolve conflito entre utilitários (ex.: bg-neutral-75 do Card x bg-blue-500/15 do tom) — twMerge garante que a última classe declarada vence. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function gerarId(): string {
  return crypto.randomUUID();
}

export function agoraIso(): string {
  return new Date().toISOString();
}

const formatadorData = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
const formatadorMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatarData(iso?: string): string {
  if (!iso) return "—";
  return formatadorData.format(new Date(iso));
}

export function formatarMoeda(valor?: number): string {
  if (valor === undefined) return "—";
  return formatadorMoeda.format(valor);
}

/** Dias entre hoje e a data alvo. Negativo quando a data já passou. */
export function diasAte(iso?: string): number | undefined {
  if (!iso) return undefined;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(iso);
  alvo.setHours(0, 0, 0, 0);
  return Math.round((alvo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

/** Dias já passados desde a data (contador de "X dias", ex: tempo publicado). */
export function diasDesde(iso?: string): number {
  return -(diasAte(iso) ?? 0);
}
