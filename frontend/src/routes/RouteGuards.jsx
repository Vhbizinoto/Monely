import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Só deixa passar quem está logado; guarda a página pedida para voltar depois do login
export function PrivateRoute() {
  const { autenticado } = useAuth()
  const location = useLocation()
  if (!autenticado) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

// Login e cadastro não fazem sentido para quem já está logado
export function PublicOnlyRoute() {
  const { autenticado } = useAuth()
  if (autenticado) return <Navigate to="/" replace />
  return <Outlet />
}
