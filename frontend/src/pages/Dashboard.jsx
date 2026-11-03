import { Link } from 'react-router-dom'
import { ArrowDownLeft, ArrowsLeftRight, FileMinus, Files, Plus, Target } from '@phosphor-icons/react'
import PageHeader from '../components/layout/PageHeader'
import ResumoMes from '../components/dashboard/ResumoMes'
import TransacaoItem from '../components/transacoes/TransacaoItem'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { EmptyState, ErrorState, Loading } from '../components/ui/Feedback'
import ProgressBar from '../components/ui/ProgressBar'
import StatCard from '../components/ui/StatCard'
import { useAuth } from '../contexts/AuthContext'
import useFetch from '../hooks/useFetch'
import contaService from '../services/contaService'
import metaService from '../services/metaService'
import transacaoService from '../services/transacaoService'
import { doMes, saldoDaConta, somaPorTipo } from '../utils/finance'
import { currentMonth, formatCurrency, percentChange, shiftMonth } from '../utils/format'

const carregarDashboard = async () => {
  const [contas, transacoes, metas] = await Promise.all([
    contaService.listar(),
    transacaoService.listar({ _sort: 'data,id', _order: 'desc,desc' }),
    metaService.listar(),
  ])
  return { contas, transacoes, metas }
}

export default function Dashboard() {
  const { usuario } = useAuth()
  const { data, loading, error, reload } = useFetch(carregarDashboard)
  const primeiroNome = usuario?.nome?.split(' ')[0]

  const header = (
    <PageHeader
      titulo={`Bem-vindo, ${primeiroNome}!`}
      subtitulo="Aqui está o resumo das suas finanças"
      acoes={
        <Button to="/transacoes/nova" icon={Plus}>
          Nova transação
        </Button>
      }
    />
  )

  if (loading) return <>{header}<Loading /></>
  if (error) return <>{header}<ErrorState mensagem={error} onRetry={reload} /></>

  const { contas, transacoes, metas } = data
  const mes = currentMonth()
  const doMesAtual = doMes(transacoes, mes)
  const doMesAnterior = doMes(transacoes, shiftMonth(mes, -1))

  const saldoTotal = contas.reduce((total, conta) => total + saldoDaConta(conta, transacoes), 0)
  const entradas = somaPorTipo(doMesAtual, 'RECEITA')
  const saidas = somaPorTipo(doMesAtual, 'DESPESA')
  const saldoMesPassado = saldoTotal - (entradas - saidas)

  const contasPorId = Object.fromEntries(contas.map((c) => [c.id, c]))
  const metasEmAndamento = metas.filter((m) => m.valorAtual < m.valorAlvo).slice(0, 3)

  return (
    <>
      {header}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard titulo="Saldo total" valor={formatCurrency(saldoTotal)} icon={ArrowDownLeft} variacao={percentChange(saldoTotal, saldoMesPassado)} />
        <StatCard titulo="Entradas" valor={formatCurrency(entradas)} icon={Files} variacao={percentChange(entradas, somaPorTipo(doMesAnterior, 'RECEITA'))} />
        <StatCard
          titulo="Saídas"
          valor={formatCurrency(saidas)}
          icon={FileMinus}
          tom="danger"
          variacao={percentChange(saidas, somaPorTipo(doMesAnterior, 'DESPESA'))}
          positivoEhBom={false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <ResumoMes transacoes={doMesAtual} className="lg:col-span-2" />

        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-white">Últimas transações</h3>
            <Link to="/transacoes" className="text-primary text-sm hover:underline">
              Ver todas
            </Link>
          </div>
          {transacoes.length === 0 ? (
            <EmptyState icon={ArrowsLeftRight} titulo="Nenhuma transação" acao={<Button to="/transacoes/nova" size="sm">Adicionar</Button>} />
          ) : (
            <div className="flex flex-col gap-6">
              {transacoes.slice(0, 5).map((t) => (
                <TransacaoItem key={t.id} transacao={t} conta={contasPorId[t.contaId]} />
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-white">Metas em andamento</h3>
          <Link to="/metas" className="text-primary text-sm hover:underline">
            Ver todas
          </Link>
        </div>
        {metasEmAndamento.length === 0 ? (
          <EmptyState icon={Target} titulo="Nenhuma meta em andamento" acao={<Button to="/metas/nova" size="sm">Criar meta</Button>} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metasEmAndamento.map((meta) => (
              <div key={meta.id}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white font-medium">{meta.nome}</span>
                  <span className="text-text-muted">{Math.round((meta.valorAtual / meta.valorAlvo) * 100)}%</span>
                </div>
                <ProgressBar valor={meta.valorAtual} max={meta.valorAlvo} label={meta.nome} />
                <p className="text-xs text-text-muted mt-2">
                  {formatCurrency(meta.valorAtual)} de {formatCurrency(meta.valorAlvo)}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  )
}
