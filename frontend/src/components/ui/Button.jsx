import { Link } from 'react-router-dom'
import { CircleNotch } from '@phosphor-icons/react'

const VARIANTES = {
  primary:
    'bg-gradient-to-r from-primary to-emerald-400 hover:from-emerald-400 hover:to-primary text-black font-semibold shadow-md',
  secondary: 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700',
  danger: 'bg-danger hover:bg-red-500 text-white font-semibold',
  ghost: 'text-text-muted hover:text-white hover:bg-gray-800/50',
}

const TAMANHOS = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
}

// Botão padrão. Com a prop "to" vira um link do React Router.
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  to,
  className = '',
  disabled,
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed ${VARIANTES[variant]} ${TAMANHOS[size]} ${className}`

  const conteudo = (
    <>
      {loading ? <CircleNotch size={18} className="animate-spin" /> : Icon && <Icon size={18} />}
      {children}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {conteudo}
      </Link>
    )
  }

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {conteudo}
    </button>
  )
}
