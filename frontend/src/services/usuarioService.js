import api from './api'

const usuarioService = {
  perfil: () => api.get('/usuarios/me').then((res) => res.data),
  atualizar: (dados) => api.put('/usuarios/me', dados).then((res) => res.data),
  excluirConta: () => api.delete('/usuarios/me'),
}

export default usuarioService
