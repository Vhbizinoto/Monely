import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Envelope, Lock, Trash, User } from '@phosphor-icons/react'
import PageHeader from '../components/layout/PageHeader'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { Input } from '../components/ui/FormField'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import useForm from '../hooks/useForm'
import { getErrorMessage } from '../services/api'
import usuarioService from '../services/usuarioService'

const validarPerfil = ({ nome, email }) => ({
  nome: nome.trim().length < 3 && 'Informe seu nome completo.',
  email: !/^\S+@\S+\.\S+$/.test(email) && 'E-mail inválido.',
})

const validarSenha = ({ senhaAtual, novaSenha, confirmar }) => ({
  senhaAtual: !senhaAtual && 'Informe a senha atual.',
  novaSenha: novaSenha.length < 6 && 'A nova senha precisa ter pelo menos 6 caracteres.',
  confirmar: confirmar !== novaSenha && 'As senhas não conferem.',
})

export default function Configuracoes() {
  const { usuario, atualizarUsuario, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const perfil = useForm({ nome: usuario.nome, email: usuario.email }, validarPerfil)
  const senha = useForm({ senhaAtual: '', novaSenha: '', confirmar: '' }, validarSenha)
  const [salvandoPerfil, setSalvandoPerfil] = useState(false)
  const [salvandoSenha, setSalvandoSenha] = useState(false)
  const [confirmarExclusao, setConfirmarExclusao] = useState(false)
  const [excluindo, setExcluindo] = useState(false)

  const salvarPerfil = async (e) => {
    e.preventDefault()
    if (!perfil.validar()) return
    setSalvandoPerfil(true)
    try {
      atualizarUsuario(await usuarioService.atualizar({ nome: perfil.values.nome.trim(), email: perfil.values.email }))
      toast('Perfil atualizado!')
    } catch (err) {
      toast(getErrorMessage(err), 'erro')
    } finally {
      setSalvandoPerfil(false)
    }
  }

  const salvarSenha = async (e) => {
    e.preventDefault()
    if (!senha.validar()) return
    setSalvandoSenha(true)
    try {
      await usuarioService.atualizar({ senhaAtual: senha.values.senhaAtual, novaSenha: senha.values.novaSenha })
      senha.setValues({ senhaAtual: '', novaSenha: '', confirmar: '' })
      toast('Senha alterada!')
    } catch (err) {
      toast(getErrorMessage(err), 'erro')
    } finally {
      setSalvandoSenha(false)
    }
  }

  const excluirConta = async () => {
    setExcluindo(true)
    try {
      await usuarioService.excluirConta()
      logout()
      navigate('/login', { replace: true })
      toast('Sua conta foi excluída.')
    } catch (err) {
      toast(getErrorMessage(err), 'erro')
      setExcluindo(false)
    }
  }

  return (
    <>
      <PageHeader titulo="Configurações" subtitulo="Gerencie seu perfil e sua segurança" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <Card hover={false}>
          <h2 className="font-bold text-lg mb-6">Perfil</h2>
          <form onSubmit={salvarPerfil} noValidate className="flex flex-col gap-5">
            <Input label="Nome" name="nome" icon={User} value={perfil.values.nome} onChange={perfil.handleChange} error={perfil.errors.nome} />
            <Input label="E-mail" name="email" type="email" icon={Envelope} value={perfil.values.email} onChange={perfil.handleChange} error={perfil.errors.email} />
            <div className="flex justify-end">
              <Button type="submit" loading={salvandoPerfil}>Salvar perfil</Button>
            </div>
          </form>
        </Card>

        <Card hover={false}>
          <h2 className="font-bold text-lg mb-6">Alterar senha</h2>
          <form onSubmit={salvarSenha} noValidate className="flex flex-col gap-5">
            <Input label="Senha atual" name="senhaAtual" type="password" autoComplete="current-password" icon={Lock} value={senha.values.senhaAtual} onChange={senha.handleChange} error={senha.errors.senhaAtual} />
            <Input label="Nova senha" name="novaSenha" type="password" autoComplete="new-password" icon={Lock} value={senha.values.novaSenha} onChange={senha.handleChange} error={senha.errors.novaSenha} />
            <Input label="Confirmar nova senha" name="confirmar" type="password" autoComplete="new-password" icon={Lock} value={senha.values.confirmar} onChange={senha.handleChange} error={senha.errors.confirmar} />
            <div className="flex justify-end">
              <Button type="submit" loading={salvandoSenha}>Alterar senha</Button>
            </div>
          </form>
        </Card>

        <Card hover={false} className="xl:col-span-2 border-danger/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-lg mb-1">Excluir conta</h2>
              <p className="text-sm text-text-muted">Remove permanentemente seu usuário e todos os seus dados.</p>
            </div>
            <Button variant="danger" icon={Trash} onClick={() => setConfirmarExclusao(true)}>
              Excluir minha conta
            </Button>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        aberto={confirmarExclusao}
        titulo="Excluir sua conta?"
        mensagem="Todas as suas contas, transações, metas e orçamentos serão apagados. Essa ação não pode ser desfeita."
        textoConfirmar="Excluir conta"
        carregando={excluindo}
        onConfirmar={excluirConta}
        onCancelar={() => setConfirmarExclusao(false)}
      />
    </>
  )
}
