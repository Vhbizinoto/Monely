import { Eye } from '@phosphor-icons/react'
import Card from './Card'

// Bloco da coluna lateral dos formulários: rótulo + conteúdo
export function PreviewSection({ titulo, icon: Icon = Eye, children }) {
  return (
    <section>
      <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
        <Icon size={14} /> {titulo}
      </h2>
      {children}
    </section>
  )
}

// Card de informação de contexto (ex.: impacto no saldo, histórico de gastos)
export function InfoCard({ children }) {
  return (
    <Card hover={false} className="!p-5">
      {children}
    </Card>
  )
}

// Linha "rótulo ........ valor"
export function InfoRow({ rotulo, valor, destaque, cor }) {
  return (
    <div className="flex justify-between items-baseline gap-4 py-1.5">
      <span className="text-sm text-text-muted">{rotulo}</span>
      <span className={`text-right ${destaque ? 'text-lg font-bold' : 'text-sm font-medium'} ${cor || 'text-white'}`}>{valor}</span>
    </div>
  )
}
