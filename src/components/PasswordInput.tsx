import { useState, type InputHTMLAttributes } from 'react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export function PasswordInput(props: Props) {
  const [visible, setVisible] = useState(false)

  return (
    <span className="password-input">
      <input {...props} type={visible ? 'text' : 'password'} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
      >
        {visible ? 'Ocultar' : 'Mostrar'}
      </button>
    </span>
  )
}
