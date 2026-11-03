import { useState } from 'react'
import { CalendarBlank, CheckCircle, Plus, Target } from '@phosphor-icons/react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import { Input } from '../ui/FormField'
import ProgressBar from '../ui/ProgressBar'
import { useToast } from '../../contexts/ToastContext'
import { getErrorMessage } from '../../services/api'
import metaService from '../../services/metaService'
import { mesesAte } from '../../utils/finance'
import { formatCurrency, formatDate } from '../../utils/format'

// Card de meta com progresso. Sem "onAtualizada" vira só leitura (pré-visualização do formulário).
export default function MetaCard({ meta, acoes, onAtualizada, hover = true }) {
  const toast = useToast()
  const [depositando, setDepositando] = useState(false)
  const [valor, setValor] = useState('')
  const [salvando, setSalvando] = useState(false)

  const alvo = Number(meta.valorAlvo) || 0
  const atual = Number(meta.valorAtual) || 0
  const concluida = alvo > 0 && atual >= alvo
  const falta = Math.max(alvo - atual, 0)
  const percentual = alvo > 0 ? Math.min(Math.round((atual / alvo) * 100), 100) : 0

  const depositar = async (e) => {
    e.preventDefault()
    const quantia = Number(valor)
    if (!(quantia > 0)) return
    setSalvando(true)
    try {
      const atualizada = await metaService.atualizar(meta.id, { ...meta, valorAtual: atual + quantia })
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
    <Card hover={hover} className="flex flex-col">
      <div className="flex justify-between items-start mb-5 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${concluida ? 'bg-primary text-black' : 'bg-primary-bg text-primary'}`}>
            {concluida ? <CheckCircle size={22} weight="fill" /> : <Target size={22} />}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-white truncate">{meta.nome || 'Nome da meta'}</h3>
            <p className="text-xs text-text-muted flex items-center gap-1">
              <CalendarBlank size={12} /> {meta.prazo ? `até ${formatDate(meta.prazo)}` : 'sem prazo definido'}
            </p>
          </div>
        </div>
        {acoes}
      </div>

      <div className="flex justify-between items-end mb-2">
        <p className="text-2xl font-bold text-white">{formatCurrency(atual)}</p>
        <p className="text-sm font-semibold text-primary">{percentual}%</p>
      </div>
      <ProgressBar valor={atual} max={alvo} label={`Progresso de ${meta.nome}`} />
      <p className="text-xs text-text-muted mt-2 mb-5">de {formatCurrency(alvo)}</p>

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
              Faltam {formatCurrency(falta)}
              {meta.prazo && ` · ${formatCurrency(falta / mesesAte(meta.prazo))}/mês`}
            </p>
            {onAtualizada && (
              <Button size="sm" variant="secondary" icon={Plus} onClick={() => setDepositando(true)}>
                Adicionar
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
