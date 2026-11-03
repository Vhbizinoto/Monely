import Card from './Card'
import { formatPercent } from '../../utils/format'

// Card de indicador (saldo, entradas, saídas...). "positivoEhBom" define a cor da variação.
export default function StatCard({ titulo, valor, icon: Icon, tom = 'primary', variacao, positivoEhBom = true }) {
  const tons = {
    primary: 'bg-primary-bg text-primary',
    danger: 'bg-danger-bg text-danger',
  }

  const bom = variacao === null || variacao === undefined ? null : variacao >= 0 === positivoEhBom

  return (
    <Card className="relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <p className="text-text-muted font-medium">{titulo}</p>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tons[tom]}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4 break-words">{valor}</h2>
      <p className="text-sm">
        {bom === null ? (
          <span className="text-text-muted">Sem dados do mês anterior</span>
        ) : (
          <>
            <span className={`font-medium ${bom ? 'text-primary' : 'text-danger'}`}>{formatPercent(variacao)}</span>{' '}
            <span className="text-text-muted">em relação ao mês passado</span>
          </>
        )}
      </p>
    </Card>
  )
}
