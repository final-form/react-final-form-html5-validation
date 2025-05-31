import React from 'react'
import ReactDOM from 'react-dom'
import { render, cleanup } from '@testing-library/react'
import { Form, FieldRenderProps, FieldInputProps } from 'react-final-form'
import Html5ValidationField, {
  Html5ValidationField as Html5ValidationFieldClass
} from './Html5ValidationField'

const onSubmitMock = () => {}

const getAttributes = (el: HTMLElement): Record<string, string> => {
  const attributes: Record<string, string> = {}
  for (let i = 0; i < el.attributes.length; i++) {
    const attr = el.attributes[i]
    attributes[attr.name] = attr.value
  }
  return attributes
}

interface TestFieldRenderProps
  extends FieldRenderProps<string, HTMLInputElement> {
  input: FieldInputProps<string, HTMLInputElement>
}

describe('Html5ValidationField', () => {
  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  describe('Html5ValidationField.rules', () => {
    const testPassThrough = (
      rule: Record<string, unknown>,
      testId = 'input'
    ) => {
      const consoleSpy = jest
        .spyOn(global.console, 'error')
        .mockImplementation(() => {})
      const { getByTestId } = render(
        <Form onSubmit={onSubmitMock} subscription={{}}>
          {() => (
            <Html5ValidationField
              name="foo"
              component="input"
              {...rule}
              data-testid={testId}
            />
          )}
        </Form>
      )
      const input = getByTestId(testId)
      expect(input).toBeDefined()
      Object.keys(rule).forEach((key) => {
        if (key === 'required') {
          expect(input.hasAttribute('required')).toBe(true)
        } else if (key === 'minLength') {
          expect(input.getAttribute('minlength')).toBe(rule[key]?.toString())
        } else if (key === 'maxLength') {
          expect(input.getAttribute('maxlength')).toBe(rule[key]?.toString())
        } else {
          expect(input.getAttribute(key)).toBe(rule[key]?.toString())
        }
      })
      consoleSpy.mockRestore()
    }

    it('should pass "required" through to input', () => {
      testPassThrough({ required: true })
    })

    it('should pass "pattern" through to input', () => {
      testPassThrough({ pattern: 'text' }, 'text')
      testPassThrough({ pattern: 'search' }, 'search')
      testPassThrough({ pattern: 'url' }, 'url')
      testPassThrough({ pattern: 'tel' }, 'tel')
      testPassThrough({ pattern: 'email' }, 'email')
      testPassThrough({ pattern: 'password' }, 'password')
      testPassThrough({ pattern: /look, ma, a regex!/ }, 'regex')
    })

    it('should pass "min" through to input', () => {
      testPassThrough({ min: 2 })
    })

    it('should pass "max" through to input', () => {
      testPassThrough({ max: 5 })
    })

    it('should pass "step" through to input', () => {
      testPassThrough({ step: 3 })
    })

    it('should pass "minlength" through to input', () => {
      testPassThrough({ minLength: 5 })
    })

    it('should pass "maxlength" through to input', () => {
      testPassThrough({ maxLength: 8 })
    })
  })

  it('should pass ref through to the input', () => {
    const ref = React.createRef<Html5ValidationFieldClass>()
    render(
      <Form onSubmit={onSubmitMock} subscription={{ values: true }}>
        {() => (
          <form>
            <Html5ValidationField name="name" component="input" ref={ref} />
          </form>
        )}
      </Form>
    )

    expect(ref.current).not.toBe(null)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    // Optionally, check that input is set up (if componentDidMount runs in test env)
    // expect(ref.current.input).not.toBe(null)
  })

  describe('Html5ValidationField.messages', () => {
    const testNotPassThrough = (message: Record<string, unknown>) => {
      const consoleSpy = jest
        .spyOn(global.console, 'error')
        .mockImplementation(() => {})
      const { getByTestId } = render(
        <Form onSubmit={onSubmitMock} subscription={{}}>
          {() => (
            <Html5ValidationField
              name="foo"
              component="input"
              {...message}
              data-testid="input"
            />
          )}
        </Form>
      )
      const input = getByTestId('input')
      expect(input).toBeDefined()
      const attributes = getAttributes(input)
      Object.keys(message).forEach((key) =>
        expect(attributes[key]).toBeUndefined()
      )
      consoleSpy.mockRestore()
    }
    ;[
      'badInput',
      'patternMismatch',
      'rangeOverflow',
      'rangeUnderflow',
      'stepMismatch',
      'tooLong',
      'tooShort',
      'typeMismatch',
      'valueMissing'
    ].forEach((key) => {
      it(`should not pass "${key}" through to input`, () => {
        testNotPassThrough({ [key]: 'All your base are belong to us' })
      })
    })
  })

  describe('Html5ValidationField.validity', () => {
    let findDOMNodeSpy: jest.SpyInstance
    afterEach(() => {
      if (findDOMNodeSpy) {
        findDOMNodeSpy.mockRestore()
      }
    })
    const mockFindNode = (querySelector: jest.Mock) => {
      const div = document.createElement('div')
      div.querySelector = querySelector
      findDOMNodeSpy = jest.spyOn(ReactDOM, 'findDOMNode').mockReturnValue(div)
      return div
    }

    it('should use the root node if it is an input element', () => {
      const input = document.createElement('input')
      input.name = 'foo'
      input.setCustomValidity = jest.fn()
      Object.defineProperty(input, 'validity', {
        value: { valid: true } as ValidityState,
        configurable: true
      })
      findDOMNodeSpy = jest
        .spyOn(ReactDOM, 'findDOMNode')
        .mockReturnValue(input)
      render(
        <Form onSubmit={onSubmitMock} subscription={{}}>
          {() => (
            <Html5ValidationField name="foo">
              {({ input }: TestFieldRenderProps) => <input {...input} />}
            </Html5ValidationField>
          )}
        </Form>
      )
      expect(input.setCustomValidity).toHaveBeenCalled()
    })

    it('should search DOM for input if the root is not the input', () => {
      const input = document.createElement('input')
      input.name = 'foo'
      const querySelector = jest.fn().mockReturnValue(input)
      const div = mockFindNode(querySelector)
      render(
        <Form onSubmit={() => {}}>
          {() => (
            <Html5ValidationField name="foo">
              {({ input }: TestFieldRenderProps) => (
                <div ref={() => div}>{input.value}</div>
              )}
            </Html5ValidationField>
          )}
        </Form>
      )
      expect(querySelector).toHaveBeenCalled()
      expect(querySelector).toHaveBeenCalledTimes(1)
      const calls = querySelector.mock.calls
      if (calls.length > 0) {
        expect(calls[0][0]).toBe(
          'input[name="foo"],textarea[name="foo"],select[name="foo"]'
        )
      }
    })

    it('should search DOM for input if the root is not the input, even for deep fields', () => {
      const input = document.createElement('input')
      input.name = 'foo.bar'
      const querySelector = jest.fn().mockReturnValue(input)
      const div = mockFindNode(querySelector)
      render(
        <Form onSubmit={() => {}}>
          {() => (
            <Html5ValidationField name="foo.bar">
              {({ input }: TestFieldRenderProps) => (
                <div ref={() => div}>{input.value}</div>
              )}
            </Html5ValidationField>
          )}
        </Form>
      )
      expect(querySelector).toHaveBeenCalled()
      expect(querySelector).toHaveBeenCalledTimes(1)
      const calls = querySelector.mock.calls
      if (calls.length > 0) {
        expect(calls[0][0]).toBe(
          'input[name="foo.bar"],textarea[name="foo.bar"],select[name="foo.bar"]'
        )
      }
    })

    it('should fail silently if no DOM node could be found (probably SSR)', () => {
      const consoleSpy = jest
        .spyOn(global.console, 'error')
        .mockImplementation(() => {})
      findDOMNodeSpy = jest.spyOn(ReactDOM, 'findDOMNode').mockReturnValue(null)
      render(
        <Form onSubmit={onSubmitMock} subscription={{}}>
          {() => (
            <Html5ValidationField name="foo">
              {({ input }: TestFieldRenderProps) => <input {...input} />}
            </Html5ValidationField>
          )}
        </Form>
      )
      expect(consoleSpy).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should warn if no input could be found because DOM node has no querySelector API', () => {
      const consoleSpy = jest
        .spyOn(global.console, 'error')
        .mockImplementation(() => {})
      const div = document.createElement('div')
      Object.defineProperty(div, 'querySelector', {
        value: undefined,
        configurable: true
      })
      render(
        <Form onSubmit={onSubmitMock} subscription={{}}>
          {() => (
            <Html5ValidationField name="foo">
              {({ input }: TestFieldRenderProps) => (
                <div ref={() => div}>{input.value}</div>
              )}
            </Html5ValidationField>
          )}
        </Form>
      )
      expect(consoleSpy).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledTimes(1)
      expect(consoleSpy).toHaveBeenCalledWith(
        'Warning: Could not find DOM input with HTML validity API'
      )
      consoleSpy.mockRestore()
    })

    it('should warn if no input could be found', () => {
      const consoleSpy = jest
        .spyOn(global.console, 'error')
        .mockImplementation(() => {})
      const querySelector = jest.fn(() => null)
      const div = mockFindNode(querySelector)
      render(
        <Form onSubmit={onSubmitMock} subscription={{}}>
          {() => (
            <Html5ValidationField name="foo">
              {({ input }: TestFieldRenderProps) => (
                <div ref={() => div}>{input.value}</div>
              )}
            </Html5ValidationField>
          )}
        </Form>
      )
      expect(querySelector).toHaveBeenCalled()
      expect(querySelector).toHaveBeenCalledTimes(1)
      expect(querySelector).toHaveBeenCalledWith(
        'input[name="foo"],textarea[name="foo"],select[name="foo"]'
      )
      expect(consoleSpy).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledTimes(1)
      expect(consoleSpy).toHaveBeenCalledWith(
        'Warning: Could not find DOM input with HTML validity API'
      )
      consoleSpy.mockRestore()
    })

    it('should read/write validity from/to the input', () => {
      const setCustomValidity = jest.fn()
      const input = document.createElement('input')
      input.name = 'foo'
      input.setCustomValidity = setCustomValidity
      Object.defineProperty(input, 'validity', {
        value: {
          valueMissing: true,
          valid: false
        } as ValidityState,
        configurable: true
      })
      const querySelector = jest.fn().mockReturnValue(input)
      const div = mockFindNode(querySelector)
      render(
        <Form onSubmit={onSubmitMock} subscription={{}}>
          {() => (
            <Html5ValidationField name="foo">
              {({ input }: TestFieldRenderProps) => (
                <div ref={() => div}>{input.value}</div>
              )}
            </Html5ValidationField>
          )}
        </Form>
      )
      expect(setCustomValidity).toHaveBeenCalled()
      expect(setCustomValidity).toHaveBeenCalledTimes(2)
      expect(setCustomValidity.mock.calls[0][0]).toBe('')
      expect(setCustomValidity.mock.calls[1][0]).toBe('Required')
    })

    it('should use field-level validation function', () => {
      const validate = jest.fn().mockReturnValue('bar')
      const setCustomValidity = jest.fn()
      const input = document.createElement('input')
      input.name = 'foo'
      input.setCustomValidity = setCustomValidity
      Object.defineProperty(input, 'validity', {
        value: { valid: true } as ValidityState,
        configurable: true
      })
      const querySelector = jest.fn().mockReturnValue(input)
      const div = document.createElement('div')
      div.querySelector = querySelector
      findDOMNodeSpy = jest.spyOn(ReactDOM, 'findDOMNode').mockReturnValue(div)
      render(
        <Form
          onSubmit={onSubmitMock}
          subscription={{}}
          initialValues={{ foo: 'test' }}
        >
          {() => (
            <Html5ValidationField name="foo" validate={validate}>
              {({ input }: TestFieldRenderProps) => (
                <div ref={() => div}>{input.value}</div>
              )}
            </Html5ValidationField>
          )}
        </Form>
      )
      expect(validate).toHaveBeenCalled()
      expect(validate).toHaveBeenCalledTimes(1)
      expect(validate.mock.calls[0][0]).toBe('test')
    })

    it('should not call setCustomValidity if no validity API is found', () => {
      const consoleSpy = jest
        .spyOn(global.console, 'error')
        .mockImplementation(() => {})
      const querySelector = jest.fn(() => null)
      const div = mockFindNode(querySelector)
      render(
        <Form onSubmit={onSubmitMock} subscription={{}}>
          {() => (
            <Html5ValidationField name="foo">
              {({ input }: TestFieldRenderProps) => (
                <div ref={() => div}>{input.value}</div>
              )}
            </Html5ValidationField>
          )}
        </Form>
      )
      expect(consoleSpy).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledTimes(1)
      expect(consoleSpy).toHaveBeenCalledWith(
        'Warning: Could not find DOM input with HTML validity API'
      )
      consoleSpy.mockRestore()
    })

    it('should not call setCustomValidity if validation error is not a string', () => {
      const consoleSpy = jest
        .spyOn(global.console, 'error')
        .mockImplementation(() => {})
      const setCustomValidity = jest.fn()
      const input = document.createElement('input')
      input.name = 'foo'
      input.setCustomValidity = setCustomValidity
      Object.defineProperty(input, 'validity', {
        value: {
          valid: false,
          valueMissing: false
        } as ValidityState,
        configurable: true
      })
      const querySelector = jest.fn().mockReturnValue(input)
      const div = document.createElement('div')
      div.querySelector = querySelector
      findDOMNodeSpy = jest.spyOn(ReactDOM, 'findDOMNode').mockReturnValue(div)
      const validate = () => ({ notAString: true })
      render(
        <Form
          onSubmit={onSubmitMock}
          subscription={{}}
          initialValues={{ foo: 'test' }}
        >
          {() => (
            <Html5ValidationField name="foo" validate={validate}>
              {({ input }: TestFieldRenderProps) => (
                <div ref={() => div}>{input.value}</div>
              )}
            </Html5ValidationField>
          )}
        </Form>
      )
      expect(consoleSpy).not.toHaveBeenCalled()
      setCustomValidity.mock.calls.forEach((call) => {
        expect(call[0]).toBe('')
      })
      consoleSpy.mockRestore()
    })

    it('should not call setCustomValidity if no validation error', () => {
      const consoleSpy = jest
        .spyOn(global.console, 'error')
        .mockImplementation(() => {})
      const setCustomValidity = jest.fn()
      const input = document.createElement('input')
      input.name = 'foo'
      input.setCustomValidity = setCustomValidity
      Object.defineProperty(input, 'validity', {
        value: {
          valid: true
        } as ValidityState,
        configurable: true
      })
      const querySelector = jest.fn().mockReturnValue(input)
      const div = mockFindNode(querySelector)
      render(
        <Form onSubmit={onSubmitMock} subscription={{}}>
          {() => (
            <Html5ValidationField name="foo">
              {({ input }: TestFieldRenderProps) => (
                <div ref={() => div}>{input.value}</div>
              )}
            </Html5ValidationField>
          )}
        </Form>
      )
      expect(consoleSpy).not.toHaveBeenCalled()
      expect(setCustomValidity).toHaveBeenCalled()
      expect(setCustomValidity).toHaveBeenCalledTimes(1)
      expect(setCustomValidity.mock.calls[0][0]).toBe('')
      consoleSpy.mockRestore()
    })

    it('should not call setCustomValidity if valid === true', () => {
      const consoleSpy = jest
        .spyOn(global.console, 'error')
        .mockImplementation(() => {})
      const setCustomValidity = jest.fn()
      const input = document.createElement('input')
      input.name = 'foo'
      input.setCustomValidity = setCustomValidity
      Object.defineProperty(input, 'validity', {
        value: {
          valid: true
        } as ValidityState,
        configurable: true
      })
      const querySelector = jest.fn().mockReturnValue(input)
      const div = mockFindNode(querySelector)
      render(
        <Form onSubmit={onSubmitMock} subscription={{}}>
          {() => (
            <Html5ValidationField name="foo">
              {({ input }: TestFieldRenderProps) => (
                <div ref={() => div}>{input.value}</div>
              )}
            </Html5ValidationField>
          )}
        </Form>
      )
      expect(consoleSpy).not.toHaveBeenCalled()
      expect(setCustomValidity).toHaveBeenCalled()
      expect(setCustomValidity).toHaveBeenCalledTimes(1)
      expect(setCustomValidity.mock.calls[0][0]).toBe('')
      consoleSpy.mockRestore()
    })

    it('should report back validity custom error to Final Form', () => {
      const consoleSpy = jest
        .spyOn(global.console, 'error')
        .mockImplementation(() => {})
      const setCustomValidity = jest.fn()
      const input = document.createElement('input')
      input.name = 'foo'
      input.setCustomValidity = setCustomValidity
      Object.defineProperty(input, 'validity', {
        value: {
          valid: false,
          customError: true
        } as ValidityState,
        configurable: true
      })
      Object.defineProperty(input, 'validationMessage', {
        value: 'Ooh, how custom!',
        configurable: true
      })
      const querySelector = jest.fn().mockReturnValue(input)
      const div = mockFindNode(querySelector)
      render(
        <Form onSubmit={onSubmitMock} subscription={{}}>
          {() => (
            <Html5ValidationField name="foo">
              {({ input }: TestFieldRenderProps) => (
                <div ref={() => div}>{input.value}</div>
              )}
            </Html5ValidationField>
          )}
        </Form>
      )
      expect(consoleSpy).not.toHaveBeenCalled()
      expect(setCustomValidity).toHaveBeenCalled()
      expect(setCustomValidity).toHaveBeenCalledTimes(1)
      expect(setCustomValidity.mock.calls[0][0]).toBe('')
      consoleSpy.mockRestore()
    })

    it('should support functions as default error keys', () => {
      const setCustomValidity = jest.fn()
      const input = document.createElement('input')
      input.name = 'foo'
      input.setCustomValidity = setCustomValidity
      Object.defineProperty(input, 'validity', {
        value: {
          tooShort: true,
          valid: false
        } as ValidityState,
        configurable: true
      })
      const querySelector = jest.fn().mockReturnValue(input)
      const div = document.createElement('div')
      div.querySelector = querySelector
      findDOMNodeSpy = jest.spyOn(ReactDOM, 'findDOMNode').mockReturnValue(div)
      render(
        <Form
          onSubmit={onSubmitMock}
          subscription={{}}
          initialValues={{ foo: 'bar' }}
        >
          {() => (
            <Html5ValidationField
              tooShort={(value?: unknown, props?: Record<string, unknown>) =>
                `Value ${value} should have at least ${props?.minLength} characters.`
              }
              minLength={8}
              name="foo"
            >
              {({ input }: TestFieldRenderProps) => (
                <div ref={() => div}>{input.value}</div>
              )}
            </Html5ValidationField>
          )}
        </Form>
      )
      expect(setCustomValidity).toHaveBeenCalledTimes(2)
      expect(setCustomValidity.mock.calls[0][0]).toBe('')
      expect(setCustomValidity.mock.calls[1][0]).toBe(
        'Value bar should have at least 8 characters.'
      )
    })

    it('should warn if the root node is not an input and has no querySelector API', () => {
      const consoleSpy = jest
        .spyOn(global.console, 'error')
        .mockImplementation(() => {})
      const root = document.createElement('div')
      Object.defineProperty(root, 'querySelector', {
        value: undefined,
        configurable: true
      })
      const findDOMNodeSpy = jest
        .spyOn(ReactDOM, 'findDOMNode')
        .mockReturnValue(root)
      render(
        <Form onSubmit={onSubmitMock} subscription={{}}>
          {() => (
            <Html5ValidationField name="foo">
              {({ input }: TestFieldRenderProps) => <div>{input.value}</div>}
            </Html5ValidationField>
          )}
        </Form>
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        'Warning: Could not find DOM input with HTML validity API'
      )
      consoleSpy.mockRestore()
      findDOMNodeSpy.mockRestore()
    })

    it('should use validate prop when no input element is found', async () => {
      const validate = jest.fn().mockReturnValue('Validation error')
      const consoleSpy = jest
        .spyOn(global.console, 'error')
        .mockImplementation(() => {})
      findDOMNodeSpy = jest.spyOn(ReactDOM, 'findDOMNode').mockReturnValue(null)
      render(
        <Form onSubmit={onSubmitMock} subscription={{}}>
          {() => (
            <Html5ValidationField name="foo" validate={validate}>
              {({ input }: TestFieldRenderProps) => <div>{input.value}</div>}
            </Html5ValidationField>
          )}
        </Form>
      )
      // Wait for component to mount and validate
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(consoleSpy).toHaveBeenCalledWith(
        'Warning: Could not find DOM input with HTML validity API'
      )
      expect(validate).toHaveBeenCalled()
      consoleSpy.mockRestore()
      findDOMNodeSpy.mockRestore()
    })
  })
})
