import { useParams } from 'react-router-dom'
import { Calculator } from '@phosphor-icons/react'
import ContaCard from '../../components/contas/ContaCard'
import PageHeader from '../../components/layout/PageHeader'
import { ErrorState, Loading } from '../../components/ui/Feedback'
import FormCard from '../../components/ui/FormCard'
import { Input, Select } from '../../components/ui/FormField'
import { InfoCard, InfoRow, PreviewSection } from '../../components/ui/PreviewPanel'
import { TIPOS_CONTA } from '../../constants/contas'
import useEntityForm from '../../hooks/useEntityForm'
import useFetch from '../../hooks/useFetch'
import contaService from '../../services/contaService'
import transacaoService from '../../services/transacaoService'
import { somaPorTipo } from '../../utils/finance'
import { formatCurrency } from '../../utils/format'

const listarTransacoes = () => transacaoService.listar()

const validar = (v) => ({
  nome: !v.nome.trim() && 'Dê um nome para a conta.',
  tipo: !v.tipo && 'Escolha o tipo.',
  saldoInicial: (v.saldoInicial === '' || Number.isNaN(Number(v.saldoInicial))) && 'Informe o saldo inicial (pode ser 0).',
})

export default function ContaForm() {
  const { id } = useParams()
  const transacoes = useFetch(listarTransacoes, [])
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

  if (carregando || transacoes.loading) return <>{header}<Loading /></>
  if (erroCarregamento || transacoes.error) return <>{header}<ErrorState mensagem={erroCarregamento || transacoes.error} /></>

  // O saldo é sempre calculado: saldo inicial + entradas - saídas da conta
  const daConta = editando ? transacoes.data.filter((t) => String(t.contaId) === id) : []
  const entradas = somaPorTipo(daConta, 'RECEITA')
  const saidas = somaPorTipo(daConta, 'DESPESA')
  const saldoInicial = Number(values.saldoInicial) || 0
  const saldo = saldoInicial + entradas - saidas

  const aside = (
    <>
      <PreviewSection titulo="Pré-visualização">
        <ContaCard conta={{ ...values, saldoInicial }} saldo={saldo} hover={false} />
      </PreviewSection>

      <PreviewSection titulo="Como o saldo é calculado" icon={Calculator}>
        <InfoCard>
          <InfoRow rotulo="Saldo inicial" valor={formatCurrency(saldoInicial)} />
          <InfoRow rotulo={`Entradas (${daConta.filter((t) => t.tipo === 'RECEITA').length})`} valor={`+${formatCurrency(entradas)}`} cor="text-primary" />
          <InfoRow rotulo={`Saídas (${daConta.filter((t) => t.tipo === 'DESPESA').length})`} valor={`-${formatCurrency(saidas)}`} cor="text-danger" />
          <div className="border-t border-gray-800 my-2" />
          <InfoRow rotulo="Saldo atual" valor={formatCurrency(saldo)} destaque cor={saldo < 0 ? 'text-danger' : 'text-white'} />
          {!editando && (
            <p className="text-xs text-text-muted mt-3 leading-relaxed">
              As transações que você registrar nesta conta vão atualizar o saldo automaticamente.
            </p>
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
        voltarPara="/contas"
        textoSalvar={editando ? 'Salvar alterações' : 'Cadastrar conta'}
        aside={aside}
      >
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
