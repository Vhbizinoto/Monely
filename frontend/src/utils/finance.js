import { currentMonth } from './format'

// Cálculos derivados das transações, usados no dashboard, contas, orçamentos e relatórios

export const somaPorTipo = (transacoes, tipo) =>
  transacoes.filter((t) => t.tipo === tipo).reduce((total, t) => total + Number(t.valor), 0)

export const doMes = (transacoes, mes) => transacoes.filter((t) => t.data?.startsWith(mes))

export const saldoDaConta = (conta, transacoes) => {
  const daConta = transacoes.filter((t) => t.contaId === conta.id)
  return Number(conta.saldoInicial) + somaPorTipo(daConta, 'RECEITA') - somaPorTipo(daConta, 'DESPESA')
}

// Efeito de uma transação no saldo: receita soma, despesa subtrai
export const efeitoNoSaldo = (transacao) => (transacao.tipo === 'RECEITA' ? 1 : -1) * (Number(transacao.valor) || 0)

// [{ categoria, total }] ordenado do maior para o menor
export const despesasPorCategoria = (transacoes) => {
  const totais = {}
  transacoes
    .filter((t) => t.tipo === 'DESPESA')
    .forEach((t) => {
      totais[t.categoria] = (totais[t.categoria] || 0) + Number(t.valor)
    })
  return Object.entries(totais)
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total)
}

// Total gasto numa categoria em um mês ("AAAA-MM")
export const gastoNaCategoria = (transacoes, categoria, mes) =>
  doMes(transacoes, mes)
    .filter((t) => t.tipo === 'DESPESA' && t.categoria === categoria)
    .reduce((total, t) => total + Number(t.valor), 0)

// Verde até 75% do limite, laranja até 100%, vermelho acima
export const corDoUso = (percentual) => (percentual > 100 ? '#FF4D4D' : percentual > 75 ? '#F59E0B' : '#00E08F')

// Quantos meses faltam até o prazo (mínimo 1)
export const mesesAte = (prazo) => {
  const [anoAtual, mesAtual] = currentMonth().split('-').map(Number)
  const [ano, mes] = prazo.split('-').map(Number)
  return Math.max((ano - anoAtual) * 12 + (mes - mesAtual), 1)
}
