import { Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './components/features/dashboard/DashboardPage'
import { CalendarioPage } from './components/features/calendario/CalendarioPage'
import { GanchosPage } from './components/features/ganchos/GanchosPage'
import { MarcasPage } from './components/features/marcas/MarcasPage'
import { AmostrasPage } from './components/features/amostras/AmostrasPage'
import { ProdutosPage } from './components/features/produtos/ProdutosPage'
import { ModelagemVideoPage } from './components/features/modelagem/ModelagemVideoPage'
import { PerfilPage } from './components/features/perfil/PerfilPage'
import { LoginPage } from './components/features/auth/LoginPage'
import { useAuth } from './components/features/auth/AuthProvider'

function App() {
  const { autenticado, carregando } = useAuth()

  if (carregando) return null
  if (!autenticado) return <LoginPage />

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/calendario" element={<CalendarioPage />} />
        <Route path="/ganchos" element={<GanchosPage />} />
        <Route path="/marcas" element={<MarcasPage />} />
        <Route path="/amostras" element={<AmostrasPage />} />
        <Route path="/produtos" element={<ProdutosPage />} />
        <Route path="/modelagem-video" element={<ModelagemVideoPage />} />
        <Route path="/perfil" element={<PerfilPage />} />
      </Routes>
    </AppShell>
  )
}

export default App
