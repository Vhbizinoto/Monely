import { Link, NavLink } from 'react-router-dom'
import { ArrowsLeftRight, BookOpen, ChartBar, Gear, House, TrendUp, Wallet } from '@phosphor-icons/react'

const MENU = [
  { to: '/', label: 'Dashboard', icon: House, end: true },
  { to: '/transacoes', label: 'Transações', icon: ArrowsLeftRight },
  { to: '/contas', label: 'Contas', icon: Wallet },
  { to: '/orcamentos', label: 'Orçamento', icon: ChartBar },
  { to: '/metas', label: 'Metas', icon: TrendUp },
  { to: '/relatorios', label: 'Relatórios', icon: BookOpen },
  { to: '/configuracoes', label: 'Configurações', icon: Gear },
]

function MenuItem({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${
          isActive ? 'bg-primary-bg text-primary' : 'text-text-muted hover:text-white hover:bg-gray-800/50'
        }`
      }
    >
      <Icon size={20} />
      {label}
    </NavLink>
  )
}

export default function Sidebar() {
  return (
    <aside className="w-full md:w-64 bg-sidebar/90 backdrop-blur-md flex flex-col justify-between flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-800 z-20">
      <div className="flex flex-col md:h-full">
        <Link to="/" className="p-4 md:p-6 flex items-center gap-3 shrink-0">
          <img src="/images/logo.png" alt="" className="h-9 md:h-11 w-auto" />
          <span className="text-2xl font-bold tracking-wide">Monely</span>
        </Link>

        <nav
          aria-label="Menu principal"
          className="px-4 pb-4 md:pb-0 flex flex-row md:flex-col gap-2 overflow-x-auto scrollbar-hide md:mt-4 shrink-0"
        >
          {MENU.map((item) => (
            <MenuItem key={item.to} {...item} />
          ))}
        </nav>
      </div>

      <div className="hidden md:block p-6 mt-auto">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700 shadow-lg">
          <h4 className="font-semibold text-sm mb-2 text-white">Upgrade para Premium</h4>
          <p className="text-xs text-gray-400 mb-4 leading-relaxed">Tenha acesso a recursos exclusivos.</p>
          <button className="w-full bg-gradient-to-r from-primary to-emerald-400 hover:from-emerald-400 hover:to-primary text-black font-semibold py-2.5 rounded-lg text-sm transition-colors shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900">
            Quero Upgrade
          </button>
        </div>
      </div>
    </aside>
  )
}
