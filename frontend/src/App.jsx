import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import { PrivateRoute, PublicOnlyRoute } from './routes/RouteGuards'
import Cadastro from './pages/auth/Cadastro'
import Login from './pages/auth/Login'
import Configuracoes from './pages/Configuracoes'
import ContaForm from './pages/contas/ContaForm'
import ContasList from './pages/contas/ContasList'
import Dashboard from './pages/Dashboard'
import MetaForm from './pages/metas/MetaForm'
import MetasList from './pages/metas/MetasList'
import NotFound from './pages/NotFound'
import OrcamentoForm from './pages/orcamentos/OrcamentoForm'
import OrcamentosList from './pages/orcamentos/OrcamentosList'
import Relatorios from './pages/Relatorios'
import TransacaoForm from './pages/transacoes/TransacaoForm'
import TransacoesList from './pages/transacoes/TransacoesList'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />

          <Route path="transacoes">
            <Route index element={<TransacoesList />} />
            <Route path="nova" element={<TransacaoForm />} />
            <Route path=":id/editar" element={<TransacaoForm />} />
          </Route>

          <Route path="contas">
            <Route index element={<ContasList />} />
            <Route path="nova" element={<ContaForm />} />
            <Route path=":id/editar" element={<ContaForm />} />
          </Route>

          <Route path="metas">
            <Route index element={<MetasList />} />
            <Route path="nova" element={<MetaForm />} />
            <Route path=":id/editar" element={<MetaForm />} />
          </Route>

          <Route path="orcamentos">
            <Route index element={<OrcamentosList />} />
            <Route path="novo" element={<OrcamentoForm />} />
            <Route path=":id/editar" element={<OrcamentoForm />} />
          </Route>

          <Route path="relatorios" element={<Relatorios />} />
          <Route path="configuracoes" element={<Configuracoes />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
