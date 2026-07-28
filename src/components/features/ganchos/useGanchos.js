import { useEffect, useState } from 'react'
import { STATUS } from './constants'

const STORAGE_KEY = 'meu-gerente:ganchos'

function carregarInicial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    // Migracao: "sugestao_ia" foi removido dos status possiveis (ver
    // constants.js) — ganchos salvos com esse valor viram "para testar".
    return JSON.parse(raw).map((gancho) =>
      gancho.status === 'sugestao_ia' ? { ...gancho, status: STATUS.PARA_TESTAR } : gancho,
    )
  } catch {
    return []
  }
}

export function useGanchos() {
  const [ganchos, setGanchos] = useState(carregarInicial)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ganchos))
  }, [ganchos])

  function adicionar({ texto, formato, status, subcategoriaId }) {
    setGanchos((atual) => [
      ...atual,
      {
        id: crypto.randomUUID(),
        texto,
        formato,
        status: status ?? STATUS.PARA_TESTAR,
        subcategoriaId: subcategoriaId || null,
      },
    ])
  }

  function definirStatus(id, status) {
    setGanchos((atual) => atual.map((g) => (g.id === id ? { ...g, status } : g)))
  }

  function remover(id) {
    setGanchos((atual) => atual.filter((g) => g.id !== id))
  }

  return { ganchos, adicionar, definirStatus, remover }
}
