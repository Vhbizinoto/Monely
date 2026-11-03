import { useState } from 'react'
import { CalendarBlank, CheckCircle, Plus, Target } from '@phosphor-icons/react'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { EmptyState, ErrorState, Loading } from '../../components/ui/Feedback'
import { Input } from '../../components/ui/FormField'
import ProgressBar from '../../components/ui/ProgressBar'
import RowActions from '../../components/ui/RowActions'
import { useToast } from '../../contexts/ToastContext'
import useFetch from '../../hooks/useFetch'
import useRemocao from '../../hooks/useRemocao'
import { getErrorMessage } from '../../services/api'
import metaService from '../../services/metaService'
import { currentMonth, formatCurrency, formatDate } from '../../utils/format'

const listarMetas = () => metaService.listar({ _sort: 'prazo', _order: 'asc' })

// Quantos meses faltam até o prazo (mínimo 1)
const mesesAte = (prazo) => {
  const [anoAtual, mesAtual] = currentMonth().split('-').map(Number)
  const [ano, mes] = prazo.split('-').map(Number)
  return Math.max((ano - anoAtual) * 12 + (mes - mesAtual), 1)
}

export default function MetasList() {
  const { data: metas, setData, loading, error, reload } = useFetch(listarMetas, [])
  const { pedirRemocao, alvo, dialogProps } = useRemocao({
    remover: metaService.remover,
    mensagemSucesso: 'Meta removida.',
    onRemovido: (removida) => setData((atual) => atual.filter((m) => m.id !== removida.id)),
  })

  const substituir = (atualizada) => setData((atual) => atual.map((m) => (m.id === atualizada.id ? atualizada : m)))

  const header = (
    <PageHeader
      titulo="Metas"
      subtitulo="Junte dinheiro para o que importa"
      acoes={<Button to="/metas/nova" icon={Plus}>Nova meta</Button>}
    />
  )

  if (loading) return <>{header}<Loading /></>
  if (error) return <>{header}<ErrorState mensagem={error} onRetry={reload} /></>

  return (
    <>
      {header}

      {metas.length === 0 ? (
        <EmptyState
          icon={Target}
          titulo="Nenhuma meta ainda"
          descricao="Reserva de emergência, viagem, um curso... crie sua primeira meta."
          acao={<Button to="/metas/nova" icon={Plus}>Criar meta</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {metas.map((meta) => (
            <MetaCard key={meta.id} meta={meta} onAtualizada={substituir} onRemover={() => pedirRemocao(meta)} />
          ))}
        </div>
      )}

      <ConfirmDialog
        {...dialogProps}
        titulo="Remover meta?"
        mensagem={alvo && `A meta "${alvo.nome}" e todo o progresso registrado nela serão removidos.`}
      />
    </>
  )
}

function MetaCard({ meta, onAtualizada, onRemover }) {
  const toast = useToast()
  const [depositando, setDepositando] = useState(false)
  const [valor, setValor] = useState('')
  const [salvando, setSalvando] = useState(false)

  const concluida = meta.valorAtual >= meta.valorAlvo
  const falta = Math.max(meta.valorAlvo - meta.valorAtual, 0)
  const percentual = Math.min(Math.round((meta.valorAtual / meta.valorAlvo) * 100), 100)

  const depositar = async (e) => {
    e.preventDefault()
    const quantia = Number(valor)
    if (!(quantia > 0)) return
    setSalvando(true)
    try {
      const atualizada = await metaService.atualizar(meta.id, { ...meta, valorAtual: meta.valorAtual + quantia })
      onAtualizada(atualizada)
      toast(`${formatCurrency(quantia)} adicionados em "${meta.nome}".`)
      setDepositando(false)
      setValor('')
    } catch (err) {
      toast(getErrorMessage(err), 'erro')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Card className="flex flex-col">
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${concluida ? 'bg-primary text-black' : 'bg-primary-bg text-primary'}`}>
            {concluida ? <CheckCircle size={22} weight="fill" /> : <Target size={22} />}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-white truncate">{meta.nome}</h3>
            <p className="text-xs text-text-muted flex items-center gap-1">
              <CalendarBlank size={12} /> até {formatDate(meta.prazo)}
            </p>
          </div>
        </div>
        <RowActions editarPara={`/metas/${meta.id}/editar`} onRemover={onRemover} nome={meta.nome} />
      </div>

      <div className="flex justify-between items-end mb-2">
        <p className="text-2xl font-bold text-white">{formatCurrency(meta.valorAtual)}</p>
        <p className="text-sm font-semibold text-primary">{percentual}%</p>
      </div>
      <ProgressBar valor={meta.valorAtual} max={meta.valorAlvo} label={`Progresso de ${meta.nome}`} />
      <p className="text-xs text-text-muted mt-2 mb-5">de {formatCurrency(meta.valorAlvo)}</p>

      <div className="mt-auto pt-4 border-t border-gray-800">
        {concluida ? (
          <p className="text-sm text-primary font-medium">Meta alcançada! 🎉</p>
        ) : depositando ? (
          <form onSubmit={depositar} className="flex gap-2 items-start">
            <div className="flex-1">
              <Input type="number" step="0.01" min="0" placeholder="Valor" value={valor} onChange={(e) => setValor(e.target.value)} aria-label="Valor a adicionar" autoFocus />
            </div>
            <Button type="submit" size="sm" loading={salvando} className="py-2.5">
              OK
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setDepositando(false)} className="py-2.5">
              Cancelar
            </Button>
          </form>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-text-muted">
              Faltam {formatCurrency(falta)} · {formatCurrency(falta / mesesAte(meta.prazo))}/mês
            </p>
            <Button size="sm" variant="secondary" icon={Plus} onClick={() => setDepositando(true)}>
              Adicionar
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
