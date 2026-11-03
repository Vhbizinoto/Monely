import { useEffect } from 'react'
import { ChartPieSlice, ShieldCheck, Target } from '@phosphor-icons/react'

const ANO = new Date().getFullYear()

const DESTAQUES = [
  { icon: ChartPieSlice, texto: 'Veja para onde vai cada real do seu mês' },
  { icon: Target, texto: 'Crie metas e acompanhe o progresso' },
  { icon: ShieldCheck, texto: 'Seus dados protegidos e só seus' },
]

// Moldura das telas de login e cadastro
export default function AuthLayout({ titulo, subtitulo, children }) {
  useEffect(() => {
    document.title = `${titulo} | Monely`
  }, [titulo])

  return (
    <div className="min-h-screen flex">
      <section className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-sidebar border-r border-gray-800 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-chart-purple/10 blur-3xl" />

        <div className="flex items-center gap-3 relative">
          <img src="/images/logo.png" alt="" className="h-12 w-auto" />
          <span className="text-2xl font-bold tracking-wide">Monely</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-4xl font-bold leading-tight mb-6">
            Suas finanças, <span className="text-primary">organizadas</span> de verdade.
          </h2>
          <ul className="flex flex-col gap-4">
            {DESTAQUES.map(({ icon: Icon, texto }) => (
              <li key={texto} className="flex items-center gap-3 text-text-muted">
                <span className="w-9 h-9 rounded-lg bg-primary-bg text-primary flex items-center justify-center">
                  <Icon size={20} />
                </span>
                {texto}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-text-muted relative">© {ANO} Monely · Projeto Fintech FIAP</p>
      </section>

      <section className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <img src="/images/logo.png" alt="" className="h-10 w-auto" />
            <span className="text-2xl font-bold tracking-wide">Monely</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{titulo}</h1>
          <p className="text-text-muted mb-8">{subtitulo}</p>
          {children}
        </div>
      </section>
    </div>
  )
}
