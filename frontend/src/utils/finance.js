// Cálculos derivados das transações, usados no dashboard, contas, orçamentos e relatórios

export const somaPorTipo = (transacoes, tipo) =>
  transacoes.filter((t) => t.tipo === tipo).reduce((total, t) => total + Number(t.valor), 0)

export const doMes = (transacoes, mes) => transacoes.filter((t) => t.data?.startsWith(mes))

export const saldoDaConta = (conta, transacoes) => {
  const daConta = transacoes.filter((t) => t.contaId === conta.id)
  return Number(conta.saldoInicial) + somaPorTipo(daConta, 'RECEITA') - somaPorTipo(daConta, 'DESPESA')
}

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
