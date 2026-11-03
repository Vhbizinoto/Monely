import { getCategoria } from '../../constants/categorias'

// Quadradinho colorido com o ícone da categoria
export default function CategoryIcon({ categoria, tipo = 'DESPESA', size = 'md' }) {
  const { icone: Icone, cor } = getCategoria(categoria, tipo)
  const tamanho = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'
  return (
    <div
      className={`${tamanho} shrink-0 rounded-lg flex items-center justify-center`}
      style={{ backgroundColor: `${cor}1F`, color: cor }}
    >
      <Icone size={size === 'sm' ? 16 : 20} />
    </div>
  )
}
