// Ver prd.md secao 6.6. Sequencia feliz: recebida -> postada -> vendeu.
// "Parada" e um estado alternativo, alcancado por acao separada, nao pelo
// avanco linear.
export const STATUS = {
  RECEBIDA: 'recebida',
  POSTADA: 'postada',
  VENDEU: 'vendeu',
  PARADA: 'parada',
}

export const STATUS_SEQUENCIA = [STATUS.RECEBIDA, STATUS.POSTADA, STATUS.VENDEU]

export const STATUS_META = {
  [STATUS.RECEBIDA]: { label: 'Recebida', tone: 'neutral' },
  [STATUS.POSTADA]: { label: 'Postada', tone: 'secondary' },
  [STATUS.VENDEU]: { label: 'Vendeu', tone: 'success' },
  [STATUS.PARADA]: { label: 'Parada', tone: 'critical' },
}
