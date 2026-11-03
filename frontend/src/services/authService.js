import api from './api'

const authService = {
  login: (email, senha) => api.post('/auth/login', { email, senha }).then((res) => res.data),
  cadastrar: (dados) => api.post('/auth/register', dados).then((res) => res.data),
}

export default authService
