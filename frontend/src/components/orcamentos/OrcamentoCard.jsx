import Card from '../ui/Card'
import CategoryIcon from '../ui/CategoryIcon'
import ProgressBar from '../ui/ProgressBar'
import { corDoUso } from '../../utils/finance'
import { formatCurrency } from '../../utils/format'

// Card de orçamento: limite x gasto da categoria no mês
export default function OrcamentoCard({ categoria, limite, gasto, acoes, hover = true }) {
  const percentual = limite > 0 ? (gasto / limite) * 100 : 0
  const cor = corDoUso(percentual)
  return (
    <Card hover={hover}>
      <div className="flex justify-between items-start mb-5 gap-3">
        <div className="flex items-center gap-3">
          <CategoryIcon categoria={categoria} />
          <div>
            <h3 className="font-semibold text-white">{categoria || 'Categoria'}</h3>
            <p className="text-xs text-text-muted">Limite de {formatCurrency(limite)}</p>
          </div>
        </div>
        {acoes}
      </div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-white font-medium">{formatCurrency(gasto)}</span>
        <span style={{ color: cor }} className="font-semibold">
          {Math.round(percentual)}%
        </span>
      </div>
      <ProgressBar valor={gasto} max={limite} cor={cor} label={`Uso do orçamento de ${categoria}`} />
      <p className="text-xs text-text-muted mt-2">
        {gasto <= limite ? `Disponível: ${formatCurrency(limite - gasto)}` : `Acima do limite em ${formatCurrency(gasto - limite)}`}
      </p>
    </Card>
  )
}
