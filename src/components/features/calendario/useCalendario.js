import { useEffect, useState } from 'react'
import { STATUS } from './constants'
import { nextStatus } from './utils'

const STORAGE_KEY = 'meu-gerente:calendario'

function carregarInicial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// Persistencia local (localStorage) ate a Fase 2 do PRD trazer backend/API.
// A interface do hook (itens + acoes) nao muda quando isso for substituido.
export function useCalendario() {
  const [itens, setItens] = useState(carregarInicial)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(itens))
  }, [itens])

  function adicionar({ data, titulo, amostraId, produtoId }) {
    setItens((atual) => [
      ...atual,
      {
        id: crypto.randomUUID(),
        data,
        titulo,
        amostraId: amostraId || null,
        produtoId: produtoId || null,
        status: STATUS.NAO_GRAVADO,
      },
    ])
  }

  function avancarStatus(id) {
    setItens((atual) =>
      atual.map((item) =>
        item.id === id ? { ...item, status: nextStatus(item.status) } : item,
      ),
    )
  }

  function remover(id) {
    setItens((atual) => atual.filter((item) => item.id !== id))
  }

  return { itens, adicionar, avancarStatus, remover }
}
