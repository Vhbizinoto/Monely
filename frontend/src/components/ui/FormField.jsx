import { useId } from 'react'
import { CaretDown } from '@phosphor-icons/react'

const BASE =
  'w-full bg-background border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary'

// Envolve label, campo e mensagem de erro. Usado por Input e Select.
function Field({ label, error, hint, id, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-erro`} className="text-xs text-danger">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-text-muted">{hint}</p>
      )}
    </div>
  )
}

export function Input({ label, error, hint, icon: Icon, className = '', ...props }) {
  const id = useId()
  return (
    <Field label={label} error={error} hint={hint} id={id}>
      <div className="relative">
        {Icon && (
          <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        )}
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-erro` : undefined}
          className={`${BASE} ${Icon ? 'pl-10' : ''} ${error ? 'border-danger' : 'border-gray-700'} ${className}`}
          {...props}
        />
      </div>
    </Field>
  )
}

export function Select({ label, error, hint, options, placeholder, className = '', ...props }) {
  const id = useId()
  return (
    <Field label={label} error={error} hint={hint} id={id}>
      <div className="relative">
        <select
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-erro` : undefined}
          className={`${BASE} cursor-pointer pr-10 ${error ? 'border-danger' : 'border-gray-700'} ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opcao) => (
            <option key={opcao.value} value={opcao.value}>
              {opcao.label}
            </option>
          ))}
        </select>
        <CaretDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
      </div>
    </Field>
  )
}
