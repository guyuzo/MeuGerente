import {
  Tag,
  Shirt,
  Sparkles,
  Home,
  ChefHat,
  Plug,
  PawPrint,
  Baby,
  Dumbbell,
  UtensilsCrossed,
  Gem,
  BookOpen,
  Plane,
  Sprout,
  Car,
  Pill,
  Footprints,
  Archive,
} from 'lucide-react'

// Icones neutros (lucide) por categoria — nao emoji colorido, pedido do
// usuario. Registry por nome (string) porque so isso da pra guardar no
// localStorage; o componente e resolvido aqui na hora de renderizar.
export const ICONES_CATEGORIA = {
  Tag,
  Shirt,
  Sparkles,
  Home,
  ChefHat,
  Plug,
  PawPrint,
  Baby,
  Dumbbell,
  UtensilsCrossed,
  Gem,
  BookOpen,
  Plane,
  Sprout,
  Car,
  Pill,
  Footprints,
  Archive,
}

export const ICONES_SUGERIDOS = [
  'Tag', 'Shirt', 'Footprints', 'Sparkles', 'Home', 'ChefHat',
  'Archive', 'Plug', 'PawPrint', 'Baby', 'Dumbbell', 'Gem',
]

// Sugestao automatica pelo nome digitado (pedido do usuario: "toda vez que
// eu coloco uma categoria, cria um icone que faca sentido").
const PALAVRAS_CHAVE = [
  [['moda', 'roupa', 'vestuario', 'vestido', 'blusa', 'camisa', 'calca', 'saia', 'feminin', 'masculin'], 'Shirt'],
  [['calcado', 'sapato', 'tenis', 'sandalia', 'chinelo'], 'Footprints'],
  [['beleza', 'maquiagem', 'cosmetic', 'skincare', 'pele', 'perfume', 'cabelo', 'capilar'], 'Sparkles'],
  [['casa', 'decoracao', 'lar', 'movel'], 'Home'],
  [['cozinha', 'panela', 'utensilio', 'culinaria'], 'ChefHat'],
  [['organiza'], 'Archive'],
  [['eletronico', 'gadget', 'tecnologia', 'celular', 'informatica'], 'Plug'],
  [['pet', 'cachorro', 'gato', 'animal'], 'PawPrint'],
  [['bebe', 'infantil', 'crianca', 'brinquedo'], 'Baby'],
  [['fitness', 'esporte', 'academia', 'treino', 'musculacao'], 'Dumbbell'],
  [['aliment', 'comida', 'bebida'], 'UtensilsCrossed'],
  [['joia', 'bijuteria', 'relogio', 'bolsa', 'acessorio'], 'Gem'],
  [['livro', 'papelaria', 'escritorio'], 'BookOpen'],
  [['viagem', 'mala'], 'Plane'],
  [['jardim', 'planta'], 'Sprout'],
  [['automotiv', 'carro', 'moto'], 'Car'],
  [['saude', 'bem-estar', 'suplemento', 'vitamina'], 'Pill'],
]

function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export function sugerirIconeCategoria(nome) {
  const alvo = normalizar(nome)
  if (!alvo) return null
  for (const [chaves, icone] of PALAVRAS_CHAVE) {
    if (chaves.some((chave) => alvo.includes(chave))) return icone
  }
  return null
}
