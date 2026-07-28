// Dois eixos independentes, conforme prd.md secao 6.2: um gancho tem um
// STATUS (para testar / validado) e um FORMATO (visual / escrito / falado)
// simultaneamente. "Sugestao de IA" saiu por pedido do usuario — fica para
// quando a integracao de IA (fase 3 do prd.md) existir de verdade.
export const STATUS = {
  PARA_TESTAR: 'para_testar',
  VALIDADO: 'validado',
}

export const STATUS_META = {
  [STATUS.PARA_TESTAR]: { label: 'Para Testar', tone: 'neutral' },
  [STATUS.VALIDADO]: { label: 'Validado', tone: 'success' },
}

export const STATUS_ORDEM = [STATUS.PARA_TESTAR, STATUS.VALIDADO]

export const FORMATO = {
  VISUAL: 'visual',
  ESCRITO: 'escrito',
  FALADO: 'falado',
}

export const FORMATO_META = {
  [FORMATO.VISUAL]: 'Visual',
  [FORMATO.ESCRITO]: 'Escrito',
  [FORMATO.FALADO]: 'Falado',
}
