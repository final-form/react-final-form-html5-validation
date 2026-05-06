import * as React from 'react'
import { Field, FieldRenderProps } from 'react-final-form'
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
  private fieldRef = React.createRef<HTMLElement | null>()

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
    this.findInput()
  }

  private findInput = (): void => {
    const root = this.fieldRef.current
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
      component,
      render,
      children,
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

    // Merge innerRef with fieldRef
    const mergedRef = (node: HTMLElement | null) => {
      ;(this.fieldRef as React.MutableRefObject<HTMLElement | null>).current =
        node
      if (typeof innerRef === 'function') {
        innerRef(node)
      } else if (innerRef) {
        ;(innerRef as React.MutableRefObject<HTMLElement | null>).current = node
      }
    }

    // Wrap render function to inject ref
    const wrappedRender = (
      fieldProps: FieldRenderProps<unknown, HTMLElement>
    ) => {
      // Call user's render/children function if provided
      const userRender = render || children
      if (userRender && typeof userRender === 'function') {
        const element = userRender(fieldProps)
        // Clone and inject ref
        return React.isValidElement(element)
          ? React.cloneElement(element, {
              ref: mergedRef
            } as React.RefAttributes<HTMLElement>)
          : element
      }
      // Default: render input with ref and pass through HTML field props
      return React.createElement(component || 'input', {
        ...fieldProps,
        ...fieldProps.input,
        ref: mergedRef
      })
    }

    const validateField = this.validate
    const FieldComponent = Field as React.ComponentType<
      typeof fieldProps & {
        children: typeof wrappedRender
        validate: typeof validateField
      }
    >

    return (
      <FieldComponent {...fieldProps} validate={validateField}>
        {wrappedRender}
      </FieldComponent>
    )
  }
}

function Html5ValidationFieldWithRef(
  props: Omit<Html5ValidationFieldProps, 'ref'>,
  ref: React.Ref<HTMLElement>
): React.ReactElement {
  const { name, ...rest } = props
  return <Html5ValidationField name={name} {...rest} innerRef={ref} />
}

const ForwardedHtml5ValidationField = React.forwardRef<
  HTMLElement,
  Omit<Html5ValidationFieldProps, 'ref'>
>(Html5ValidationFieldWithRef)

export default ForwardedHtml5ValidationField
export { Html5ValidationField }
