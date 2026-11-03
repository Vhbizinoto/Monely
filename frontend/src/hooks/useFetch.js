import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage } from '../services/api'

// Executa uma função assíncrona ao montar o componente e expõe { data, loading, error, reload }.
// Passe uma função estável (definida fora do componente ou envolvida em useCallback).
export default function useFetch(fetcher, initialData = null) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await fetcher())
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    reload()
  }, [reload])

  return { data, setData, loading, error, reload }
}
