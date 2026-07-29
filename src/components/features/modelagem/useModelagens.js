import { useEffect, useState } from 'react'

const STORAGE_KEY = 'meu-gerente:modelagens'

function carregarInicial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Historico de videos modelados (prd.md 6.5: "o resultado fica salvo como
 * registro consultavel, nao e descartado apos a analise").
 */
export function useModelagens() {
  const [modelagens, setModelagens] = useState(carregarInicial)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(modelagens))
  }, [modelagens])

  function adicionar(analise) {
    const registro = {
      id: crypto.randomUUID(),
      criadoEm: new Date().toISOString(),
      ...analise,
    }
    // Mais recente primeiro — o historico e lido de cima para baixo.
    setModelagens((atual) => [registro, ...atual])
    return registro
  }

  function remover(id) {
    setModelagens((atual) => atual.filter((item) => item.id !== id))
  }

  return { modelagens, adicionar, remover }
}
