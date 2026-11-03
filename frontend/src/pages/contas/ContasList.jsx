import { Plus, Wallet } from '@phosphor-icons/react'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { EmptyState, ErrorState, Loading } from '../../components/ui/Feedback'
import RowActions from '../../components/ui/RowActions'
import { getTipoConta } from '../../constants/contas'
import useFetch from '../../hooks/useFetch'
import useRemocao from '../../hooks/useRemocao'
import contaService from '../../services/contaService'
import transacaoService from '../../services/transacaoService'
import { saldoDaConta } from '../../utils/finance'
import { formatCurrency } from '../../utils/format'

const carregar = async () => {
  const [contas, transacoes] = await Promise.all([contaService.listar(), transacaoService.listar()])
  return { contas, transacoes }
}

export default function ContasList() {
  const { data, setData, loading, error, reload } = useFetch(carregar)
  const { pedirRemocao, alvo, dialogProps } = useRemocao({
    remover: contaService.remover,
    mensagemSucesso: 'Conta removida.',
    onRemovido: (removida) =>
      setData((atual) => ({
        contas: atual.contas.filter((c) => c.id !== removida.id),
        transacoes: atual.transacoes.filter((t) => t.contaId !== removida.id),
      })),
  })

  const header = (
    <PageHeader
      titulo="Contas"
      subtitulo="Onde o seu dinheiro está guardado"
      acoes={<Button to="/contas/nova" icon={Plus}>Nova conta</Button>}
    />
  )

  if (loading) return <>{header}<Loading /></>
  if (error) return <>{header}<ErrorState mensagem={error} onRetry={reload} /></>

  const { contas, transacoes } = data
  const saldos = Object.fromEntries(contas.map((c) => [c.id, saldoDaConta(c, transacoes)]))
  const total = Object.values(saldos).reduce((a, b) => a + b, 0)
  const qtdTransacoesDoAlvo = alvo ? transacoes.filter((t) => t.contaId === alvo.id).length : 0

  return (
    <>
      {header}

      {contas.length === 0 ? (
        <EmptyState
          icon={Wallet}
          titulo="Nenhuma conta cadastrada"
          descricao="Cadastre sua conta corrente, poupança ou carteira para começar a registrar transações."
          acao={<Button to="/contas/nova" icon={Plus}>Cadastrar conta</Button>}
        />
      ) : (
        <>
          <Card hover={false} className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-text-muted">Saldo somado de {contas.length} {contas.length === 1 ? 'conta' : 'contas'}</p>
            <p className={`text-3xl font-bold ${total >= 0 ? 'text-white' : 'text-danger'}`}>{formatCurrency(total)}</p>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {contas.map((conta) => {
              const tipo = getTipoConta(conta.tipo)
              const Icone = tipo.icone
              return (
                <Card key={conta.id}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-primary-bg text-primary flex items-center justify-center">
                        <Icone size={22} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{conta.nome}</h3>
                        <p className="text-xs text-text-muted">
                          {tipo.nome}
                          {conta.instituicao && ` · ${conta.instituicao}`}
                        </p>
                      </div>
                    </div>
                    <RowActions editarPara={`/contas/${conta.id}/editar`} onRemover={() => pedirRemocao(conta)} nome={conta.nome} />
                  </div>
                  <p className="text-sm text-text-muted mb-1">Saldo atual</p>
                  <p className={`text-2xl font-bold ${saldos[conta.id] >= 0 ? 'text-white' : 'text-danger'}`}>
                    {formatCurrency(saldos[conta.id])}
                  </p>
                  <p className="text-xs text-text-muted mt-2">Saldo inicial: {formatCurrency(conta.saldoInicial)}</p>
                </Card>
              )
            })}
          </div>
        </>
      )}

      <ConfirmDialog
        {...dialogProps}
        titulo="Remover conta?"
        mensagem={
          alvo &&
          `A conta "${alvo.nome}" será removida${
            qtdTransacoesDoAlvo ? ` junto com ${qtdTransacoesDoAlvo} ${qtdTransacoesDoAlvo === 1 ? 'transação' : 'transações'}` : ''
          }. Essa ação não pode ser desfeita.`
        }
      />
    </>
  )
}
