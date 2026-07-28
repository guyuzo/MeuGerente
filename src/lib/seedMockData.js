// Dados de demonstracao. Amostras/ganchos/produtos/categorias usam merge
// por id: cada item novo do mock so entra se o id ainda nao existir na
// chave, entao dado real do usuario nunca e apagado e o app pode ganhar
// mais itens de exemplo em versoes futuras sem duplicar nada.
//
// O calendario e diferente: como qualquer visita a /calendario grava `[]`
// de volta no primeiro render (useEffect do useCalendario), a chave nunca
// fica "null" de novo — por isso ele usa `seedVersionado` (sobrescreve tudo
// quando a versao muda), em vez de merge.

function diasA(offset) {
  const data = new Date()
  data.setDate(data.getDate() + offset)
  return data.toISOString().slice(0, 10)
}

const CATEGORIAS = [
  { id: 'cat-moda', nome: 'Moda Feminina', icone: 'Shirt' },
  { id: 'cat-casa', nome: 'Casa & Decoração', icone: 'Home' },
  { id: 'cat-beleza', nome: 'Beleza & Maquiagem', icone: 'Sparkles' },
  { id: 'cat-eletronicos', nome: 'Eletrônicos', icone: 'Plug' },
  { id: 'cat-pet', nome: 'Pet Shop', icone: 'PawPrint' },
  { id: 'cat-fitness', nome: 'Fitness & Esporte', icone: 'Dumbbell' },
  { id: 'cat-bebe', nome: 'Bebê & Infantil', icone: 'Baby' },
]

const SUBCATEGORIAS = [
  { id: 'sub-blusas', categoriaId: 'cat-moda', nome: 'Blusas' },
  { id: 'sub-vestidos', categoriaId: 'cat-moda', nome: 'Vestidos' },
  { id: 'sub-cozinha', categoriaId: 'cat-casa', nome: 'Cozinha' },
  { id: 'sub-organizacao', categoriaId: 'cat-casa', nome: 'Organização' },
  { id: 'sub-skincare', categoriaId: 'cat-beleza', nome: 'Skincare' },
  { id: 'sub-maquiagem', categoriaId: 'cat-beleza', nome: 'Maquiagem' },
  { id: 'sub-acessorios-celular', categoriaId: 'cat-eletronicos', nome: 'Acessórios de Celular' },
  { id: 'sub-gadgets', categoriaId: 'cat-eletronicos', nome: 'Gadgets' },
  { id: 'sub-caes', categoriaId: 'cat-pet', nome: 'Cães' },
  { id: 'sub-gatos', categoriaId: 'cat-pet', nome: 'Gatos' },
  { id: 'sub-roupas-fitness', categoriaId: 'cat-fitness', nome: 'Roupas Fitness' },
  { id: 'sub-equipamentos', categoriaId: 'cat-fitness', nome: 'Equipamentos' },
  { id: 'sub-roupinhas', categoriaId: 'cat-bebe', nome: 'Roupinhas' },
  { id: 'sub-brinquedos', categoriaId: 'cat-bebe', nome: 'Brinquedos' },
]

const MARCAS = [
  { id: 'marca-bella', nome: 'Bella Store', favorita: true, subcategoriaIds: ['sub-blusas', 'sub-vestidos'] },
  { id: 'marca-lar', nome: 'Lar Company', favorita: false, subcategoriaIds: ['sub-cozinha'] },
  { id: 'marca-organiza', nome: 'Organiza Fácil', favorita: true, subcategoriaIds: ['sub-organizacao'] },
  { id: 'marca-glow', nome: 'Glow Cosméticos', favorita: true, subcategoriaIds: ['sub-skincare', 'sub-maquiagem'] },
  { id: 'marca-techx', nome: 'TechX Acessórios', favorita: false, subcategoriaIds: ['sub-acessorios-celular', 'sub-gadgets'] },
  { id: 'marca-petlove', nome: 'PetLove', favorita: true, subcategoriaIds: ['sub-caes', 'sub-gatos'] },
]

const AMOSTRAS = [
  { id: 'am-1', nome: 'Blusa listrada P', marcaId: 'marca-bella', status: 'postada' },
  { id: 'am-2', nome: 'Vestido floral M', marcaId: 'marca-bella', status: 'vendeu' },
  { id: 'am-3', nome: 'Jogo de panelas antiaderente', marcaId: 'marca-lar', status: 'recebida' },
  { id: 'am-4', nome: 'Organizador de gaveta', marcaId: 'marca-organiza', status: 'postada' },
  { id: 'am-5', nome: 'Blusa básica preta', marcaId: 'marca-bella', status: 'parada' },
  { id: 'am-6', nome: 'Potes herméticos kit 5un', marcaId: 'marca-lar', status: 'vendeu' },
  { id: 'am-7', nome: 'Sérum facial vitamina C', marcaId: 'marca-glow', status: 'recebida' },
  { id: 'am-8', nome: 'Paleta de sombras 12 cores', marcaId: 'marca-glow', status: 'postada' },
  { id: 'am-9', nome: 'Suporte de celular veicular', marcaId: 'marca-techx', status: 'recebida' },
  { id: 'am-10', nome: 'Ração premium para gatos 1kg', marcaId: 'marca-petlove', status: 'postada' },
  { id: 'am-11', nome: 'Coleira ajustável para cães', marcaId: 'marca-petlove', status: 'vendeu' },
]

const PRODUTOS = [
  { id: 'produto-1', nome: 'Creme hidratante facial', subcategoriaId: 'sub-skincare' },
  { id: 'produto-2', nome: 'Batom matte longa duração', subcategoriaId: 'sub-maquiagem' },
  { id: 'produto-3', nome: 'Fone de ouvido bluetooth', subcategoriaId: 'sub-gadgets' },
  { id: 'produto-4', nome: 'Bolinha antiestresse para gatos', subcategoriaId: 'sub-gatos' },
  { id: 'produto-5', nome: 'Top fitness feminino', subcategoriaId: 'sub-roupas-fitness' },
]

const GANCHOS = [
  { id: 'g-1', texto: 'Vira o vídeo agora, isso vai te economizar dinheiro', formato: 'falado', status: 'validado', subcategoriaId: 'sub-blusas' },
  { id: 'g-2', texto: 'Comprei achando que era ruim, mas...', formato: 'falado', status: 'validado', subcategoriaId: 'sub-vestidos' },
  { id: 'g-3', texto: '3 erros que você comete ao organizar a cozinha', formato: 'escrito', status: 'para_testar', subcategoriaId: 'sub-cozinha' },
  { id: 'g-4', texto: 'Pare de comprar isso até ver esse vídeo', formato: 'falado', status: 'para_testar', subcategoriaId: 'sub-organizacao' },
  { id: 'g-5', texto: 'Close no produto com música de tensão subindo', formato: 'visual', status: 'para_testar', subcategoriaId: 'sub-cozinha' },
  { id: 'g-6', texto: "Texto na tela: 'antes vs depois' com zoom no resultado", formato: 'escrito', status: 'validado', subcategoriaId: 'sub-organizacao' },
  { id: 'g-7', texto: 'Se você tem esse problema, compra isso agora', formato: 'falado', status: 'para_testar', subcategoriaId: 'sub-blusas' },
  { id: 'g-8', texto: 'Esse sérum mudou minha pele em 7 dias', formato: 'falado', status: 'validado', subcategoriaId: 'sub-skincare' },
  { id: 'g-9', texto: 'Não compre maquiagem sem ver esse vídeo antes', formato: 'falado', status: 'para_testar', subcategoriaId: 'sub-maquiagem' },
  { id: 'g-10', texto: 'Testei o acessório de celular mais vendido do TikTok', formato: 'visual', status: 'para_testar', subcategoriaId: 'sub-acessorios-celular' },
  { id: 'g-11', texto: '3 gadgets que você não sabia que precisava', formato: 'escrito', status: 'validado', subcategoriaId: 'sub-gadgets' },
  { id: 'g-12', texto: 'Meu gato aprovou (e olha que ele não gosta de nada)', formato: 'falado', status: 'validado', subcategoriaId: 'sub-gatos' },
  { id: 'g-13', texto: 'Treino em casa ficou muito melhor com isso', formato: 'visual', status: 'para_testar', subcategoriaId: 'sub-roupas-fitness' },
  { id: 'g-14', texto: 'Isso aqui virou o queridinho dos pets da casa', formato: 'falado', status: 'para_testar', subcategoriaId: 'sub-caes' },
]

const TITULOS_CALENDARIO = [
  'Blusa listrada — review rápido',
  'Vestido floral — try-on haul',
  '3 erros ao organizar a cozinha',
  'Antes e depois: gaveta organizada',
  'Unboxing potes herméticos',
  'Blusa básica — 3 formas de usar',
  'Panelas antiaderentes — teste de uso',
  'Organização de armário de cozinha',
  'Vestido floral — grava com boa luz',
  'Dicas rápidas de organização',
]

const AMOSTRA_IDS_CICLO = ['am-1', 'am-2', 'am-3', 'am-4', 'am-5', 'am-6', null]

function gerarCalendarioDoMes() {
  const hoje = new Date()
  const diaHoje = hoje.getDate()
  const totalDias = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate()
  const itens = []

  for (let dia = 1; dia <= totalDias; dia += 1) {
    const titulo = TITULOS_CALENDARIO[(dia - 1) % TITULOS_CALENDARIO.length]
    const amostraId = AMOSTRA_IDS_CICLO[(dia - 1) % AMOSTRA_IDS_CICLO.length]

    let status
    if (dia < diaHoje) {
      // a maioria dos dias passados ja foi publicada; 1 a cada 6 fica em
      // aberto de proposito, pra mostrar o estado "Atrasado" no calendario.
      status = dia % 6 === 0 ? 'nao_gravado' : 'publicado'
    } else if (dia === diaHoje) {
      status = 'gravado'
    } else {
      status = dia % 3 === 0 ? 'agendado' : 'nao_gravado'
    }

    itens.push({
      id: `cal-${dia}`,
      data: diasA(dia - diaHoje),
      titulo,
      amostraId,
      status,
    })
  }

  return itens
}

function mesclarPorId(existentes, novos) {
  const ids = new Set(existentes.map((item) => item.id))
  return [...existentes, ...novos.filter((item) => !ids.has(item.id))]
}

function mergeArrayPorId(chave, itens) {
  const raw = localStorage.getItem(chave)
  const atual = raw ? JSON.parse(raw) : []
  const mesclado = mesclarPorId(atual, itens)
  if (mesclado.length !== atual.length || raw === null) {
    localStorage.setItem(chave, JSON.stringify(mesclado))
  }
}

function mergeMarcasDados() {
  const raw = localStorage.getItem('meu-gerente:marcas')
  const atual = raw ? JSON.parse(raw) : { categorias: [], subcategorias: [], marcas: [] }
  localStorage.setItem(
    'meu-gerente:marcas',
    JSON.stringify({
      categorias: mesclarPorId(atual.categorias, CATEGORIAS),
      subcategorias: mesclarPorId(atual.subcategorias, SUBCATEGORIAS),
      marcas: mesclarPorId(atual.marcas, MARCAS),
    }),
  )
}

// Bump esta versao quando quiser forcar um novo dataset de calendario para
// quem ja tinha a chave gravada (ex: `[]` de uma visita anterior a pagina).
const VERSAO_SEED_CALENDARIO = '2'

function seedCalendarioVersionado() {
  const chaveVersao = 'meu-gerente:seed-calendario-versao'
  if (localStorage.getItem(chaveVersao) === VERSAO_SEED_CALENDARIO) return
  localStorage.setItem('meu-gerente:calendario', JSON.stringify(gerarCalendarioDoMes()))
  localStorage.setItem(chaveVersao, VERSAO_SEED_CALENDARIO)
}

export function seedMockDataIfEmpty() {
  mergeMarcasDados()
  mergeArrayPorId('meu-gerente:amostras', AMOSTRAS)
  mergeArrayPorId('meu-gerente:ganchos', GANCHOS)
  mergeArrayPorId('meu-gerente:produtos', PRODUTOS)
  seedCalendarioVersionado()
}
