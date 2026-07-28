// Status conforme prd.md secao 6.1. "Atrasado" nao entra aqui: e derivado
// em utils.js a partir da data prevista, nunca setado manualmente.
export const STATUS = {
  NAO_GRAVADO: 'nao_gravado',
  GRAVADO: 'gravado',
  EM_EDICAO: 'em_edicao',
  AGENDADO: 'agendado',
  PUBLICADO: 'publicado',
}

export const STATUS_SEQUENCE = [
  STATUS.NAO_GRAVADO,
  STATUS.GRAVADO,
  STATUS.EM_EDICAO,
  STATUS.AGENDADO,
  STATUS.PUBLICADO,
]

export const STATUS_META = {
  [STATUS.NAO_GRAVADO]: { label: 'Não gravado', tone: 'neutral' },
  [STATUS.GRAVADO]: { label: 'Gravado', tone: 'secondary' },
  [STATUS.EM_EDICAO]: { label: 'Em edição', tone: 'warning' },
  [STATUS.AGENDADO]: { label: 'Agendado', tone: 'primary' },
  [STATUS.PUBLICADO]: { label: 'Publicado', tone: 'success' },
}

export const ATRASADO_META = { label: 'Atrasado', tone: 'critical' }
