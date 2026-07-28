import { LayoutDashboard, Fish, Tags, Clapperboard, Calendar, Package, ShoppingBag } from 'lucide-react'

// Fonte unica das rotas do app: NavTabs (mobile, tira horizontal) e Sidebar
// (sm+, lista lateral agrupada) leem daqui, assim as duas nunca ficam
// dessincronizadas quando uma rota muda.
// Icones neutros (lucide, herdam currentColor) — nao emoji colorido, ver
// pedido do usuario: "o icone deve ser neutro, nao pode ter cor".
export const GRUPOS_NAV = [
  {
    label: null,
    itens: [{ to: '/', Icon: LayoutDashboard, label: 'Dashboard', end: true }],
  },
  {
    label: 'Conteúdo',
    itens: [
      { to: '/ganchos', Icon: Fish, label: 'Ganchos' },
      { to: '/marcas', Icon: Tags, label: 'Categorias' },
      { to: '/modelagem-video', Icon: Clapperboard, label: 'Modelagem de Vídeo' },
    ],
  },
  {
    label: 'Planejamento',
    itens: [
      { to: '/calendario', Icon: Calendar, label: 'Calendário' },
      { to: '/produtos', Icon: ShoppingBag, label: 'Produtos' },
      { to: '/amostras', Icon: Package, label: 'Amostras' },
    ],
  },
]
