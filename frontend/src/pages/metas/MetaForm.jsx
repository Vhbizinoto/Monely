import { CalendarCheck } from '@phosphor-icons/react'
import PageHeader from '../../components/layout/PageHeader'
import MetaCard from '../../components/metas/MetaCard'
import { ErrorState, Loading } from '../../components/ui/Feedback'
import FormCard from '../../components/ui/FormCard'
import { Input } from '../../components/ui/FormField'
import { InfoCard, InfoRow, PreviewSection } from '../../components/ui/PreviewPanel'
import useEntityForm from '../../hooks/useEntityForm'
import metaService from '../../services/metaService'
import { mesesAte } from '../../utils/finance'
import { formatCurrency, toISODate } from '../../utils/format'

const validar = (v) => ({
  nome: !v.nome.trim() && 'Dê um nome para a meta.',
  valorAlvo: !(Number(v.valorAlvo) > 0) && 'Informe quanto você quer juntar.',
  valorAtual: (v.valorAtual === '' || Number(v.valorAtual) < 0) && 'Informe quanto já foi guardado (pode ser 0).',
  prazo: !v.prazo && 'Informe o prazo.',
})

export default function MetaForm() {
  const { values, errors, handleChange, editando, carregando, erroCarregamento, enviando, handleSubmit } = useEntityForm({
    service: metaService,
    nome: 'Meta',
    voltarPara: '/metas',
    valoresIniciais: { nome: '', valorAlvo: '', valorAtual: '0', prazo: '' },
    validar,
    paraFormulario: (m) => ({ ...m, valorAlvo: String(m.valorAlvo), valorAtual: String(m.valorAtual) }),
    paraApi: (v) => ({ ...v, nome: v.nome.trim(), valorAlvo: Number(v.valorAlvo), valorAtual: Number(v.valorAtual) }),
  })

  const header = <PageHeader titulo={editando ? 'Editar meta' : 'Nova meta'} subtitulo="Defina o objetivo, o valor e o prazo" />

  if (carregando) return <>{header}<Loading /></>
  if (erroCarregamento) return <>{header}<ErrorState mensagem={erroCarregamento} /></>

  const falta = Math.max((Number(values.valorAlvo) || 0) - (Number(values.valorAtual) || 0), 0)
  const prazoVencido = values.prazo && values.prazo < toISODate()
  const meses = values.prazo && !prazoVencido ? mesesAte(values.prazo) : null

  const aside = (
    <>
      <PreviewSection titulo="Pré-visualização">
        <MetaCard meta={values} hover={false} />
      </PreviewSection>

      <PreviewSection titulo="Planejamento" icon={CalendarCheck}>
        <InfoCard>
          <InfoRow rotulo="Falta juntar" valor={formatCurrency(falta)} />
          <InfoRow rotulo="Meses até o prazo" valor={meses ?? '—'} />
          <div className="border-t border-gray-800 my-2" />
          <InfoRow rotulo="Guardar por mês" valor={meses ? formatCurrency(falta / meses) : '—'} destaque cor="text-primary" />
          <p className="text-xs text-text-muted mt-3 leading-relaxed">
            {prazoVencido
              ? 'O prazo já passou. Escolha uma nova data para recalcular o plano.'
              : falta === 0 && Number(values.valorAlvo) > 0
                ? 'Você já alcançou essa meta!'
                : meses
                  ? `Guardando ${formatCurrency(falta / meses / 4.3)} por semana você chega lá.`
                  : 'Defina o valor e o prazo para ver quanto guardar por mês.'}
          </p>
        </InfoCard>
      </PreviewSection>
    </>
  )

  return (
    <>
      {header}
      <FormCard
        onSubmit={handleSubmit}
        enviando={enviando}
        voltarPara="/metas"
        textoSalvar={editando ? 'Salvar alterações' : 'Criar meta'}
        aside={aside}
      >
        <Input label="Nome da meta" name="nome" placeholder="Ex.: Reserva de emergência" value={values.nome} onChange={handleChange} error={errors.nome} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input label="Valor alvo (R$)" name="valorAlvo" type="number" step="0.01" min="0" inputMode="decimal" placeholder="0,00" value={values.valorAlvo} onChange={handleChange} error={errors.valorAlvo} />
          <Input label="Já guardado (R$)" name="valorAtual" type="number" step="0.01" min="0" inputMode="decimal" value={values.valorAtual} onChange={handleChange} error={errors.valorAtual} />
        </div>
        <Input label="Prazo" name="prazo" type="date" min={toISODate()} value={values.prazo} onChange={handleChange} error={errors.prazo} />
      </FormCard>
    </>
  )
}
