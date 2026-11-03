import { useSearchParams } from 'react-router-dom'
import { CaretLeft, CaretRight, ChartBar, Plus } from '@phosphor-icons/react'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import CategoryIcon from '../../components/ui/CategoryIcon'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { EmptyState, ErrorState, Loading } from '../../components/ui/Feedback'
import ProgressBar from '../../components/ui/ProgressBar'
import RowActions from '../../components/ui/RowActions'
import useFetch from '../../hooks/useFetch'
import useRemocao from '../../hooks/useRemocao'
import orcamentoService from '../../services/orcamentoService'
import transacaoService from '../../services/transacaoService'
import { doMes } from '../../utils/finance'
import { currentMonth, formatCurrency, formatMonth, shiftMonth } from '../../utils/format'

const carregar = async () => {
  const [orcamentos, transacoes] = await Promise.all([orcamentoService.listar(), transacaoService.listar({ tipo: 'DESPESA' })])
  return { orcamentos, transacoes }
}

// Verde até 75% do limite, laranja até 100%, vermelho acima
const corDoUso = (percentual) => (percentual > 100 ? '#FF4D4D' : percentual > 75 ? '#F59E0B' : '#00E08F')

export default function OrcamentosList() {
  const { data, setData, loading, error, reload } = useFetch(carregar)
  const [params, setParams] = useSearchParams()
  const mes = params.get('mes') || currentMonth()
  const irPara = (novoMes) => setParams({ mes: novoMes }, { replace: true })

  const { pedirRemocao, alvo, dialogProps } = useRemocao({
    remover: orcamentoService.remover,
    mensagemSucesso: 'Orçamento removido.',
    onRemovido: (removido) => setData((atual) => ({ ...atual, orcamentos: atual.orcamentos.filter((o) => o.id !== removido.id) })),
  })

  const header = (
    <PageHeader
      titulo="Orçamento"
      subtitulo="Defina limites de gasto por categoria"
      acoes={<Button to={`/orcamentos/novo?mes=${mes}`} icon={Plus}>Novo orçamento</Button>}
    />
  )

  if (loading) return <>{header}<Loading /></>
  if (error) return <>{header}<ErrorState mensagem={error} onRetry={reload} /></>

  const gastosDoMes = doMes(data.transacoes, mes)
  const orcamentos = data.orcamentos
    .filter((o) => o.mes === mes)
    .map((o) => {
      const gasto = gastosDoMes.filter((t) => t.categoria === o.categoria).reduce((s, t) => s + Number(t.valor), 0)
      return { ...o, gasto, percentual: (gasto / o.limite) * 100 }
    })
    .sort((a, b) => b.percentual - a.percentual)

  const totalLimite = orcamentos.reduce((s, o) => s + o.limite, 0)
  const totalGasto = orcamentos.reduce((s, o) => s + o.gasto, 0)

  return (
    <>
      {header}

      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => irPara(shiftMonth(mes, -1))} className="p-2.5 rounded-lg border border-gray-700 text-text-muted hover:text-white hover:bg-gray-800" aria-label="Mês anterior">
          <CaretLeft size={18} />
        </button>
        <span className="min-w-[170px] text-center font-semibold text-lg">{formatMonth(mes)}</span>
        <button onClick={() => irPara(shiftMonth(mes, 1))} className="p-2.5 rounded-lg border border-gray-700 text-text-muted hover:text-white hover:bg-gray-800" aria-label="Próximo mês">
          <CaretRight size={18} />
        </button>
      </div>

      {orcamentos.length === 0 ? (
        <EmptyState
          icon={ChartBar}
          titulo="Nenhum orçamento neste mês"
          descricao="Defina quanto quer gastar no máximo em cada categoria e acompanhe aqui."
          acao={<Button to={`/orcamentos/novo?mes=${mes}`} icon={Plus}>Criar orçamento</Button>}
        />
      ) : (
        <>
          <Card hover={false} className="mb-6">
            <div className="flex justify-between items-end mb-3 gap-4">
              <div>
                <p className="text-sm text-text-muted mb-1">Gasto nas categorias orçadas</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(totalGasto)} <span className="text-base font-normal text-text-muted">de {formatCurrency(totalLimite)}</span>
                </p>
              </div>
              <p className="text-sm text-text-muted text-right">
                {totalLimite - totalGasto >= 0 ? `Restam ${formatCurrency(totalLimite - totalGasto)}` : `Estourou ${formatCurrency(totalGasto - totalLimite)}`}
              </p>
            </div>
            <ProgressBar valor={totalGasto} max={totalLimite} cor={corDoUso((totalGasto / totalLimite) * 100)} label="Uso total do orçamento" />
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orcamentos.map((o) => (
              <Card key={o.id}>
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3">
                    <CategoryIcon categoria={o.categoria} />
                    <div>
                      <h3 className="font-semibold text-white">{o.categoria}</h3>
                      <p className="text-xs text-text-muted">Limite de {formatCurrency(o.limite)}</p>
                    </div>
                  </div>
                  <RowActions editarPara={`/orcamentos/${o.id}/editar`} onRemover={() => pedirRemocao(o)} nome={`orçamento de ${o.categoria}`} />
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white font-medium">{formatCurrency(o.gasto)}</span>
                  <span style={{ color: corDoUso(o.percentual) }} className="font-semibold">
                    {Math.round(o.percentual)}%
                  </span>
                </div>
                <ProgressBar valor={o.gasto} max={o.limite} cor={corDoUso(o.percentual)} label={`Uso do orçamento de ${o.categoria}`} />
                <p className="text-xs text-text-muted mt-2">
                  {o.gasto <= o.limite ? `Disponível: ${formatCurrency(o.limite - o.gasto)}` : `Acima do limite em ${formatCurrency(o.gasto - o.limite)}`}
                </p>
              </Card>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        {...dialogProps}
        titulo="Remover orçamento?"
        mensagem={alvo && `O limite de ${alvo.categoria} em ${formatMonth(alvo.mes)} será removido. Suas transações não são afetadas.`}
      />
    </>
  )
}
