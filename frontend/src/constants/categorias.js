import {
  Briefcase,
  Car,
  ChartLineUp,
  DotsThreeCircle,
  ForkKnife,
  GraduationCap,
  Heartbeat,
  House,
  Money,
  ShoppingBag,
  Ticket,
} from '@phosphor-icons/react'

export const CATEGORIAS_DESPESA = [
  { nome: 'Alimentação', cor: '#FF6B6B', icone: ForkKnife },
  { nome: 'Moradia', cor: '#8B5CF6', icone: House },
  { nome: 'Transporte', cor: '#10B981', icone: Car },
  { nome: 'Saúde', cor: '#F59E0B', icone: Heartbeat },
  { nome: 'Lazer', cor: '#EC4899', icone: Ticket },
  { nome: 'Educação', cor: '#3B82F6', icone: GraduationCap },
  { nome: 'Compras', cor: '#06B6D4', icone: ShoppingBag },
  { nome: 'Outros', cor: '#8A8D93', icone: DotsThreeCircle },
]

export const CATEGORIAS_RECEITA = [
  { nome: 'Salário', cor: '#00E08F', icone: Money },
  { nome: 'Trabalho', cor: '#00E08F', icone: Briefcase },
  { nome: 'Investimentos', cor: '#00E08F', icone: ChartLineUp },
  { nome: 'Outros', cor: '#00E08F', icone: DotsThreeCircle },
]

export const categoriasPorTipo = (tipo) => (tipo === 'RECEITA' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA)

export const getCategoria = (nome, tipo = 'DESPESA') =>
  categoriasPorTipo(tipo).find((c) => c.nome === nome) ||
  CATEGORIAS_DESPESA.find((c) => c.nome === 'Outros')
