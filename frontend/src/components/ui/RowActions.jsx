import { Link } from 'react-router-dom'
import { PencilSimple, Trash } from '@phosphor-icons/react'

// Botões de editar/remover usados nas listagens
export default function RowActions({ editarPara, onRemover, nome }) {
  return (
    <div className="flex items-center gap-1">
      <Link
        to={editarPara}
        className="p-2 rounded-lg text-text-muted hover:text-white hover:bg-gray-800 transition-colors"
        aria-label={`Editar ${nome}`}
        title="Editar"
      >
        <PencilSimple size={18} />
      </Link>
      <button
        onClick={onRemover}
        className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger-bg transition-colors"
        aria-label={`Remover ${nome}`}
        title="Remover"
      >
        <Trash size={18} />
      </button>
    </div>
  )
}
