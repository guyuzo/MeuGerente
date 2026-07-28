import { useEffect, useState } from 'react'

const STORAGE_KEY = 'meu-gerente:produtos'

function carregarInicial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// Catalogo de produtos (prd.md secao 10). So categoria — sem marca, por
// pedido do usuario.
export function useProdutos() {
  const [produtos, setProdutos] = useState(carregarInicial)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(produtos))
  }, [produtos])

  function adicionar({ nome, subcategoriaId }) {
    setProdutos((atual) => [
      ...atual,
      { id: crypto.randomUUID(), nome, subcategoriaId: subcategoriaId || null },
    ])
  }

  function remover(id) {
    setProdutos((atual) => atual.filter((produto) => produto.id !== id))
  }

  return { produtos, adicionar, remover }
}
