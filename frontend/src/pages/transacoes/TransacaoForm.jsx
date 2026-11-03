import { useParams } from 'react-router-dom'
import { ArrowDown, ArrowUp, ChartBar, Wallet } from '@phosphor-icons/react'
import PageHeader from '../../components/layout/PageHeader'
import TransacaoItem from '../../components/transacoes/TransacaoItem'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { EmptyState, ErrorState, Loading } from '../../components/ui/Feedback'
import FormCard from '../../components/ui/FormCard'
import { Input, Select } from '../../components/ui/FormField'
import { InfoCard, InfoRow, PreviewSection } from '../../components/ui/PreviewPanel'
import ProgressBar from '../../components/ui/ProgressBar'
import { categoriasPorTipo } from '../../constants/categorias'
import useEntityForm from '../../hooks/useEntityForm'
import useFetch from '../../hooks/useFetch'
import contaService from '../../services/contaService'
import orcamentoService from '../../services/orcamentoService'
import transacaoService from '../../services/transacaoService'
import { corDoUso, efeitoNoSaldo, gastoNaCategoria, saldoDaConta } from '../../utils/finance'
import { formatCurrency, formatMonth, toISODate } from '../../utils/format'

const carregarContexto = async () => {
  const [contas, transacoes, orcamentos] = await Promise.all([
    contaService.listar(),
    transacaoService.listar(),
    orcamentoService.listar(),
  ])
  return { contas, transacoes, orcamentos }
}

const validar = (v) => ({
  descricao: !v.descricao.trim() && 'Informe uma descrição.',
  valor: !(Number(v.valor) > 0) && 'Informe um valor maior que zero.',
  categoria: !v.categoria && 'Escolha uma categoria.',
  contaId: !v.contaId && 'Escolha a conta.',
  data: !v.data && 'Informe a data.',
})

// Página única para inserir (/transacoes/nova) e atualizar (/transacoes/:id/editar)
export default function TransacaoForm() {
  const { id } = useParams()
  const contexto = useFetch(carregarContexto)
  const { values, errors, handleChange, setValues, editando, carregando, erroCarregamento, enviando, handleSubmit } =
    useEntityForm({
      service: transacaoService,
      nome: 'Transação',
      voltarPara: '/transacoes',
      valoresIniciais: { tipo: 'DESPESA', descricao: '', valor: '', categoria: '', contaId: '', data: toISODate() },
      validar,
      paraFormulario: (t) => ({ ...t, valor: String(t.valor), contaId: String(t.contaId) }),
      paraApi: (v) => ({ ...v, descricao: v.descricao.trim(), valor: Number(v.valor), contaId: Number(v.contaId) }),
    })

  const titulo = editando ? 'Editar transação' : 'Nova transação'
  const header = <PageHeader titulo={titulo} subtitulo="Registre uma entrada ou saída de dinheiro" />

  if (carregando || contexto.loading) return <>{header}<Loading /></>
  if (erroCarregamento || contexto.error) return <>{header}<ErrorState mensagem={erroCarregamento || contexto.error} /></>

  const { contas, transacoes, orcamentos } = contexto.data

  if (contas.length === 0) {
    return (
      <>
        {header}
        <EmptyState
          icon={Wallet}
          titulo="Cadastre uma conta primeiro"
          descricao="Toda transação pertence a uma conta (corrente, poupança, carteira...)."
          acao={<Button to="/contas/nova">Cadastrar conta</Button>}
        />
      </>
    )
  }

  // Trocar o tipo limpa a categoria, porque as listas são diferentes
  const trocarTipo = (tipo) => setValues((v) => ({ ...v, tipo, categoria: v.tipo === tipo ? v.categoria : '' }))

  // Na edição, desconsidera a versão salva desta transação nos cálculos de contexto
  const outras = editando ? transacoes.filter((t) => String(t.id) !== id) : transacoes

  const aside = (
    <>
      <PreviewSection titulo="Pré-visualização">
        <Card hover={false}>
          <TransacaoItem
            transacao={{
              ...values,
              descricao: values.descricao.trim() || 'Descrição',
              categoria: values.categoria || 'Outros',
              valor: Number(values.valor) || 0,
            }}
            conta={contas.find((c) => String(c.id) === values.contaId)}
          />
        </Card>
      </PreviewSection>

      <ImpactoNaConta conta={contas.find((c) => String(c.id) === values.contaId)} transacoes={transacoes} outras={outras} valores={values} />

      {values.tipo === 'DESPESA' && values.categoria && values.data && (
        <ImpactoNoOrcamento orcamentos={orcamentos} outras={outras} valores={values} />
      )}
    </>
  )

  return (
    <>
      {header}
      <FormCard
        onSubmit={handleSubmit}
        enviando={enviando}
        voltarPara="/transacoes"
        textoSalvar={editando ? 'Salvar alterações' : 'Adicionar transação'}
        aside={aside}
      >
        <fieldset>
          <legend className="text-sm font-medium text-gray-300 mb-1.5">Tipo</legend>
          <div className="grid grid-cols-2 gap-3">
            <TipoBotao ativo={values.tipo === 'DESPESA'} onClick={() => trocarTipo('DESPESA')} icon={ArrowUp} cor="danger">
              Saída
            </TipoBotao>
            <TipoBotao ativo={values.tipo === 'RECEITA'} onClick={() => trocarTipo('RECEITA')} icon={ArrowDown} cor="primary">
              Entrada
            </TipoBotao>
          </div>
        </fieldset>

        <Input label="Descrição" name="descricao" placeholder="Ex.: Supermercado" value={values.descricao} onChange={handleChange} error={errors.descricao} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input label="Valor (R$)" name="valor" type="number" step="0.01" min="0" inputMode="decimal" placeholder="0,00" value={values.valor} onChange={handleChange} error={errors.valor} />
          <Input label="Data" name="data" type="date" value={values.data} onChange={handleChange} error={errors.data} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Select
            label="Categoria"
            name="categoria"
            placeholder="Selecione"
            options={categoriasPorTipo(values.tipo).map((c) => ({ value: c.nome, label: c.nome }))}
            value={values.categoria}
            onChange={handleChange}
            error={errors.categoria}
          />
          <Select
            label="Conta"
            name="contaId"
            placeholder="Selecione"
            options={contas.map((c) => ({ value: String(c.id), label: c.nome }))}
            value={values.contaId}
            onChange={handleChange}
            error={errors.contaId}
          />
        </div>
      </FormCard>
    </>
  )
}

// Saldo da conta escolhida antes e depois de salvar
function ImpactoNaConta({ conta, transacoes, outras, valores }) {
  return (
    <PreviewSection titulo="Impacto na conta" icon={Wallet}>
      <InfoCard>
        {conta ? (
          <SaldoAntesDepois conta={conta} transacoes={transacoes} outras={outras} valores={valores} />
        ) : (
          <p className="text-sm text-text-muted">Escolha a conta para ver como o saldo vai ficar.</p>
        )}
      </InfoCard>
    </PreviewSection>
  )
}

function SaldoAntesDepois({ conta, transacoes, outras, valores }) {
  const saldoAtual = saldoDaConta(conta, transacoes)
  const saldoDepois = saldoDaConta(conta, outras) + efeitoNoSaldo(valores)
  const variacao = saldoDepois - saldoAtual
  const sinal = variacao > 0 ? '+' : variacao < 0 ? '-' : ''
  const corVariacao = variacao > 0 ? 'text-primary' : variacao < 0 ? 'text-danger' : 'text-text-muted'

  return (
    <>
      <p className="text-sm font-semibold text-white mb-2">{conta.nome}</p>
      <InfoRow rotulo="Saldo atual" valor={formatCurrency(saldoAtual)} />
      <InfoRow rotulo="Variação" valor={`${sinal}${formatCurrency(Math.abs(variacao))}`} cor={corVariacao} />
      <div className="border-t border-gray-800 my-2" />
      <InfoRow rotulo="Saldo após salvar" valor={formatCurrency(saldoDepois)} destaque cor={saldoDepois < 0 ? 'text-danger' : 'text-white'} />
      {saldoDepois < 0 && <p className="text-xs text-danger mt-2">A conta vai ficar negativa.</p>}
    </>
  )
}

// Como a despesa afeta o orçamento da categoria no mês (se existir um)
function ImpactoNoOrcamento({ orcamentos, outras, valores }) {
  const mes = valores.data.slice(0, 7)
  const orcamento = orcamentos.find((o) => o.mes === mes && o.categoria === valores.categoria)

  return (
    <PreviewSection titulo={`Orçamento de ${formatMonth(mes, { month: 'long' }).toLowerCase()}`} icon={ChartBar}>
      <InfoCard>
        {orcamento ? (
          <UsoDoOrcamento orcamento={orcamento} outras={outras} valores={valores} mes={mes} />
        ) : (
          <p className="text-sm text-text-muted">
            Você não tem orçamento para <span className="text-white">{valores.categoria}</span> neste mês.
          </p>
        )}
      </InfoCard>
    </PreviewSection>
  )
}

function UsoDoOrcamento({ orcamento, outras, valores, mes }) {
  const gastoDepois = gastoNaCategoria(outras, valores.categoria, mes) + (Number(valores.valor) || 0)
  const percentual = (gastoDepois / orcamento.limite) * 100
  const cor = corDoUso(percentual)

  return (
    <>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-white font-medium">{valores.categoria}</span>
        <span className="font-semibold" style={{ color: cor }}>
          {Math.round(percentual)}%
        </span>
      </div>
      <ProgressBar valor={gastoDepois} max={orcamento.limite} cor={cor} label={`Orçamento de ${valores.categoria}`} />
      <p className="text-xs text-text-muted mt-2">
        {formatCurrency(gastoDepois)} de {formatCurrency(orcamento.limite)} após salvar
        {percentual > 100 && <span className="text-danger"> · estoura o limite</span>}
      </p>
    </>
  )
}

function TipoBotao({ ativo, onClick, icon: Icon, cor, children }) {
  const estilos = {
    primary: 'border-primary bg-primary-bg text-primary',
    danger: 'border-danger bg-danger-bg text-danger',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={`flex items-center justify-center gap-2 rounded-lg border py-3 font-medium transition-colors ${
        ativo ? estilos[cor] : 'border-gray-700 text-text-muted hover:text-white'
      }`}
    >
      <Icon size={18} /> {children}
    </button>
  )
}
