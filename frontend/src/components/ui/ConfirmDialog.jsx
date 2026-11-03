import { useEffect, useRef } from 'react'
import { Warning } from '@phosphor-icons/react'
import Button from './Button'

// Modal de confirmação usado antes de remover registros
export default function ConfirmDialog({
  aberto,
  titulo,
  mensagem,
  textoConfirmar = 'Remover',
  carregando = false,
  onConfirmar,
  onCancelar,
}) {
  const cancelarRef = useRef(null)

  useEffect(() => {
    if (!aberto) return
    cancelarRef.current?.focus()
    const fecharComEsc = (e) => e.key === 'Escape' && !carregando && onCancelar()
    window.addEventListener('keydown', fecharComEsc)
    return () => window.removeEventListener('keydown', fecharComEsc)
  }, [aberto, carregando, onCancelar])

  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !carregando && onCancelar()} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-titulo"
        className="relative w-full max-w-md bg-card border border-gray-800 rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex gap-4">
          <div className="w-10 h-10 shrink-0 rounded-full bg-danger-bg text-danger flex items-center justify-center">
            <Warning size={22} />
          </div>
          <div>
            <h2 id="confirm-titulo" className="font-bold text-lg text-white mb-1">
              {titulo}
            </h2>
            <p className="text-sm text-text-muted leading-relaxed">{mensagem}</p>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
          <Button ref={cancelarRef} variant="secondary" onClick={onCancelar} disabled={carregando}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirmar} loading={carregando}>
            {textoConfirmar}
          </Button>
        </div>
      </div>
    </div>
  )
}
