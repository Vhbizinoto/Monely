import { useSearchParams } from 'react-router-dom'
import { ClockCounterClockwise } from '@phosphor-icons/react'
import PageHeader from '../../components/layout/PageHeader'
import OrcamentoCard from '../../components/orcamentos/OrcamentoCard'
import Button from '../../components/ui/Button'
import { ErrorState, Loading } from '../../components/ui/Feedback'
import FormCard from '../../components/ui/FormCard'
import { Input, Select } from '../../components/ui/FormField'
import { InfoCard, InfoRow, PreviewSection } from '../../components/ui/PreviewPanel'
import { CATEGORIAS_DESPESA } from '../../constants/categorias'
import useEntityForm from '../../hooks/useEntityForm'
import useFetch from '../../hooks/useFetch'
import orcamentoService from '../../services/orcamentoService'
import transacaoService from '../../services/transacaoService'
import { gastoNaCategoria } from '../../utils/finance'
import { currentMonth, formatCurrency, formatMonth, shiftMonth } from '../../utils/format'

const listarDespesas = () => transacaoService.listar({ tipo: 'DESPESA' })

const MESES_HISTORICO = 3

const validar = (v) => ({
  categoria: !v.categoria && 'Escolha a categoria.',
  limite: !(Number(v.limite) > 0) && 'Informe um limite maior que zero.',
  mes: !v.mes && 'Informe o mês.',
})

export default function OrcamentoForm() {
  const [params] = useSearchParams()
  const mesInicial = params.get('mes') || currentMonth()
  const despesas = useFetch(listarDespesas, [])

  const { values, errors, handleChange, setField, editando, carregando, erroCarregamento, enviando, handleSubmit } = useEntityForm({
    service: orcamentoService,
    nome: 'Orçamento',
    masculino: true,
    voltarPara: (salvo) => `/orcamentos?mes=${salvo.mes}`,
    valoresIniciais: { categoria: '', limite: '', mes: mesInicial },
    validar,
    paraFormulario: (o) => ({ ...o, limite: String(o.limite) }),
    paraApi: (v) => ({ ...v, limite: Number(v.limite) }),
  })

  const header = (
    <PageHeader titulo={editando ? 'Editar orçamento' : 'Novo orçamento'} subtitulo="Quanto você quer gastar, no máximo, nesta categoria?" />
  )

  if (carregando || despesas.loading) return <>{header}<Loading /></>
  if (erroCarregamento || despesas.error) return <>{header}<ErrorState mensagem={erroCarregamento || despesas.error} /></>

  const mes = values.mes || mesInicial
  const gastoNoMes = values.categoria ? gastoNaCategoria(despesas.data, values.categoria, mes) : 0

  // Gastos da categoria nos meses anteriores, para ajudar a escolher o limite
  const historico = Array.from({ length: MESES_HISTORICO }, (_, i) => {
    const mesAnterior = shiftMonth(mes, -(i + 1))
    return { mes: mesAnterior, total: values.categoria ? gastoNaCategoria(despesas.data, values.categoria, mesAnterior) : 0 }
  })
  const media = historico.reduce((s, h) => s + h.total, 0) / MESES_HISTORICO
  const sugestao = Math.ceil(media / 10) * 10

  const aside = (
    <>
      <PreviewSection titulo="Pré-visualização">
        <OrcamentoCard categoria={values.categoria} limite={Number(values.limite) || 0} gasto={gastoNoMes} hover={false} />
        <p className="text-xs text-text-muted mt-2">Gasto considerado: {formatMonth(mes)}.</p>
      </PreviewSection>

      <PreviewSection titulo="Histórico da categoria" icon={ClockCounterClockwise}>
        <InfoCard>
          {!values.categoria ? (
            <p className="text-sm text-text-muted">Escolha a categoria para ver quanto você costuma gastar nela.</p>
          ) : (
            <>
              {historico.map((h) => (
                <InfoRow key={h.mes} rotulo={formatMonth(h.mes)} valor={formatCurrency(h.total)} />
              ))}
              <div className="border-t border-gray-800 my-2" />
              <InfoRow rotulo="Média mensal" valor={formatCurrency(media)} destaque />
              {sugestao > 0 && Number(values.limite) !== sugestao && (
                <Button type="button" variant="secondary" size="sm" className="w-full mt-3" onClick={() => setField('limite', String(sugestao))}>
                  Usar {formatCurrency(sugestao)} como limite
                </Button>
              )}
            </>
          )}
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
        voltarPara={`/orcamentos?mes=${mesInicial}`}
        textoSalvar={editando ? 'Salvar alterações' : 'Criar orçamento'}
        aside={aside}
      >
        <Select
          label="Categoria"
          name="categoria"
          placeholder="Selecione"
          options={CATEGORIAS_DESPESA.map((c) => ({ value: c.nome, label: c.nome }))}
          value={values.categoria}
          onChange={handleChange}
          error={errors.categoria}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input label="Limite (R$)" name="limite" type="number" step="0.01" min="0" inputMode="decimal" placeholder="0,00" value={values.limite} onChange={handleChange} error={errors.limite} />
          <Input label="Mês" name="mes" type="month" value={values.mes} onChange={handleChange} error={errors.mes} />
        </div>
      </FormCard>
    </>
  )
}
