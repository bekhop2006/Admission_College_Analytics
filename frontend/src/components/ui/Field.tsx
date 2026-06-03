import type { ReactNode } from 'react'

interface FieldProps {
  label: string
  hint?: string
  children: ReactNode
  className?: string
}

/** Labeled form field wrapper with optional hint text. */
export function Field({ label, hint, children, className = '' }: FieldProps) {
  return (
    <div className={`field ${className}`.trim()}>
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  )
}
