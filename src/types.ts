import { FieldProps } from 'react-final-form'
import type { FieldValidator } from 'final-form'
import type { Html5ValidationField } from './Html5ValidationField'

export interface Messages {
  badInput?: string | ((value?: unknown, props?: Record<string, unknown>) => string)
  patternMismatch?: string | ((value?: unknown, props?: Record<string, unknown>) => string)
  rangeOverflow?: string | ((value?: unknown, props?: Record<string, unknown>) => string)
  rangeUnderflow?: string | ((value?: unknown, props?: Record<string, unknown>) => string)
  stepMismatch?: string | ((value?: unknown, props?: Record<string, unknown>) => string)
  tooLong?: string | ((value?: unknown, props?: Record<string, unknown>) => string)
  tooShort?: string | ((value?: unknown, props?: Record<string, unknown>) => string)
  typeMismatch?: string | ((value?: unknown, props?: Record<string, unknown>) => string)
  valueMissing?: string | ((value?: unknown, props?: Record<string, unknown>) => string)
}

export interface Html5ValidationFieldProps extends FieldProps {
  validate?: FieldValidator<unknown>
  innerRef?: React.Ref<Html5ValidationField>
  // All message keys
  badInput?: string | ((value?: unknown, props?: Record<string, unknown>) => string)
  patternMismatch?: string | ((value?: unknown, props?: Record<string, unknown>) => string)
  rangeOverflow?: string | ((value?: unknown, props?: Record<string, unknown>) => string)
  rangeUnderflow?: string | ((value?: unknown, props?: Record<string, unknown>) => string)
  stepMismatch?: string | ((value?: unknown, props?: Record<string, unknown>) => string)
  tooLong?: string | ((value?: unknown, props?: Record<string, unknown>) => string)
  tooShort?: string | ((value?: unknown, props?: Record<string, unknown>) => string)
  typeMismatch?: string | ((value?: unknown, props?: Record<string, unknown>) => string)
  valueMissing?: string | ((value?: unknown, props?: Record<string, unknown>) => string)
} 