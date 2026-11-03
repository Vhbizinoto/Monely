const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatCurrency = (valor) => moeda.format(Number(valor) || 0)

// Datas trafegam como "AAAA-MM-DD"; trabalhar com a string evita erros de fuso horário
export const formatDate = (data) => {
  if (!data) return ''
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

export const toISODate = (date = new Date()) => {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

export const currentMonth = () => toISODate().slice(0, 7)

// Soma (ou subtrai) meses de um "AAAA-MM"
export const shiftMonth = (mes, delta) => {
  const [ano, m] = mes.split('-').map(Number)
  const d = new Date(ano, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export const formatMonth = (mes, options = { month: 'long', year: 'numeric' }) => {
  const [ano, m] = mes.split('-').map(Number)
  const texto = new Date(ano, m - 1, 1).toLocaleDateString('pt-BR', options)
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

// "Hoje", "Ontem" ou a data formatada
export const formatRelativeDate = (data) => {
  const hoje = toISODate()
  const ontem = toISODate(new Date(Date.now() - 86400000))
  if (data === hoje) return 'Hoje'
  if (data === ontem) return 'Ontem'
  return formatDate(data)
}

export const percentChange = (atual, anterior) => {
  if (!anterior) return null
  return ((atual - anterior) / anterior) * 100
}

export const formatPercent = (valor) => `${valor > 0 ? '+' : ''}${valor.toFixed(1).replace('.', ',')}%`
