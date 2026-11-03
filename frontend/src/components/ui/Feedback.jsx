import { CircleNotch, WarningCircle } from '@phosphor-icons/react'
import Button from './Button'

export function Loading({ texto = 'Carregando...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-text-muted" role="status">
      <CircleNotch size={32} className="animate-spin text-primary" />
      <p className="text-sm">{texto}</p>
    </div>
  )
}

export function ErrorState({ mensagem, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-danger-bg text-danger flex items-center justify-center">
        <WarningCircle size={28} />
      </div>
      <p className="text-text-muted max-w-sm">{mensagem}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  )
}

export function EmptyState({ icon: Icon, titulo, descricao, acao }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-primary-bg text-primary flex items-center justify-center mb-1">
          <Icon size={28} />
        </div>
      )}
      <h3 className="font-semibold text-white text-lg">{titulo}</h3>
      {descricao && <p className="text-text-muted text-sm max-w-sm">{descricao}</p>}
      {acao && <div className="mt-2">{acao}</div>}
    </div>
  )
}
