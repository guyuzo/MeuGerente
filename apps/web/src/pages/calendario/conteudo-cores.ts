import type { ConteudoStatus } from "@meugerente/shared";

/** Cor por status do conteúdo, usada pelo ponto compacto do mobile (o chip usa o tom de fundo de status-maps). */
export const CONTEUDO_PONTO_COR: Record<ConteudoStatus, string> = {
  ideia: "bg-neutral-400",
  roteiro_pronto: "bg-neutral-400",
  gravado: "bg-warning",
  editado: "bg-warning",
  publicado: "bg-success",
};
