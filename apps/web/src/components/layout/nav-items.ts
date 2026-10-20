import { Calendar, FileText, Gift, LayoutDashboard, Package, Target, Tag, TrendingUp } from "lucide-react";

export interface NavItem {
  path: string;
  label: string;
  icon: typeof LayoutDashboard;
  /** Roteiros e Análise de Vendas entram na Fase 2/3 (ver PLANO-IMPLEMENTACAO.md) — ficam no menu, mas sem tela ainda. */
  emBreve?: boolean;
}

// Ordem fixa do PRD seção 10. Não reordenar.
export const NAV_ITEMS: NavItem[] = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/produtos", label: "Produtos", icon: Package },
  { path: "/categorias", label: "Categorias", icon: Tag },
  { path: "/amostras", label: "Amostras", icon: Gift },
  { path: "/calendario", label: "Calendário", icon: Calendar },
  { path: "/meta", label: "Meta", icon: Target },
  { path: "/roteiros", label: "Roteiros", icon: FileText, emBreve: true },
  { path: "/analise-vendas", label: "Análise de Vendas", icon: TrendingUp },
];
