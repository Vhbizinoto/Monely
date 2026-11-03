import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowsLeftRight, CaretLeft, CaretRight, MagnifyingGlass, Plus } from '@phosphor-icons/react'
import PageHeader from '../../components/layout/PageHeader'
import TransacaoItem from '../../components/transacoes/TransacaoItem'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { EmptyState, ErrorState, Loading } from '../../components/ui/Feedback'
import { Input, Select } from '../../components/ui/FormField'
import RowActions from '../../components/ui/RowActions'
import useFetch from '../../hooks/useFetch'
import useRemocao from '../../hooks/useRemocao'
import contaService from '../../services/contaService'
import transacaoService from '../../services/transacaoService'
import { doMes, somaPorTipo } from '../../utils/finance'
import { currentMonth, formatCurrency, formatMonth, shiftMonth } from '../../utils/format'

const carregar = async () => {
  const [transacoes, contas] = await Promise.all([
    transacaoService.listar({ _sort: 'data,id', _order: 'desc,desc' }),
    contaService.listar(),
  ])
  return { transacoes, contas }
}

const TIPOS = [
  { value: '', label: 'Todos os tipos' },
  { value: 'RECEITA', label: 'Entradas' },
  { value: 'DESPESA', label: 'Saídas' },
]

export default function TransacoesList() {
  const { data, setData, loading, error, reload } = useFetch(carregar)

  // Filtros ficam na URL (?mes=2026-10&tipo=DESPESA), então dá para compartilhar o link ou voltar no navegador
  const [params, setParams] = useSearchParams()
  const mes = params.get('mes') || currentMonth()
  const tipo = params.get('tipo') || ''
  const contaId = params.get('conta') || ''
  const busca = params.get('q') || ''

  const setFiltro = (chave, valor) => {
    const novos = new URLSearchParams(params)
    if (valor) novos.set(chave, valor)
    else novos.delete(chave)
    setParams(novos, { replace: true })
  }

  const { pedirRemocao, alvo, dialogProps } = useRemocao({
    remover: transacaoService.remover,
    mensagemSucesso: 'Transação removida.',
    onRemovido: (removida) =>
      setData((atual) => ({ ...atual, transacoes: atual.transacoes.filter((t) => t.id !== removida.id) })),
  })

  const filtradas = useMemo(() => {
    if (!data) return []
    const termo = busca.trim().toLowerCase()
    return doMes(data.transacoes, mes).filter(
      (t) =>
        (!tipo || t.tipo === tipo) &&
        (!contaId || t.contaId === Number(contaId)) &&
        (!termo || t.descricao.toLowerCase().includes(termo) || t.categoria.toLowerCase().includes(termo)),
    )
  }, [data, mes, tipo, contaId, busca])

  const header = (
    <PageHeader
      titulo="Transações"
      subtitulo="Consulte, cadastre e edite suas entradas e saídas"
      acoes={<Button to="/transacoes/nova" icon={Plus}>Nova transação</Button>}
    />
  )

  if (loading) return <>{header}<Loading /></>
  if (error) return <>{header}<ErrorState mensagem={error} onRetry={reload} /></>

  const contasPorId = Object.fromEntries(data.contas.map((c) => [c.id, c]))
  const entradas = somaPorTipo(filtradas, 'RECEITA')
  const saidas = somaPorTipo(filtradas, 'DESPESA')

  return (
    <>
      {header}

      <Card hover={false} className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
          <div className="flex items-center gap-2">
            <button onClick={() => setFiltro('mes', shiftMonth(mes, -1))} className="p-2.5 rounded-lg border border-gray-700 text-text-muted hover:text-white hover:bg-gray-800" aria-label="Mês anterior">
              <CaretLeft size={18} />
            </button>
            <span className="min-w-[150px] text-center font-semibold">{formatMonth(mes)}</span>
            <button onClick={() => setFiltro('mes', shiftMonth(mes, 1))} className="p-2.5 rounded-lg border border-gray-700 text-text-muted hover:text-white hover:bg-gray-800" aria-label="Próximo mês">
              <CaretRight size={18} />
            </button>
          </div>
          <div className="flex-1">
            <Input placeholder="Buscar por descrição ou categoria" icon={MagnifyingGlass} value={busca} onChange={(e) => setFiltro('q', e.target.value)} aria-label="Buscar" />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:w-96">
            <Select options={TIPOS} value={tipo} onChange={(e) => setFiltro('tipo', e.target.value)} aria-label="Filtrar por tipo" />
            <Select
              options={[{ value: '', label: 'Todas as contas' }, ...data.contas.map((c) => ({ value: c.id, label: c.nome }))]}
              value={contaId}
              onChange={(e) => setFiltro('conta', e.target.value)}
              aria-label="Filtrar por conta"
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <ResumoValor rotulo="Entradas" valor={entradas} cor="text-primary" />
        <ResumoValor rotulo="Saídas" valor={saidas} cor="text-danger" />
        <ResumoValor rotulo="Resultado" valor={entradas - saidas} cor={entradas - saidas >= 0 ? 'text-primary' : 'text-danger'} />
      </div>

      <Card hover={false}>
        {filtradas.length === 0 ? (
          <EmptyState
            icon={ArrowsLeftRight}
            titulo="Nenhuma transação encontrada"
            descricao="Tente mudar o mês ou os filtros, ou cadastre uma nova transação."
            acao={<Button to="/transacoes/nova" icon={Plus} size="sm">Nova transação</Button>}
          />
        ) : (
          <ul className="flex flex-col divide-y divide-gray-800">
            {filtradas.map((t) => (
              <li key={t.id} className="py-4 first:pt-0 last:pb-0">
                <TransacaoItem
                  transacao={t}
                  conta={contasPorId[t.contaId]}
                  acoes={<RowActions editarPara={`/transacoes/${t.id}/editar`} onRemover={() => pedirRemocao(t)} nome={t.descricao} />}
                />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ConfirmDialog
        {...dialogProps}
        titulo="Remover transação?"
        mensagem={alvo && `"${alvo.descricao}" de ${formatCurrency(alvo.valor)} será removida permanentemente.`}
      />
    </>
  )
}

function ResumoValor({ rotulo, valor, cor }) {
  return (
    <div className="bg-card border border-gray-800 rounded-xl px-5 py-4">
      <p className="text-sm text-text-muted mb-1">{rotulo}</p>
      <p className={`text-xl font-bold ${cor}`}>{formatCurrency(valor)}</p>
    </div>
  )
}
