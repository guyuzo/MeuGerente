import { useEffect, useState } from 'react'
import { sugerirIconeCategoria } from '../../../lib/iconesCategorias'

const STORAGE_KEY = 'meu-gerente:marcas'

const VAZIO = { categorias: [], subcategorias: [], marcas: [] }

function carregarInicial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return VAZIO
    const dados = JSON.parse(raw)
    // Migracao: categorias antigas usavam emoji; agora usam icone (lucide).
    return {
      ...dados,
      categorias: dados.categorias.map((categoria) =>
        categoria.icone ? categoria : { ...categoria, icone: sugerirIconeCategoria(categoria.nome) || 'Tag' },
      ),
    }
  } catch {
    return VAZIO
  }
}

// Taxonomia raiz do sistema (categoria > subcategoria, marcas tageadas por
// subcategoria) — ver designsystem.md/prd.md secao 6.3. Ganchos e Amostras
// leem este mesmo hook para popular seus seletores de subcategoria/marca.
export function useMarcas() {
  const [dados, setDados] = useState(carregarInicial)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados))
  }, [dados])

  function adicionarCategoria(nome, icone) {
    setDados((atual) => ({
      ...atual,
      categorias: [...atual.categorias, { id: crypto.randomUUID(), nome, icone: icone || 'Tag' }],
    }))
  }

  function removerCategoria(categoriaId) {
    setDados((atual) => {
      const idsSubRemovidas = atual.subcategorias
        .filter((sub) => sub.categoriaId === categoriaId)
        .map((sub) => sub.id)
      return {
        categorias: atual.categorias.filter((c) => c.id !== categoriaId),
        subcategorias: atual.subcategorias.filter((sub) => sub.categoriaId !== categoriaId),
        marcas: atual.marcas.map((marca) => ({
          ...marca,
          subcategoriaIds: marca.subcategoriaIds.filter((id) => !idsSubRemovidas.includes(id)),
        })),
      }
    })
  }

  function adicionarSubcategoria(categoriaId, nome) {
    setDados((atual) => ({
      ...atual,
      subcategorias: [
        ...atual.subcategorias,
        { id: crypto.randomUUID(), categoriaId, nome },
      ],
    }))
  }

  function removerSubcategoria(subcategoriaId) {
    setDados((atual) => ({
      ...atual,
      subcategorias: atual.subcategorias.filter((sub) => sub.id !== subcategoriaId),
      marcas: atual.marcas.map((marca) => ({
        ...marca,
        subcategoriaIds: marca.subcategoriaIds.filter((id) => id !== subcategoriaId),
      })),
    }))
  }

  function adicionarMarca({ nome, subcategoriaIds }) {
    setDados((atual) => ({
      ...atual,
      marcas: [
        ...atual.marcas,
        { id: crypto.randomUUID(), nome, favorita: false, subcategoriaIds },
      ],
    }))
  }

  function alternarFavorita(marcaId) {
    setDados((atual) => ({
      ...atual,
      marcas: atual.marcas.map((marca) =>
        marca.id === marcaId ? { ...marca, favorita: !marca.favorita } : marca,
      ),
    }))
  }

  function removerMarca(marcaId) {
    setDados((atual) => ({
      ...atual,
      marcas: atual.marcas.filter((marca) => marca.id !== marcaId),
    }))
  }

  return {
    ...dados,
    adicionarCategoria,
    removerCategoria,
    adicionarSubcategoria,
    removerSubcategoria,
    adicionarMarca,
    alternarFavorita,
    removerMarca,
  }
}
