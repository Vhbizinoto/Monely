import Card from '../ui/Card'
import { getTipoConta } from '../../constants/contas'
import { formatCurrency } from '../../utils/format'

// Card de uma conta. Usado na listagem e na pré-visualização do formulário.
export default function ContaCard({ conta, saldo, acoes, hover = true }) {
  const tipo = getTipoConta(conta.tipo)
  const Icone = tipo.icone
  return (
    <Card hover={hover}>
      <div className="flex justify-between items-start mb-6 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 shrink-0 rounded-xl bg-primary-bg text-primary flex items-center justify-center">
            <Icone size={22} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-white truncate">{conta.nome || 'Nome da conta'}</h3>
            <p className="text-xs text-text-muted truncate">
              {tipo.nome}
              {conta.instituicao && ` · ${conta.instituicao}`}
            </p>
          </div>
        </div>
        {acoes}
      </div>
      <p className="text-sm text-text-muted mb-1">Saldo atual</p>
      <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-white' : 'text-danger'}`}>{formatCurrency(saldo)}</p>
      <p className="text-xs text-text-muted mt-2">Saldo inicial: {formatCurrency(conta.saldoInicial)}</p>
    </Card>
  )
}
