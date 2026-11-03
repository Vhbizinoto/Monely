import { useEffect } from 'react'
import NotificationBell from './NotificationBell'
import UserMenu from './UserMenu'

// Cabeçalho de cada página: título/subtítulo à esquerda, ações + usuário à direita
export default function PageHeader({ titulo, subtitulo, acoes }) {
  useEffect(() => {
    document.title = `${titulo} | Monely`
  }, [titulo])

  return (
    <header className="relative z-30 bg-background/80 backdrop-blur-md pt-4 pb-4 -mx-4 px-4 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 border-b border-gray-800/50 flex flex-col-reverse md:flex-row justify-between items-start md:items-center mb-8 lg:mb-10 gap-6">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">{titulo}</h1>
        {subtitulo && <p className="text-sm md:text-base text-text-muted">{subtitulo}</p>}
        {acoes && <div className="flex flex-wrap gap-3 mt-4 md:hidden">{acoes}</div>}
      </div>

      <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto justify-end">
        {acoes && <div className="hidden md:flex gap-3">{acoes}</div>}
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  )
}
