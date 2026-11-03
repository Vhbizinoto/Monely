import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, House } from '@phosphor-icons/react'
import Button from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'

// Página de erro personalizada (rota inexistente)
export default function NotFound() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { autenticado } = useAuth()

  useEffect(() => {
    document.title = 'Página não encontrada | Monely'
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />

      <div className="relative text-center max-w-lg">
        <img src="/images/logo.png" alt="Monely" className="h-14 w-auto mx-auto mb-8" />
        <p className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent mb-4">
          404
        </p>
        <h1 className="text-2xl md:text-3xl font-bold mb-3">Esse dinheiro sumiu... e essa página também.</h1>
        <p className="text-text-muted mb-2">Não encontramos nada no endereço:</p>
        <code className="inline-block bg-card border border-gray-800 rounded-lg px-3 py-1 text-sm text-gray-300 mb-8 break-all">
          {pathname}
        </code>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>
            Voltar
          </Button>
          <Button to={autenticado ? '/' : '/login'} icon={House}>
            {autenticado ? 'Ir para o Dashboard' : 'Ir para o login'}
          </Button>
        </div>
      </div>
    </div>
  )
}
