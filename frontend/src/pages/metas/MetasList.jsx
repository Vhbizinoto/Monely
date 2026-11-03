import { Plus, Target } from '@phosphor-icons/react'
import PageHeader from '../../components/layout/PageHeader'
import MetaCard from '../../components/metas/MetaCard'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { EmptyState, ErrorState, Loading } from '../../components/ui/Feedback'
import RowActions from '../../components/ui/RowActions'
import useFetch from '../../hooks/useFetch'
import useRemocao from '../../hooks/useRemocao'
import metaService from '../../services/metaService'

const listarMetas = () => metaService.listar({ _sort: 'prazo', _order: 'asc' })

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
            <MetaCard
              key={meta.id}
              meta={meta}
              onAtualizada={substituir}
              acoes={<RowActions editarPara={`/metas/${meta.id}/editar`} onRemover={() => pedirRemocao(meta)} nome={meta.nome} />}
            />
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
