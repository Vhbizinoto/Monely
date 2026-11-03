import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { AUTH_STORAGE_KEY, setUnauthorizedHandler } from '../services/api'
import authService from '../services/authService'

const AuthContext = createContext(null)

const lerSessao = () => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(lerSessao)

  const salvarSessao = useCallback((novaSessao) => {
    if (novaSessao) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(novaSessao))
    else localStorage.removeItem(AUTH_STORAGE_KEY)
    setSessao(novaSessao)
  }, [])

  const login = useCallback(
    async (email, senha) => salvarSessao(await authService.login(email, senha)),
    [salvarSessao],
  )

  const cadastrar = useCallback(
    async (dados) => salvarSessao(await authService.cadastrar(dados)),
    [salvarSessao],
  )

  const logout = useCallback(() => salvarSessao(null), [salvarSessao])

  // Atualiza os dados do usuário (ex.: depois de editar o perfil) mantendo o token
  const atualizarUsuario = useCallback(
    (usuario) => salvarSessao({ ...lerSessao(), usuario }),
    [salvarSessao],
  )

  // Se a API responder 401, a sessão acabou: volta para o login
  useEffect(() => {
    setUnauthorizedHandler(logout)
  }, [logout])

  const value = useMemo(
    () => ({
      usuario: sessao?.usuario ?? null,
      autenticado: Boolean(sessao?.token),
      login,
      cadastrar,
      logout,
      atualizarUsuario,
    }),
    [sessao, login, cadastrar, logout, atualizarUsuario],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
