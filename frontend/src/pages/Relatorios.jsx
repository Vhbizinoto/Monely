import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import ResumoMes from '../components/dashboard/ResumoMes'
import Card from '../components/ui/Card'
import { ErrorState, Loading } from '../components/ui/Feedback'
import { Select } from '../components/ui/FormField'
import useFetch from '../hooks/useFetch'
import transacaoService from '../services/transacaoService'
import { doMes, somaPorTipo } from '../utils/finance'
import { currentMonth, formatCurrency, formatMonth, shiftMonth } from '../utils/format'

const listarTransacoes = () => transacaoService.listar()

const PERIODOS = [
  { value: '3', label: 'Últimos 3 meses' },
  { value: '6', label: 'Últimos 6 meses' },
  { value: '12', label: 'Últimos 12 meses' },
]

export default function Relatorios() {
  const { data: transacoes, loading, error, reload } = useFetch(listarTransacoes, [])
  const [periodo, setPeriodo] = useState('6')

  const header = <PageHeader titulo="Relatórios" subtitulo="Como suas finanças evoluíram ao longo do tempo" />

  if (loading) return <>{header}<Loading /></>
  if (error) return <>{header}<ErrorState mensagem={error} onRetry={reload} /></>

  const mesAtual = currentMonth()
  const meses = Array.from({ length: Number(periodo) }, (_, i) => shiftMonth(mesAtual, i - Number(periodo) + 1))
  const porMes = meses.map((mes) => {
    const doPeriodo = doMes(transacoes, mes)
    return { mes, entradas: somaPorTipo(doPeriodo, 'RECEITA'), saidas: somaPorTipo(doPeriodo, 'DESPESA') }
  })
  const maior = Math.max(...porMes.flatMap((m) => [m.entradas, m.saidas]), 1)
  const totalEntradas = porMes.reduce((s, m) => s + m.entradas, 0)
  const totalSaidas = porMes.reduce((s, m) => s + m.saidas, 0)
  const transacoesDoPeriodo = transacoes.filter((t) => t.data >= `${meses[0]}-01`)

  return (
    <>
      {header}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Resumo rotulo="Entradas no período" valor={totalEntradas} cor="text-primary" />
        <Resumo rotulo="Saídas no período" valor={totalSaidas} cor="text-danger" />
        <Resumo rotulo="Economia" valor={totalEntradas - totalSaidas} cor={totalEntradas >= totalSaidas ? 'text-primary' : 'text-danger'} />
      </div>

      <Card hover={false} className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <h3 className="font-bold text-lg text-white">Entradas x Saídas</h3>
          <div className="flex items-center gap-6">
            <div className="flex gap-4 text-sm text-text-muted">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-primary" /> Entradas</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-danger" /> Saídas</span>
            </div>
            <div className="w-44">
              <Select options={PERIODOS} value={periodo} onChange={(e) => setPeriodo(e.target.value)} aria-label="Período" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-end gap-4 h-64 pt-10" style={{ minWidth: `${porMes.length * 64}px` }}>
            {porMes.map(({ mes, entradas, saidas }) => (
              <div key={mes} className="flex-1 flex flex-col items-center h-full">
                <div className="flex-1 w-full flex items-end justify-center gap-1">
                  <Barra valor={entradas} maior={maior} cor="bg-primary" rotulo={`Entradas em ${formatMonth(mes)}`} />
                  <Barra valor={saidas} maior={maior} cor="bg-danger" rotulo={`Saídas em ${formatMonth(mes)}`} />
                </div>
                <span className="text-xs text-text-muted mt-3 whitespace-nowrap">{formatMonth(mes, { month: 'short' }).replace('.', '')}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <ResumoMes transacoes={transacoesDoPeriodo} titulo="Gastos por categoria no período" />
    </>
  )
}

function Barra({ valor, maior, cor, rotulo }) {
  return (
    <div
      className={`w-1/2 max-w-[28px] ${cor} rounded-t-sm relative group cursor-pointer hover:opacity-80 transition-opacity`}
      style={{ height: `${Math.max((valor / maior) * 100, valor ? 2 : 0)}%` }}
      aria-label={`${rotulo}: ${formatCurrency(valor)}`}
    >
      <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap pointer-events-none z-10 shadow-lg">
        {formatCurrency(valor)}
      </div>
    </div>
  )
}

function Resumo({ rotulo, valor, cor }) {
  return (
    <div className="bg-card border border-gray-800 rounded-xl px-5 py-4">
      <p className="text-sm text-text-muted mb-1">{rotulo}</p>
      <p className={`text-xl font-bold ${cor}`}>{formatCurrency(valor)}</p>
    </div>
  )
}
