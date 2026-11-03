import api from './api'

// Cria as operações REST padrão (consultar, inserir, atualizar, remover) para um recurso
export const createCrudService = (recurso) => ({
  listar: (params) => api.get(`/${recurso}`, { params }).then((res) => res.data),
  buscarPorId: (id) => api.get(`/${recurso}/${id}`).then((res) => res.data),
  criar: (dados) => api.post(`/${recurso}`, dados).then((res) => res.data),
  atualizar: (id, dados) => api.put(`/${recurso}/${id}`, dados).then((res) => res.data),
  remover: (id) => api.delete(`/${recurso}/${id}`),
})
