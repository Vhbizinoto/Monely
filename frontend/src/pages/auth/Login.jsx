import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Envelope, Eye, EyeSlash, Lock, WarningCircle } from '@phosphor-icons/react'
import AuthLayout from './AuthLayout'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/FormField'
import { useAuth } from '../../contexts/AuthContext'
import useForm from '../../hooks/useForm'
import { getErrorMessage } from '../../services/api'

const validar = ({ email, senha }) => ({
  email: !email ? 'Informe seu e-mail.' : !/^\S+@\S+\.\S+$/.test(email) && 'E-mail inválido.',
  senha: !senha && 'Informe sua senha.',
})

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { values, errors, handleChange, validar: formValido } = useForm({ email: '', senha: '' }, validar)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formValido()) return
    setEnviando(true)
    setErro('')
    try {
      await login(values.email, values.senha)
      navigate(location.state?.from?.pathname || '/', { replace: true })
    } catch (err) {
      setErro(getErrorMessage(err))
      setEnviando(false)
    }
  }

  return (
    <AuthLayout titulo="Entrar" subtitulo="Bem-vindo de volta! Acesse sua conta.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {erro && (
          <div role="alert" className="flex items-center gap-2 rounded-lg bg-danger-bg border border-danger/30 px-4 py-3 text-sm text-danger">
            <WarningCircle size={18} /> {erro}
          </div>
        )}

        <Input
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@email.com"
          icon={Envelope}
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />

        <div className="relative">
          <Input
            label="Senha"
            name="senha"
            type={mostrarSenha ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••"
            icon={Lock}
            value={values.senha}
            onChange={handleChange}
            error={errors.senha}
            className="pr-11"
          />
          <button
            type="button"
            onClick={() => setMostrarSenha((m) => !m)}
            className="absolute right-3 top-[38px] text-text-muted hover:text-white"
            aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {mostrarSenha ? <EyeSlash size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <Button type="submit" size="lg" loading={enviando} className="w-full mt-2">
          Entrar
        </Button>

        <p className="text-sm text-text-muted text-center">
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="text-primary hover:underline font-medium">
            Cadastre-se
          </Link>
        </p>

        {import.meta.env.DEV && (
          <p className="text-xs text-text-muted text-center border border-dashed border-gray-700 rounded-lg p-3">
            Usuário de teste: <span className="text-white">vitor@fiap.com.br</span> / <span className="text-white">123456</span>
          </p>
        )}
      </form>
    </AuthLayout>
  )
}
