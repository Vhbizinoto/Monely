import { useCallback, useState } from 'react'
import { useToast } from '../contexts/ToastContext'
import { getErrorMessage } from '../services/api'

// Controla o fluxo "clicar em remover → confirmar no modal → chamar a API".
// Devolve pedirRemocao(item) e as props prontas para o <ConfirmDialog />.
export default function useRemocao({ remover, mensagemSucesso, onRemovido }) {
  const toast = useToast()
  const [alvo, setAlvo] = useState(null)
  const [removendo, setRemovendo] = useState(false)

  const cancelar = useCallback(() => setAlvo(null), [])

  const confirmar = async () => {
    setRemovendo(true)
    try {
      await remover(alvo.id)
      toast(mensagemSucesso)
      onRemovido?.(alvo)
      setAlvo(null)
    } catch (err) {
      toast(getErrorMessage(err, 'Não foi possível remover.'), 'erro')
    } finally {
      setRemovendo(false)
    }
  }

  return {
    alvo,
    pedirRemocao: setAlvo,
    dialogProps: { aberto: Boolean(alvo), carregando: removendo, onConfirmar: confirmar, onCancelar: cancelar },
  }
}
