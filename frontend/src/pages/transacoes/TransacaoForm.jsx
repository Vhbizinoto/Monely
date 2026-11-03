import { ArrowDown, ArrowUp, Wallet } from '@phosphor-icons/react'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import { EmptyState, ErrorState, Loading } from '../../components/ui/Feedback'
import FormCard from '../../components/ui/FormCard'
import { Input, Select } from '../../components/ui/FormField'
import { categoriasPorTipo } from '../../constants/categorias'
import useEntityForm from '../../hooks/useEntityForm'
import useFetch from '../../hooks/useFetch'
import contaService from '../../services/contaService'
import transacaoService from '../../services/transacaoService'
import { toISODate } from '../../utils/format'

const listarContas = () => contaService.listar()

const validar = (v) => ({
  descricao: !v.descricao.trim() && 'Informe uma descrição.',
  valor: !(Number(v.valor) > 0) && 'Informe um valor maior que zero.',
  categoria: !v.categoria && 'Escolha uma categoria.',
  contaId: !v.contaId && 'Escolha a conta.',
  data: !v.data && 'Informe a data.',
})

// Página única para inserir (/transacoes/nova) e atualizar (/transacoes/:id/editar)
export default function TransacaoForm() {
  const contas = useFetch(listarContas, [])
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

  if (carregando || contas.loading) return <>{header}<Loading /></>
  if (erroCarregamento || contas.error) return <>{header}<ErrorState mensagem={erroCarregamento || contas.error} /></>

  if (contas.data.length === 0) {
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

  return (
    <>
      {header}
      <FormCard onSubmit={handleSubmit} enviando={enviando} voltarPara="/transacoes" textoSalvar={editando ? 'Salvar alterações' : 'Adicionar transação'}>
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
            options={contas.data.map((c) => ({ value: String(c.id), label: c.nome }))}
            value={values.contaId}
            onChange={handleChange}
            error={errors.contaId}
          />
        </div>
      </FormCard>
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
