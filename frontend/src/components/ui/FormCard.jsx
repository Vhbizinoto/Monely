import { useNavigate } from 'react-router-dom'
import Button from './Button'
import Card from './Card'

// Moldura padrão dos formulários de inserir/atualizar.
// "aside" é o painel lateral (pré-visualização e contexto) exibido ao lado em telas grandes.
export default function FormCard({ onSubmit, enviando, voltarPara, textoSalvar = 'Salvar', aside, children }) {
  const navigate = useNavigate()

  const formulario = (
    <Card hover={false} className={aside ? '' : 'max-w-3xl'}>
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

  if (!aside) return formulario

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_400px] gap-6 items-start max-w-6xl">
      {formulario}
      <aside className="flex flex-col gap-6 lg:sticky lg:top-0">{aside}</aside>
    </div>
  )
}
