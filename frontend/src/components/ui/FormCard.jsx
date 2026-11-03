import { useNavigate } from 'react-router-dom'
import Button from './Button'
import Card from './Card'

// Moldura padrão dos formulários de inserir/atualizar
export default function FormCard({ onSubmit, enviando, voltarPara, textoSalvar = 'Salvar', children }) {
  const navigate = useNavigate()
  return (
    <Card hover={false} className="max-w-2xl">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        {children}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-800">
          <Button type="button" variant="secondary" onClick={() => navigate(voltarPara)} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="submit" loading={enviando}>
            {textoSalvar}
          </Button>
        </div>
      </form>
    </Card>
  )
}
