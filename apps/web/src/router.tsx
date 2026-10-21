import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { RequerLogin } from "./components/layout/RequerLogin";
import { AmostrasPage } from "./pages/amostras/AmostrasPage";
import { AnaliseVendasPage } from "./pages/analise-vendas/AnaliseVendasPage";
import { CalendarioPage } from "./pages/calendario/CalendarioPage";
import { CategoriasPage } from "./pages/categorias/CategoriasPage";
import { ContaPage } from "./pages/conta/ContaPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { LegalPage } from "./pages/legal/LegalPage";
import { CadastroPage } from "./pages/login/CadastroPage";
import { EsqueciSenhaPage } from "./pages/login/EsqueciSenhaPage";
import { RedefinirSenhaPage } from "./pages/login/RedefinirSenhaPage";
import { MetaPage } from "./pages/meta/MetaPage";
import { ProdutosPage } from "./pages/produtos/ProdutosPage";
import { RoteirosPage } from "./pages/roteiros/RoteirosPage";

export const router = createBrowserRouter([
  // Públicas: acessíveis sem sessão (a tela de entrar aparece em qualquer rota protegida sem login).
  { path: "/cadastro", element: <CadastroPage /> },
  { path: "/esqueci-senha", element: <EsqueciSenhaPage /> },
  { path: "/redefinir-senha", element: <RedefinirSenhaPage /> },
  { path: "/termos", element: <LegalPage pagina="termos" /> },
  { path: "/privacidade", element: <LegalPage pagina="privacidade" /> },
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
      { path: "/conta", element: <ContaPage /> },
    ],
  },
]);
