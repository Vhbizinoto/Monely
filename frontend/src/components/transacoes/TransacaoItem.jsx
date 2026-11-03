import CategoryIcon from '../ui/CategoryIcon'
import { formatCurrency, formatRelativeDate } from '../../utils/format'

// Linha de uma transação: ícone, descrição, categoria, valor e data.
// "acoes" permite que a página de listagem injete botões de editar/remover.
export default function TransacaoItem({ transacao, conta, acoes }) {
  const receita = transacao.tipo === 'RECEITA'
  return (
    <div className="flex justify-between items-center gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <CategoryIcon categoria={transacao.categoria} tipo={transacao.tipo} />
        <div className="min-w-0">
          <p className="font-semibold text-white truncate">{transacao.descricao}</p>
          <p className="text-xs text-text-muted truncate">
            {transacao.categoria}
            {conta && ` · ${conta.nome}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right">
          <p className={`font-semibold whitespace-nowrap ${receita ? 'text-primary' : 'text-white'}`}>
            {receita ? '+' : '-'}
            {formatCurrency(transacao.valor)}
          </p>
          <p className="text-xs text-text-muted">{formatRelativeDate(transacao.data)}</p>
        </div>
        {acoes}
      </div>
    </div>
  )
}
