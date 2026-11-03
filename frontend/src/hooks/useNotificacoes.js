import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import metaService from '../services/metaService'
import orcamentoService from '../services/orcamentoService'
import transacaoService from '../services/transacaoService'
import { doMes } from '../utils/finance'
import { currentMonth, formatCurrency, formatDate, toISODate } from '../utils/format'

const DIAS_ALERTA_PRAZO = 30

const diasAte = (data) => Math.ceil((new Date(`${data}T00:00:00`) - new Date(`${toISODate()}T00:00:00`)) / 86400000)

// Monta os alertas a partir dos dados do usuário
const gerarNotificacoes = ({ orcamentos, despesas, metas }) => {
  const mes = currentMonth()
  const lista = []

  orcamentos
    .filter((o) => o.mes === mes)
    .forEach((o) => {
      const gasto = doMes(despesas, mes)
        .filter((t) => t.tipo === 'DESPESA' && t.categoria === o.categoria)
        .reduce((s, t) => s + Number(t.valor), 0)
      const percentual = (gasto / o.limite) * 100
      if (percentual > 100) {
        lista.push({
          id: `orcamento-estourado-${o.id}-${mes}`,
          tipo: 'perigo',
          titulo: `Orçamento de ${o.categoria} estourado`,
          descricao: `Você gastou ${formatCurrency(gasto)} de ${formatCurrency(o.limite)} (${Math.round(percentual)}%).`,
          link: '/orcamentos',
        })
      } else if (percentual >= 80) {
        lista.push({
          id: `orcamento-alerta-${o.id}-${mes}`,
          tipo: 'alerta',
          titulo: `Orçamento de ${o.categoria} quase no limite`,
          descricao: `Restam ${formatCurrency(o.limite - gasto)} (${Math.round(percentual)}% usado).`,
          link: '/orcamentos',
        })
      }
    })

  metas.forEach((m) => {
    const dias = diasAte(m.prazo)
    if (m.valorAtual >= m.valorAlvo) {
      lista.push({
        id: `meta-concluida-${m.id}`,
        tipo: 'sucesso',
        titulo: `Meta "${m.nome}" alcançada!`,
        descricao: `Você juntou ${formatCurrency(m.valorAtual)}. Parabéns!`,
        link: '/metas',
      })
    } else if (dias < 0) {
      lista.push({
        id: `meta-vencida-${m.id}-${m.prazo}`,
        tipo: 'alerta',
        titulo: `Prazo da meta "${m.nome}" passou`,
        descricao: `Venceu em ${formatDate(m.prazo)}. Que tal ajustar o prazo?`,
        link: `/metas/${m.id}/editar`,
      })
    } else if (dias <= DIAS_ALERTA_PRAZO) {
      lista.push({
        id: `meta-prazo-${m.id}-${m.prazo}`,
        tipo: 'info',
        titulo: `Meta "${m.nome}" vence em ${dias} ${dias === 1 ? 'dia' : 'dias'}`,
        descricao: `Faltam ${formatCurrency(m.valorAlvo - m.valorAtual)} para chegar lá.`,
        link: '/metas',
      })
    }
  })

  const ordem = { perigo: 0, alerta: 1, info: 2, sucesso: 3 }
  return lista.sort((a, b) => ordem[a.tipo] - ordem[b.tipo])
}

const chaveLidas = (usuarioId) => `monely:notificacoes-lidas:${usuarioId}`

const lerLidas = (usuarioId) => {
  try {
    return JSON.parse(localStorage.getItem(chaveLidas(usuarioId))) || []
  } catch {
    return []
  }
}

export default function useNotificacoes() {
  const usuarioId = useAuth().usuario?.id
  const [notificacoes, setNotificacoes] = useState([])
  const [lidas, setLidas] = useState(() => lerLidas(usuarioId))
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true
    Promise.all([
      orcamentoService.listar(),
      transacaoService.listar({ tipo: 'DESPESA' }),
      metaService.listar(),
    ])
      .then(([orcamentos, despesas, metas]) => ativo && setNotificacoes(gerarNotificacoes({ orcamentos, despesas, metas })))
      .catch(() => ativo && setNotificacoes([]))
      .finally(() => ativo && setCarregando(false))
    return () => {
      ativo = false
    }
  }, [])

  const salvarLidas = useCallback(
    (ids) => {
      setLidas(ids)
      try {
        localStorage.setItem(chaveLidas(usuarioId), JSON.stringify(ids))
      } catch {
        // sem localStorage, as notificações só não ficam marcadas
      }
    },
    [usuarioId],
  )

  const marcarComoLida = (id) => !lidas.includes(id) && salvarLidas([...lidas, id])
  const marcarTodasComoLidas = () => salvarLidas([...new Set([...lidas, ...notificacoes.map((n) => n.id)])])

  const comStatus = notificacoes.map((n) => ({ ...n, lida: lidas.includes(n.id) }))

  return {
    notificacoes: comStatus,
    naoLidas: comStatus.filter((n) => !n.lida).length,
    carregando,
    marcarComoLida,
    marcarTodasComoLidas,
  }
}
