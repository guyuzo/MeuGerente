import { useEffect, useState } from 'react'
import { STATUS, STATUS_SEQUENCIA } from './constants'

const STORAGE_KEY = 'meu-gerente:amostras'

function carregarInicial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useAmostras() {
  const [amostras, setAmostras] = useState(carregarInicial)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(amostras))
  }, [amostras])

  function adicionar({ nome, marcaId }) {
    setAmostras((atual) => [
      ...atual,
      { id: crypto.randomUUID(), nome, marcaId: marcaId || null, status: STATUS.RECEBIDA },
    ])
  }

  function avancar(id) {
    setAmostras((atual) =>
      atual.map((item) => {
        if (item.id !== id) return item
        const indiceAtual = STATUS_SEQUENCIA.indexOf(item.status)
        if (indiceAtual === -1 || indiceAtual === STATUS_SEQUENCIA.length - 1) return item
        return { ...item, status: STATUS_SEQUENCIA[indiceAtual + 1] }
      }),
    )
  }

  function marcarParada(id) {
    setAmostras((atual) =>
      atual.map((item) => (item.id === id ? { ...item, status: STATUS.PARADA } : item)),
    )
  }

  function remover(id) {
    setAmostras((atual) => atual.filter((item) => item.id !== id))
  }

  return { amostras, adicionar, avancar, marcarParada, remover }
}
