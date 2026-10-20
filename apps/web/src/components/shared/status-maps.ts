import type { AmostraStatus, ConteudoStatus } from "@meugerente/shared";
import type { BadgeTone } from "../ui/Badge";

interface StatusInfo {
  label: string;
  tone: BadgeTone;
}

export const amostraStatusMap: Record<AmostraStatus, StatusInfo> = {
  para_publicar: { label: "Para publicar", tone: "neutral" },
  publicado: { label: "Publicado", tone: "blue" },
  vendida: { label: "Vendida", tone: "success" },
  descartada: { label: "Descartada", tone: "error" },
};

export const conteudoStatusMap: Record<ConteudoStatus, StatusInfo> = {
  ideia: { label: "Ideia", tone: "neutral" },
  roteiro_pronto: { label: "Roteiro pronto", tone: "neutral" },
  gravado: { label: "Gravado", tone: "warning" },
  editado: { label: "Editado", tone: "warning" },
  publicado: { label: "Publicado", tone: "success" },
};

export const AMOSTRA_COLUNAS_KANBAN: AmostraStatus[] = ["para_publicar", "publicado", "vendida", "descartada"];

/** Paleta de tons do sistema (status, coluna de amostra) — categoria usa a paleta própria em categoria-cores.ts. */
export const CORES_TOM: { value: BadgeTone; label: string; dot: string }[] = [
  { value: "neutral", label: "Neutro", dot: "bg-neutral-400" },
  { value: "success", label: "Verde", dot: "bg-success" },
  { value: "warning", label: "Amarelo", dot: "bg-warning" },
  { value: "error", label: "Vermelho", dot: "bg-error" },
  { value: "accent", label: "Lilás", dot: "bg-purple-400" },
  { value: "blue", label: "Azul", dot: "bg-blue-500" },
];

/** Fundo levemente colorido pra colunas de Amostras. */
export const TOM_FUNDO: Record<BadgeTone, string> = {
  neutral: "bg-neutral-100",
  success: "bg-success/6",
  warning: "bg-warning/6",
  error: "bg-error/6",
  accent: "bg-purple-400/10",
  blue: "bg-blue-500/6",
};

/** Fundo levemente colorido pra cards (Amostra, Conteúdo) — a cor do card acompanha a cor da coluna/status. */
export const TOM_CARTAO: Record<BadgeTone, string> = {
  neutral: "",
  success: "bg-success/10",
  warning: "bg-warning/10",
  error: "bg-error/10",
  accent: "bg-purple-400/15",
  blue: "bg-blue-500/10",
};
