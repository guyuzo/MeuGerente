// Ainda sem integracao TikTok (Fase 2 do prd.md) — valores fixos de exemplo
// ate a sincronizacao via MCP do TikTok estar pronta.
export const GMV_MOCK = 12480
export const COMISSAO_MOCK = 1870

// Serie de exemplo dos ultimos 6 meses, do mais antigo para o mais recente.
// O ultimo valor e o proprio COMISSAO_MOCK de proposito: o grafico e o card
// de comissao mostram dados de exemplo, mas nao podem mostrar exemplos
// diferentes um do outro. Some junto quando a API real entrar.
export const COMISSAO_MENSAL_MOCK = [820, 1140, 960, 1520, 1680, COMISSAO_MOCK]

export const FRASES_MOTIVACIONAIS = [
  'Vamos gravar mais um vídeo que vende hoje?',
  'Cada vídeo publicado é um passo mais perto da meta do mês.',
  'Bora manter o ritmo — consistência é o que constrói o algoritmo a seu favor.',
  'Hoje é um bom dia para testar aquele gancho novo.',
]
