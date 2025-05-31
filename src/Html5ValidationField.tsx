import * as React from 'react'
import ReactDOM from 'react-dom'
import { Field } from 'react-final-form'
import { Html5ValidationFieldProps } from './types'
import warning from './warning'

const errorKeys: string[] = [
  'badInput',
  'patternMismatch',
  'rangeOverflow',
  'rangeUnderflow',
  'stepMismatch',
  'tooLong',
  'tooShort',
  'typeMismatch',
  'valueMissing'
]

interface WithValidity {
  validity: ValidityState
  setCustomValidity: (error: string | null) => void
  validationMessage: string
}

class Html5ValidationField extends React.Component<Html5ValidationFieldProps> {
  private input: WithValidity | null = null

  static defaultProps = {
    badInput: 'Incorrect input',
    patternMismatch: 'Does not match expected pattern',
    rangeOverflow: 'Value too high',
    rangeUnderflow: 'Value too low',
    stepMismatch: 'Invalid step value',
    tooLong: 'Too long',
    tooShort: 'Too short',
    typeMismatch: 'Invalid value',
    valueMissing: 'Required'
  }

  private warnIfNoInput(foundInput: boolean) {
    warning(foundInput, 'Could not find DOM input with HTML validity API')
  }

  componentDidMount(): void {
    const root = ReactDOM.findDOMNode(this)
    if (root) {
      let input: WithValidity | null = null
      if (/input|textarea|select/.test(root.nodeName.toLowerCase())) {
        input = root as unknown as WithValidity
      } else if (
        root instanceof Element &&
        typeof root.querySelector === 'function'
      ) {
        const { name } = this.props
        input = root.querySelector(
          `input[name="${name}"],textarea[name="${name}"],select[name="${name}"]`
        ) as unknown as WithValidity
      }
      const foundInput = Boolean(
        input && typeof input.setCustomValidity === 'function'
      )
      if (foundInput) {
        this.input = input
      }
      this.warnIfNoInput(foundInput)
    }
  }

  validate = (value: unknown, allValues: object): string | undefined => {
    const {
      input,
      props: { validate }
    } = this
    if (input) {
      const validity = input.validity
      if (validate) {
        const error = validate(value, allValues)
        if (input.setCustomValidity && typeof error === 'string') {
          input.setCustomValidity(error)
        }
        if (error) {
          return error
        }
      }
      input.setCustomValidity('')
      if (validity && !validity.valid) {
        if (validity.customError && input.validationMessage) {
          return input.validationMessage
        }
        const errorKey = errorKeys.find(
          (key) => (validity as ValidityState)[key as keyof ValidityState]
        )
        let error =
          errorKey && this.props[errorKey as keyof Html5ValidationFieldProps]
        if (typeof error === 'function') {
          error = error(value, this.props)
        }
        if (typeof error === 'string') {
          input.setCustomValidity(error)
          return error
        }
      }
    } else if (validate) {
      this.warnIfNoInput(false)
      return validate(value, allValues)
    }
    return undefined
  }

  render(): React.ReactElement {
    const {
      validate,
      badInput,
      patternMismatch,
      rangeOverflow,
      rangeUnderflow,
      stepMismatch,
      tooLong,
      tooShort,
      typeMismatch,
      valueMissing,
      innerRef,
      ...rest
    } = this.props

    // Remove all message keys from rest before passing to Field
    const {
      badInput: _badInput,
      patternMismatch: _patternMismatch,
      rangeOverflow: _rangeOverflow,
      rangeUnderflow: _rangeUnderflow,
      stepMismatch: _stepMismatch,
      tooLong: _tooLong,
      tooShort: _tooShort,
      typeMismatch: _typeMismatch,
      valueMissing: _valueMissing,
      ...fieldProps
    } = rest

    return React.createElement(Field, {
      ...fieldProps,
      validate: this.validate,
      ref: innerRef as React.Ref<HTMLElement>,
      component: 'input'
    })
  }
}

function Html5ValidationFieldWithRef(
  props: Omit<Html5ValidationFieldProps, 'ref'>,
  ref: React.Ref<Html5ValidationField>
): React.ReactElement {
  const { name, ...rest } = props
  return <Html5ValidationField name={name} {...rest} innerRef={ref} />
}

const ForwardedHtml5ValidationField = React.forwardRef<
  Html5ValidationField,
  Omit<Html5ValidationFieldProps, 'ref'>
>(Html5ValidationFieldWithRef)

export default ForwardedHtml5ValidationField
export { Html5ValidationField }
