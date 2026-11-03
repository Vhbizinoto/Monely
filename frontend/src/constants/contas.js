import { Bank, ChartLineUp, CreditCard, PiggyBank, Wallet } from '@phosphor-icons/react'

export const TIPOS_CONTA = [
  { valor: 'CORRENTE', nome: 'Conta corrente', icone: Bank },
  { valor: 'POUPANCA', nome: 'Poupança', icone: PiggyBank },
  { valor: 'CARTEIRA', nome: 'Carteira', icone: Wallet },
  { valor: 'INVESTIMENTO', nome: 'Investimentos', icone: ChartLineUp },
  { valor: 'CARTAO', nome: 'Cartão pré-pago', icone: CreditCard },
]

export const getTipoConta = (valor) => TIPOS_CONTA.find((t) => t.valor === valor) || TIPOS_CONTA[0]
