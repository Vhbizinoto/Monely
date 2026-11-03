import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

// Estrutura das páginas autenticadas: sidebar fixa + conteúdo da rota atual
export default function AppLayout() {
  const { pathname } = useLocation()
  const mainRef = useRef(null)

  // Volta ao topo ao trocar de página
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <Sidebar />
      <main ref={mainRef} className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
        <Outlet />
      </main>
    </div>
  )
}
