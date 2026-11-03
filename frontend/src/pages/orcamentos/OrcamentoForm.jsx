import { useSearchParams } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import { ErrorState, Loading } from '../../components/ui/Feedback'
import FormCard from '../../components/ui/FormCard'
import { Input, Select } from '../../components/ui/FormField'
import { CATEGORIAS_DESPESA } from '../../constants/categorias'
import useEntityForm from '../../hooks/useEntityForm'
import orcamentoService from '../../services/orcamentoService'
import { currentMonth } from '../../utils/format'

const validar = (v) => ({
  categoria: !v.categoria && 'Escolha a categoria.',
  limite: !(Number(v.limite) > 0) && 'Informe um limite maior que zero.',
  mes: !v.mes && 'Informe o mês.',
})

export default function OrcamentoForm() {
  const [params] = useSearchParams()
  const mesInicial = params.get('mes') || currentMonth()

  const { values, errors, handleChange, editando, carregando, erroCarregamento, enviando, handleSubmit } = useEntityForm({
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

  if (carregando) return <>{header}<Loading /></>
  if (erroCarregamento) return <>{header}<ErrorState mensagem={erroCarregamento} /></>

  return (
    <>
      {header}
      <FormCard onSubmit={handleSubmit} enviando={enviando} voltarPara={`/orcamentos?mes=${mesInicial}`} textoSalvar={editando ? 'Salvar alterações' : 'Criar orçamento'}>
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
