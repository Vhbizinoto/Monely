import PageHeader from '../../components/layout/PageHeader'
import { ErrorState, Loading } from '../../components/ui/Feedback'
import FormCard from '../../components/ui/FormCard'
import { Input, Select } from '../../components/ui/FormField'
import { TIPOS_CONTA } from '../../constants/contas'
import useEntityForm from '../../hooks/useEntityForm'
import contaService from '../../services/contaService'

const validar = (v) => ({
  nome: !v.nome.trim() && 'Dê um nome para a conta.',
  tipo: !v.tipo && 'Escolha o tipo.',
  saldoInicial: (v.saldoInicial === '' || Number.isNaN(Number(v.saldoInicial))) && 'Informe o saldo inicial (pode ser 0).',
})

export default function ContaForm() {
  const { values, errors, handleChange, editando, carregando, erroCarregamento, enviando, handleSubmit } = useEntityForm({
    service: contaService,
    nome: 'Conta',
    voltarPara: '/contas',
    valoresIniciais: { nome: '', tipo: 'CORRENTE', instituicao: '', saldoInicial: '0' },
    validar,
    paraFormulario: (c) => ({ ...c, saldoInicial: String(c.saldoInicial) }),
    paraApi: (v) => ({ ...v, nome: v.nome.trim(), instituicao: v.instituicao.trim(), saldoInicial: Number(v.saldoInicial) }),
  })

  const header = (
    <PageHeader titulo={editando ? 'Editar conta' : 'Nova conta'} subtitulo="Conta bancária, poupança, carteira ou investimento" />
  )

  if (carregando) return <>{header}<Loading /></>
  if (erroCarregamento) return <>{header}<ErrorState mensagem={erroCarregamento} /></>

  return (
    <>
      {header}
      <FormCard onSubmit={handleSubmit} enviando={enviando} voltarPara="/contas" textoSalvar={editando ? 'Salvar alterações' : 'Cadastrar conta'}>
        <Input label="Nome" name="nome" placeholder="Ex.: Conta Corrente" value={values.nome} onChange={handleChange} error={errors.nome} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Select
            label="Tipo"
            name="tipo"
            options={TIPOS_CONTA.map((t) => ({ value: t.valor, label: t.nome }))}
            value={values.tipo}
            onChange={handleChange}
            error={errors.tipo}
          />
          <Input label="Instituição (opcional)" name="instituicao" placeholder="Ex.: Nubank" value={values.instituicao} onChange={handleChange} />
        </div>
        <Input
          label="Saldo inicial (R$)"
          name="saldoInicial"
          type="number"
          step="0.01"
          inputMode="decimal"
          value={values.saldoInicial}
          onChange={handleChange}
          error={errors.saldoInicial}
          hint="Quanto havia na conta antes de você começar a registrar transações no Monely."
        />
      </FormCard>
    </>
  )
}
