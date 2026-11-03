import { useState } from 'react'

// Estado de formulário controlado + validação simples.
// validate(values) deve devolver um objeto { campo: 'mensagem de erro' }.
export default function useForm(initialValues, validate = () => ({})) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((atual) => ({ ...atual, [name]: value }))
    if (errors[name]) setErrors((atual) => ({ ...atual, [name]: undefined }))
  }

  const setField = (name, value) => setValues((atual) => ({ ...atual, [name]: value }))

  const validar = () => {
    const novosErros = Object.fromEntries(Object.entries(validate(values)).filter(([, msg]) => msg))
    setErrors(novosErros)
    return Object.keys(novosErros).length === 0
  }

  return { values, setValues, errors, setErrors, handleChange, setField, validar }
}
