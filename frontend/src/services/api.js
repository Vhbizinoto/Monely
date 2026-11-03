import axios from 'axios'

export const AUTH_STORAGE_KEY = 'monely:auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
})

// Envia o token salvo em todas as requisições
api.interceptors.request.use((config) => {
  try {
    const auth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY))
    if (auth?.token) config.headers.Authorization = `Bearer ${auth.token}`
  } catch {
    // sem sessão salva
  }
  return config
})

let onUnauthorized = () => {}

// O AuthContext registra aqui o que fazer quando a sessão expira
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.startsWith('/auth')
    if (error.response?.status === 401 && !isAuthRoute) onUnauthorized()
    return Promise.reject(error)
  },
)

// Mensagem amigável a partir de um erro do axios
export const getErrorMessage = (error, fallback = 'Algo deu errado. Tente novamente.') => {
  if (!error.response) return 'Não foi possível conectar ao servidor.'
  return error.response.data?.message || fallback
}

export default api
