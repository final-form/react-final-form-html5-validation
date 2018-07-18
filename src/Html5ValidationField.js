// @flow
import * as React from 'react'
import ReactDOM from 'react-dom'
import { Field } from 'react-final-form'
import type { Html5ValidationFieldProps as Props } from './types'
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

type WithValidity = {
  validity: ValidityState,
  setCustomValidity: (error: ?string) => void
}

export default class Html5ValidationField extends React.Component<Props> {
  props: Props
  input: ?WithValidity

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

  static findDOMNode = ReactDOM.findDOMNode

  componentDidMount() {
    const root: ?Element | Text = ReactDOM.findDOMNode(this)
    if (root) {
      let input
      if (/input|textarea|select/.test(root.nodeName.toLowerCase())) {
        input = ((root: any): WithValidity)
      } else if (root.querySelector) {
        const { name } = this.props
        input = ((((root: any): Element).querySelector(
          `input[name=${name}],textarea[name=${name}],select[name=${name}]`
        ): any): WithValidity)
      }
      const foundInput = input && typeof input.setCustomValidity === 'function'
      if (foundInput) {
        this.input = input
      }
      warning(foundInput, 'Could not find DOM input with HTML validity API')
    }
  }

  validate = (value: ?any, allValues: Object) => {
    const { input, props: { validate } } = this
    if (input) {
      const validity: ?ValidityState = input && input.validity
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
        if (validity.customError) {
          return validity.customError
        }
        const errorKey: ?string = errorKeys.find(key => (validity: Object)[key])
        const error = errorKey && this.props[errorKey]
        input.setCustomValidity(error)
        return error
      }
    } else if (validate) {
      return validate(value, allValues)
    }
  }

  render() {
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
      ...rest
    } = this.props
    return React.createElement(Field, { validate: this.validate, ...rest })
  }
}
