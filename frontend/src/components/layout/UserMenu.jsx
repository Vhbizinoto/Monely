import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CaretDown, Gear, SignOut } from '@phosphor-icons/react'
import { useAuth } from '../../contexts/AuthContext'

const iniciais = (nome = '') =>
  nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('')

export default function UserMenu() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [aberto, setAberto] = useState(false)
  const ref = useRef(null)

  // Fecha o menu ao clicar fora
  useEffect(() => {
    if (!aberto) return
    const fechar = (e) => !ref.current?.contains(e.target) && setAberto(false)
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [aberto])

  const sair = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAberto((a) => !a)}
        className="flex items-center gap-3 rounded-lg p-1 pr-2 hover:bg-gray-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        aria-haspopup="menu"
        aria-expanded={aberto}
      >
        <div className="w-10 h-10 rounded-full bg-primary-bg text-primary font-semibold flex items-center justify-center">
          {iniciais(usuario?.nome)}
        </div>
        <div className="text-left hidden sm:block">
          <p className="font-semibold text-sm">{usuario?.nome}</p>
          <p className="text-xs text-text-muted">{usuario?.email}</p>
        </div>
        <CaretDown size={16} className={`text-text-muted transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </button>

      {aberto && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 bg-card border border-gray-800 rounded-xl shadow-xl shadow-black/40 py-2 z-30"
        >
          <Link
            to="/configuracoes"
            role="menuitem"
            onClick={() => setAberto(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:text-white hover:bg-gray-800/50"
          >
            <Gear size={18} /> Configurações
          </Link>
          <button
            role="menuitem"
            onClick={sair}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger-bg"
          >
            <SignOut size={18} /> Sair
          </button>
        </div>
      )}
    </div>
  )
}
