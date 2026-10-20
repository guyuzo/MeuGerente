import type { Conteudo } from "@meugerente/shared";
import { CONTEUDO_PONTO_COR } from "./conteudo-cores";

/**
 * Indicador compacto do mês no mobile (375px não cabe o chip com título) — mesma cor por status do ConteudoChip.
 * Vários pontos precisam caber lado a lado numa célula de ~50px, então a área de toque de 44px do
 * design-system.md não é alcançável aqui sem sobrepor vizinhos; a Lista (visão dedicada) é o jeito
 * preciso de interagir no mobile, este ponto é só um atalho de melhor esforço.
 */
export function ConteudoPonto({ conteudo, onClick }: { conteudo: Conteudo; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={conteudo.titulo} title={conteudo.titulo} className="p-1 -m-1">
      <span className={`block w-2 h-2 rounded-full ${CONTEUDO_PONTO_COR[conteudo.status]}`} />
    </button>
  );
}
