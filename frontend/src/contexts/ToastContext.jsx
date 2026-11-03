import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle, WarningCircle, X } from '@phosphor-icons/react'

const ToastContext = createContext(null)

let proximoId = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const fechar = useCallback((id) => setToasts((atual) => atual.filter((t) => t.id !== id)), [])

  const mostrar = useCallback(
    (mensagem, tipo = 'sucesso') => {
      const id = proximoId++
      setToasts((atual) => [...atual, { id, mensagem, tipo }])
      setTimeout(() => fechar(id), 4000)
    },
    [fechar],
  )

  return (
    <ToastContext.Provider value={mostrar}>
      {children}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 flex flex-col gap-2 sm:w-80" aria-live="polite">
        {toasts.map((toast) => {
          const erro = toast.tipo === 'erro'
          const Icone = erro ? WarningCircle : CheckCircle
          return (
            <div
              key={toast.id}
              role="status"
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-xl shadow-black/40 bg-card ${
                erro ? 'border-danger/40' : 'border-primary/40'
              }`}
            >
              <Icone size={20} weight="fill" className={`shrink-0 mt-0.5 ${erro ? 'text-danger' : 'text-primary'}`} />
              <p className="flex-1 text-sm text-white">{toast.mensagem}</p>
              <button
                onClick={() => fechar(toast.id)}
                className="text-text-muted hover:text-white"
                aria-label="Fechar notificação"
              >
                <X size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
