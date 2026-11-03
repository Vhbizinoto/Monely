import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, BellSlash, CheckCircle, CircleNotch, Info, Warning, WarningCircle } from '@phosphor-icons/react'
import useClickOutside from '../../hooks/useClickOutside'
import useNotificacoes from '../../hooks/useNotificacoes'

const ESTILOS = {
  perigo: { icone: WarningCircle, classe: 'bg-danger-bg text-danger' },
  alerta: { icone: Warning, classe: 'bg-[#2A241E] text-chart-orange' },
  info: { icone: Info, classe: 'bg-[#1E2235] text-[#6B8AFF]' },
  sucesso: { icone: CheckCircle, classe: 'bg-primary-bg text-primary' },
}

export default function NotificationBell() {
  const navigate = useNavigate()
  const { notificacoes, naoLidas, carregando, marcarComoLida, marcarTodasComoLidas } = useNotificacoes()
  const [aberto, setAberto] = useState(false)
  const fechar = useCallback(() => setAberto(false), [])
  const ref = useClickOutside(aberto, fechar)

  const abrirNotificacao = (n) => {
    marcarComoLida(n.id)
    setAberto(false)
    navigate(n.link)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAberto((a) => !a)}
        className="relative p-2 rounded-lg text-text-muted hover:text-white hover:bg-gray-800/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={naoLidas ? `Notificações (${naoLidas} não lidas)` : 'Notificações'}
        aria-haspopup="true"
        aria-expanded={aberto}
      >
        <Bell size={24} />
        {naoLidas > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-black text-[10px] font-bold flex items-center justify-center">
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div className="fixed inset-x-4 top-20 sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-96 bg-card border border-gray-800 rounded-xl shadow-xl shadow-black/40 z-30 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <h2 className="font-semibold text-white">Notificações</h2>
            {naoLidas > 0 && (
              <button onClick={marcarTodasComoLidas} className="text-xs text-primary hover:underline">
                Marcar todas como lidas
              </button>
            )}
          </div>

          {carregando ? (
            <div className="flex justify-center py-8 text-primary">
              <CircleNotch size={24} className="animate-spin" />
            </div>
          ) : notificacoes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 px-6 text-center">
              <BellSlash size={28} className="text-text-muted" />
              <p className="text-sm text-white font-medium">Tudo em dia!</p>
              <p className="text-xs text-text-muted">Avisamos aqui quando um orçamento estiver no limite ou uma meta estiver perto do prazo.</p>
            </div>
          ) : (
            <ul className="max-h-96 overflow-y-auto divide-y divide-gray-800">
              {notificacoes.map((n) => {
                const { icone: Icone, classe } = ESTILOS[n.tipo]
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => abrirNotificacao(n)}
                      className={`w-full flex gap-3 px-4 py-3 text-left hover:bg-gray-800/50 transition-colors ${n.lida ? 'opacity-60' : ''}`}
                    >
                      <span className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${classe}`}>
                        <Icone size={18} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-white">{n.titulo}</span>
                        <span className="block text-xs text-text-muted mt-0.5">{n.descricao}</span>
                      </span>
                      {!n.lida && <span className="w-2 h-2 mt-1.5 shrink-0 rounded-full bg-primary" aria-label="Não lida" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
