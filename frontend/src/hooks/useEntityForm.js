import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { getErrorMessage } from '../services/api'
import useForm from './useForm'

// Lógica comum às páginas de formulário (inserir e atualizar):
//  - com :id na rota, busca o registro e preenche o formulário (modo edição)
//  - no submit, valida, chama criar/atualizar e volta para a listagem (voltarPara pode ser uma função dos dados salvos)
export default function useEntityForm({ service, valoresIniciais, validar, paraFormulario, paraApi, voltarPara, nome, masculino = false }) {
  const { id } = useParams()
  const editando = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()
  const form = useForm(valoresIniciais, validar)
  const { setValues } = form
  const [carregando, setCarregando] = useState(editando)
  const [erroCarregamento, setErroCarregamento] = useState(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!editando) return
    let ativo = true
    service
      .buscarPorId(id)
      .then((registro) => ativo && setValues(paraFormulario ? paraFormulario(registro) : registro))
      .catch((err) => ativo && setErroCarregamento(getErrorMessage(err)))
      .finally(() => ativo && setCarregando(false))
    return () => {
      ativo = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.validar()) return
    setEnviando(true)
    try {
      const dados = paraApi ? paraApi(form.values) : form.values
      if (editando) await service.atualizar(id, dados)
      else await service.criar(dados)
      const sufixo = masculino ? 'o' : 'a'
      toast(`${nome} ${editando ? 'atualizad' : 'criad'}${sufixo} com sucesso!`)
      navigate(typeof voltarPara === 'function' ? voltarPara(dados) : voltarPara)
    } catch (err) {
      toast(getErrorMessage(err, 'Não foi possível salvar.'), 'erro')
      setEnviando(false)
    }
  }

  return { ...form, editando, carregando, erroCarregamento, enviando, handleSubmit }
}
