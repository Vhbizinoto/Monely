import { ChartBar } from '@phosphor-icons/react'
import Card from '../ui/Card'
import { EmptyState } from '../ui/Feedback'
import { getCategoria } from '../../constants/categorias'
import { despesasPorCategoria } from '../../utils/finance'
import { formatCurrency } from '../../utils/format'

// Gráfico de barras dos gastos do mês por categoria + legenda
export default function ResumoMes({ transacoes, titulo = 'Resumo do mês', className = '' }) {
  const categorias = despesasPorCategoria(transacoes)
  const total = categorias.reduce((soma, c) => soma + c.total, 0)
  const maior = categorias[0]?.total || 1

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      <h3 className="font-bold text-lg text-white mb-6">{titulo}</h3>

      {categorias.length === 0 ? (
        <EmptyState icon={ChartBar} titulo="Nenhum gasto neste mês" descricao="Quando você registrar despesas, elas aparecem aqui por categoria." />
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 flex-1">
          <div className="flex-1 flex items-end h-48 lg:h-auto min-h-[200px] pt-10">
            <div className="w-full flex items-end h-full gap-[2px]">
              {categorias.map(({ categoria, total: valor }) => (
                <div
                  key={categoria}
                  className="flex-1 rounded-t-sm hover:opacity-80 transition-opacity relative group cursor-pointer"
                  style={{ height: `${Math.max((valor / maior) * 100, 4)}%`, backgroundColor: getCategoria(categoria).cor }}
                  aria-label={`${categoria}: ${formatCurrency(valor)}`}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap pointer-events-none z-10 shadow-lg">
                    {categoria}: {formatCurrency(valor)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between w-full lg:w-72 shrink-0">
            <ul className="flex flex-col gap-3">
              {categorias.map(({ categoria, total: valor }) => (
                <li key={categoria} className="flex items-center gap-3 text-sm">
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: getCategoria(categoria).cor }} />
                  <span className="text-text-muted flex-1">{categoria}</span>
                  <span className="text-text-muted">{Math.round((valor / total) * 100)}%</span>
                  <span className="text-white font-medium w-24 text-right">{formatCurrency(valor)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-6 border-t border-gray-800/50 flex flex-col items-center lg:items-end">
              <p className="text-3xl font-bold text-white mb-1">{formatCurrency(total)}</p>
              <p className="text-sm text-text-muted">Total de gastos</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
