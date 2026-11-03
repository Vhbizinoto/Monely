import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Envelope, Lock, User, WarningCircle } from '@phosphor-icons/react'
import AuthLayout from './AuthLayout'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/FormField'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import useForm from '../../hooks/useForm'
import { getErrorMessage } from '../../services/api'

const validar = ({ nome, email, senha, confirmarSenha }) => ({
  nome: nome.trim().length < 3 && 'Informe seu nome completo.',
  email: !email ? 'Informe seu e-mail.' : !/^\S+@\S+\.\S+$/.test(email) && 'E-mail inválido.',
  senha: senha.length < 6 && 'A senha precisa ter pelo menos 6 caracteres.',
  confirmarSenha: confirmarSenha !== senha && 'As senhas não conferem.',
})

export default function Cadastro() {
  const { cadastrar } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const { values, errors, handleChange, validar: formValido } = useForm(
    { nome: '', email: '', senha: '', confirmarSenha: '' },
    validar,
  )
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formValido()) return
    setEnviando(true)
    setErro('')
    try {
      await cadastrar({ nome: values.nome.trim(), email: values.email, senha: values.senha })
      toast('Conta criada! Comece cadastrando uma conta bancária.')
      navigate('/contas/nova', { replace: true })
    } catch (err) {
      setErro(getErrorMessage(err))
      setEnviando(false)
    }
  }

  return (
    <AuthLayout titulo="Criar conta" subtitulo="Leva menos de um minuto.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {erro && (
          <div role="alert" className="flex items-center gap-2 rounded-lg bg-danger-bg border border-danger/30 px-4 py-3 text-sm text-danger">
            <WarningCircle size={18} /> {erro}
          </div>
        )}

        <Input label="Nome" name="nome" autoComplete="name" placeholder="Seu nome" icon={User} value={values.nome} onChange={handleChange} error={errors.nome} />
        <Input label="E-mail" name="email" type="email" autoComplete="email" placeholder="voce@email.com" icon={Envelope} value={values.email} onChange={handleChange} error={errors.email} />
        <Input label="Senha" name="senha" type="password" autoComplete="new-password" placeholder="Mínimo 6 caracteres" icon={Lock} value={values.senha} onChange={handleChange} error={errors.senha} />
        <Input label="Confirmar senha" name="confirmarSenha" type="password" autoComplete="new-password" placeholder="Repita a senha" icon={Lock} value={values.confirmarSenha} onChange={handleChange} error={errors.confirmarSenha} />

        <Button type="submit" size="lg" loading={enviando} className="w-full mt-2">
          Criar conta
        </Button>

        <p className="text-sm text-text-muted text-center">
          Já tem conta?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Entrar
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
