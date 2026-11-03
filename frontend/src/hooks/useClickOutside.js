import { useEffect, useRef } from 'react'

// Chama onFora quando o usuário clica fora do elemento ou aperta Esc (usado nos dropdowns)
export default function useClickOutside(ativo, onFora) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ativo) return
    const aoClicar = (e) => !ref.current?.contains(e.target) && onFora()
    const aoTeclar = (e) => e.key === 'Escape' && onFora()
    document.addEventListener('mousedown', aoClicar)
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.removeEventListener('mousedown', aoClicar)
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [ativo, onFora])

  return ref
}
