import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { RequerLogin } from "./components/layout/RequerLogin";
import { AmostrasPage } from "./pages/amostras/AmostrasPage";
import { AnaliseVendasPage } from "./pages/analise-vendas/AnaliseVendasPage";
import { CalendarioPage } from "./pages/calendario/CalendarioPage";
import { CategoriasPage } from "./pages/categorias/CategoriasPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { MetaPage } from "./pages/meta/MetaPage";
import { ProdutosPage } from "./pages/produtos/ProdutosPage";
import { RoteirosPage } from "./pages/roteiros/RoteirosPage";

export const router = createBrowserRouter([
  {
    element: (
      <RequerLogin>
        <AppShell />
      </RequerLogin>
    ),
    children: [
      { path: "/", element: <DashboardPage /> },
      { path: "/produtos", element: <ProdutosPage /> },
      { path: "/categorias", element: <CategoriasPage /> },
      { path: "/amostras", element: <AmostrasPage /> },
      { path: "/calendario", element: <CalendarioPage /> },
      { path: "/meta", element: <MetaPage /> },
      { path: "/roteiros", element: <RoteirosPage /> },
      { path: "/analise-vendas", element: <AnaliseVendasPage /> },
    ],
  },
]);
