import React from 'react'
import ReactDOM from 'react-dom'
import TestUtils from 'react-dom/test-utils'
import { Form } from 'react-final-form'
import Html5ValidationField from './Html5ValidationField'

const onSubmitMock = () => {}

const getAttributes = el => {
  for (const key in el) {
    if (key.startsWith(`__reactEventHandlers$`)) {
      return el[key]
    }
  }
  return null
}

describe('Html5ValidationField', () => {
  describe('Html5ValidationField.rules', () => {
    const testPassThrough = rule => {
      const consoleSpy = jest
        .spyOn(global.console, 'error')
        .mockImplementation(() => {})
      const dom = TestUtils.renderIntoDocument(
        <Form onSubmit={onSubmitMock} subscription={{}}>
          {() => (
            <Html5ValidationField name="foo" component="input" {...rule} />
          )}
        </Form>
      )
      const input = TestUtils.findRenderedDOMComponentWithTag(dom, 'input')
      expect(input).toBeDefined()
      const attributes = getAttributes(input)
      Object.keys(rule).forEach(key => expect(attributes[key]).toBe(rule[key]))
      consoleSpy.mockRestore()
    }

    it('should pass "required" through to input', () => {
      testPassThrough({ required: true })
    })

    it('should pass "pattern" through to input', () => {
      testPassThrough({ pattern: 'text' })
      testPassThrough({ pattern: 'search' })
      testPassThrough({ pattern: 'url' })
      testPassThrough({ pattern: 'tel' })
      testPassThrough({ pattern: 'email' })
      testPassThrough({ pattern: 'password' })
      testPassThrough({ pattern: /look, ma, a regex!/ })
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

  describe('Html5ValidationField.messages', () => {
    const testNotPassThrough = message => {
      const consoleSpy = jest
        .spyOn(global.console, 'error')
        .mockImplementation(() => {})
      const dom = TestUtils.renderIntoDocument(
        <Form onSubmit={onSubmitMock} subscription={{}}>
          {() => (
            <Html5ValidationField name="foo" component="input" {...message} />
          )}
        </Form>
      )
      const input = TestUtils.findRenderedDOMComponentWithTag(dom, 'input')
      expect(input).toBeDefined()
      const attributes = getAttributes(input)
      Object.keys(message).forEach(key =>
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
    ].forEach(key => {
      it(`should not pass "${key}" through to input`, () => {
        testNotPassThrough({ [key]: 'All your base are belong to us' })
      })
    })
  })
  describe('Html5ValidationField.validity', () => {
    const mockFindNode = (input, fn) => {
      const backup = ReactDOM.findDOMNode
      ReactDOM.findDOMNode = jest.fn(() => input)
      fn()
      expect(ReactDOM.findDOMNode).toHaveBeenCalled()
      expect(ReactDOM.findDOMNode).toHaveBeenCalledTimes(1)
      ReactDOM.findDOMNode = backup
    }

    it('should search DOM for input if the root is not the input', () => {
      const setCustomValidity = jest.fn()
      const querySelector = jest.fn(() => ({
        nodeName: 'input',
        setCustomValidity,
        validity: {
          valueMissing: true
        }
      }))
      mockFindNode(
        {
          nodeName: 'div',
          querySelector
        },
        () => {
          const spy = jest.fn(({ input }) => <input {...input} />)
          TestUtils.renderIntoDocument(
            <Form onSubmit={onSubmitMock} subscription={{}}>
              {() => <Html5ValidationField name="foo" render={spy} />}
            </Form>
          )
          expect(querySelector).toHaveBeenCalled()
          expect(querySelector).toHaveBeenCalledTimes(1)
          expect(querySelector.mock.calls[0][0]).toBe(
            'input[name="foo"],textarea[name="foo"],select[name="foo"]'
          )
        }
      )
    })

    it('should search DOM for input if the root is not the input, even for deep fields', () => {
      const setCustomValidity = jest.fn()
      const querySelector = jest.fn(() => ({
        nodeName: 'input',
        setCustomValidity,
        validity: {
          valueMissing: true
        }
      }))
      mockFindNode(
        {
          nodeName: 'div',
          querySelector
        },
        () => {
          const spy = jest.fn(({ input }) => <input {...input} />)
          TestUtils.renderIntoDocument(
            <Form onSubmit={onSubmitMock} subscription={{}}>
              {() => <Html5ValidationField name="foo.bar" render={spy} />}
            </Form>
          )
          expect(querySelector).toHaveBeenCalled()
          expect(querySelector).toHaveBeenCalledTimes(1)
          expect(querySelector.mock.calls[0][0]).toBe(
            'input[name="foo.bar"],textarea[name="foo.bar"],select[name="foo.bar"]'
          )
        }
      )
    })

    it('should fail silently if no DOM node could be found (probably SSR)', () => {
      const consoleSpy = jest
        .spyOn(global.console, 'error')
        .mockImplementation(() => {})
      mockFindNode(undefined, () => {
        const spy = jest.fn(({ input }) => <input {...input} />)
        TestUtils.renderIntoDocument(
          <Form onSubmit={onSubmitMock} subscription={{}}>
            {() => <Html5ValidationField name="foo" render={spy} />}
          </Form>
        )
        expect(consoleSpy).not.toHaveBeenCalled()
      })
      consoleSpy.mockRestore()
    })

    it('should warn if no input could be found because DOM node has no querySelector API', () => {
      const consoleSpy = jest
        .spyOn(global.console, 'error')
        .mockImplementation(() => {})
      mockFindNode(
        {
          nodeName: 'div'
        },
        () => {
          const spy = jest.fn(({ input }) => <input {...input} />)
          TestUtils.renderIntoDocument(
            <Form onSubmit={onSubmitMock} subscription={{}}>
              {() => <Html5ValidationField name="foo" render={spy} />}
            </Form>
          )

          expect(consoleSpy).toHaveBeenCalled()
          expect(consoleSpy).toHaveBeenCalledTimes(1)
          expect(consoleSpy).toHaveBeenCalledWith(
            'Warning: Could not find DOM input with HTML validity API'
          )
        }
      )
      consoleSpy.mockRestore()
    })
    it('should warn if no input could be found', () => {
      const consoleSpy = jest
        .spyOn(global.console, 'error')
        .mockImplementation(() => {})
      const querySelector = jest.fn(() => {})
      mockFindNode(
        {
          nodeName: 'div',
          querySelector
        },
        () => {
          const spy = jest.fn(({ input }) => <input {...input} />)
          TestUtils.renderIntoDocument(
            <Form onSubmit={onSubmitMock} subscription={{}}>
              {() => <Html5ValidationField name="foo" render={spy} />}
            </Form>
          )
          expect(querySelector).toHaveBeenCalled()
          expect(querySelector).toHaveBeenCalledTimes(1)
          expect(querySelector.mock.calls[0][0]).toBe(
            'input[name="foo"],textarea[name="foo"],select[name="foo"]'
          )

          expect(consoleSpy).toHaveBeenCalled()
          expect(consoleSpy).toHaveBeenCalledTimes(1)
          expect(consoleSpy).toHaveBeenCalledWith(
            'Warning: Could not find DOM input with HTML validity API'
          )
        }
      )
      consoleSpy.mockRestore()
    })

    it('should read/write validity from/to the input', () => {
      const setCustomValidity = jest.fn()
      mockFindNode(
        {
          nodeName: 'input',
          setCustomValidity,
          validity: {
            valueMissing: true
          }
        },
        () => {
          const spy = jest.fn(({ input }) => <input {...input} />)
          TestUtils.renderIntoDocument(
            <Form onSubmit={onSubmitMock} subscription={{}}>
              {() => <Html5ValidationField name="foo" render={spy} />}
            </Form>
          )
          expect(setCustomValidity).toHaveBeenCalled()
          expect(setCustomValidity).toHaveBeenCalledTimes(2)
          expect(setCustomValidity.mock.calls[0][0]).toBe('')
          expect(setCustomValidity.mock.calls[1][0]).toBe('Required')

          expect(spy).toHaveBeenCalled()
          expect(spy).toHaveBeenCalledTimes(2)
          expect(spy.mock.calls[0][0].meta.error).toBeUndefined()
          expect(spy.mock.calls[1][0].meta.error).toBe('Required')
        }
      )
    })

    it('should use field-level validation function', () => {
      const setCustomValidity = jest.fn()
      mockFindNode(
        {
          nodeName: 'input',
          setCustomValidity,
          validity: {
            valueMissing: true
          }
        },
        () => {
          const spy = jest.fn(({ input }) => <input {...input} />)
          const validate = jest.fn(() => 'Special error')
          TestUtils.renderIntoDocument(
            <Form
              onSubmit={onSubmitMock}
              initialValues={{ foo: 'bar' }}
              subscription={{}}
            >
              {() => (
                <Html5ValidationField
                  name="foo"
                  render={spy}
                  validate={validate}
                />
              )}
            </Form>
          )
          expect(validate).toHaveBeenCalled()
          expect(validate).toHaveBeenCalledTimes(1)
          expect(validate.mock.calls[0][0]).toBe('bar')

          expect(setCustomValidity).toHaveBeenCalled()
          expect(setCustomValidity).toHaveBeenCalledTimes(1)
          expect(setCustomValidity.mock.calls[0][0]).toBe('Special error')

          expect(spy).toHaveBeenCalled()
          expect(spy).toHaveBeenCalledTimes(2)
          expect(spy.mock.calls[0][0].meta.error).toBeUndefined()
          expect(spy.mock.calls[1][0].meta.error).toBe('Special error')
        }
      )
    })

    it('should use not call setCustomValidity if no validity API is found', () => {
      const consoleSpy = jest
        .spyOn(global.console, 'error')
        .mockImplementation(() => {})
      mockFindNode(
        {
          nodeName: 'input'
        },
        () => {
          const spy = jest.fn(({ input }) => <input {...input} />)
          const validate = jest.fn(() => 'Special error')
          TestUtils.renderIntoDocument(
            <Form
              onSubmit={onSubmitMock}
              initialValues={{ foo: 'bar' }}
              subscription={{}}
            >
              {() => (
                <Html5ValidationField
                  name="foo"
                  render={spy}
                  validate={validate}
                />
              )}
            </Form>
          )
          expect(consoleSpy).toHaveBeenCalled()
          expect(consoleSpy).toHaveBeenCalledTimes(1)
          expect(consoleSpy).toHaveBeenCalledWith(
            'Warning: Could not find DOM input with HTML validity API'
          )

          expect(validate).toHaveBeenCalled()
          expect(validate).toHaveBeenCalledTimes(1)
          expect(validate.mock.calls[0][0]).toBe('bar')

          expect(spy).toHaveBeenCalled()
          expect(spy).toHaveBeenCalledTimes(2)
          expect(spy.mock.calls[0][0].meta.error).toBeUndefined()
          expect(spy.mock.calls[1][0].meta.error).toBe('Special error')
          consoleSpy.mockRestore()
        }
      )
    })

    it('should use not call setCustomValidity if validation error is not a string', () => {
      const consoleSpy = jest
        .spyOn(global.console, 'error')
        .mockImplementation(() => {})
      const setCustomValidity = jest.fn()
      mockFindNode(
        {
          nodeName: 'input',
          setCustomValidity,
          validity: {
            valueMissing: true
          }
        },
        () => {
          const spy = jest.fn(({ input }) => <input {...input} />)
          const validate = jest.fn(() => ({ deep: 'Special error' }))
          TestUtils.renderIntoDocument(
            <Form
              onSubmit={onSubmitMock}
              initialValues={{ foo: 'bar' }}
              subscription={{}}
            >
              {() => (
                <Html5ValidationField
                  name="foo"
                  render={spy}
                  validate={validate}
                />
              )}
            </Form>
          )
          expect(consoleSpy).not.toHaveBeenCalled()

          expect(validate).toHaveBeenCalled()
          expect(validate).toHaveBeenCalledTimes(1)
          expect(validate.mock.calls[0][0]).toBe('bar')

          expect(spy).toHaveBeenCalled()
          expect(spy).toHaveBeenCalledTimes(2)
          expect(spy.mock.calls[0][0].meta.error).toBeUndefined()
          expect(spy.mock.calls[1][0].meta.error).toEqual({
            deep: 'Special error'
          })
          consoleSpy.mockRestore()
        }
      )
    })

    it('should use not call setCustomValidity if no validation error', () => {
      const consoleSpy = jest
        .spyOn(global.console, 'error')
        .mockImplementation(() => {})
      const setCustomValidity = jest.fn()
      mockFindNode(
        {
          nodeName: 'input',
          setCustomValidity,
          validity: {}
        },
        () => {
          const spy = jest.fn(({ input }) => <input {...input} />)
          const validate = jest.fn(() => {})
          TestUtils.renderIntoDocument(
            <Form
              onSubmit={onSubmitMock}
              initialValues={{ foo: 'bar' }}
              subscription={{}}
            >
              {() => (
                <Html5ValidationField
                  name="foo"
                  render={spy}
                  validate={validate}
                />
              )}
            </Form>
          )
          expect(consoleSpy).not.toHaveBeenCalled()

          expect(validate).toHaveBeenCalled()
          expect(validate).toHaveBeenCalledTimes(1)
          expect(validate.mock.calls[0][0]).toBe('bar')

          expect(setCustomValidity).toHaveBeenCalled()
          expect(setCustomValidity).toHaveBeenCalledTimes(2)
          expect(setCustomValidity.mock.calls[0][0]).toBe('')
          expect(setCustomValidity.mock.calls[1][0]).toBeUndefined()

          expect(spy).toHaveBeenCalled()
          expect(spy).toHaveBeenCalledTimes(1)
          expect(spy.mock.calls[0][0].meta.error).toBeUndefined()
          consoleSpy.mockRestore()
        }
      )
    })

    it('should use not call setCustomValidity if valid === true', () => {
      const consoleSpy = jest
        .spyOn(global.console, 'error')
        .mockImplementation(() => {})
      const setCustomValidity = jest.fn()
      mockFindNode(
        {
          nodeName: 'input',
          setCustomValidity,
          validity: { valid: true }
        },
        () => {
          const spy = jest.fn(({ input }) => <input {...input} />)
          TestUtils.renderIntoDocument(
            <Form
              onSubmit={onSubmitMock}
              initialValues={{ foo: 'bar' }}
              subscription={{}}
            >
              {() => <Html5ValidationField name="foo" render={spy} />}
            </Form>
          )
          expect(consoleSpy).not.toHaveBeenCalled()

          expect(setCustomValidity).toHaveBeenCalled()
          expect(setCustomValidity).toHaveBeenCalledTimes(1)
          expect(setCustomValidity.mock.calls[0][0]).toBe('')

          expect(spy).toHaveBeenCalled()
          expect(spy).toHaveBeenCalledTimes(1)
          expect(spy.mock.calls[0][0].meta.error).toBeUndefined()
          consoleSpy.mockRestore()
        }
      )
    })

    it('should report back validity custom error to Final Form', () => {
      const consoleSpy = jest
        .spyOn(global.console, 'error')
        .mockImplementation(() => {})
      const setCustomValidity = jest.fn()
      mockFindNode(
        {
          nodeName: 'input',
          setCustomValidity,
          validity: { valid: false, customError: 'Ooh, how custom!' }
        },
        () => {
          const spy = jest.fn(({ input }) => <input {...input} />)
          TestUtils.renderIntoDocument(
            <Form
              onSubmit={onSubmitMock}
              initialValues={{ foo: 'bar' }}
              subscription={{}}
            >
              {() => <Html5ValidationField name="foo" render={spy} />}
            </Form>
          )
          expect(consoleSpy).not.toHaveBeenCalled()

          expect(setCustomValidity).toHaveBeenCalled()
          expect(setCustomValidity).toHaveBeenCalledTimes(1)
          expect(setCustomValidity.mock.calls[0][0]).toBe('')

          expect(spy).toHaveBeenCalled()
          expect(spy).toHaveBeenCalledTimes(2)
          expect(spy.mock.calls[0][0].meta.error).toBeUndefined()
          expect(spy.mock.calls[1][0].meta.error).toBe('Ooh, how custom!')
          consoleSpy.mockRestore()
        }
      )
    })
      it('should support functions as default error keys', () => {
        const setCustomValidity = jest.fn()
        mockFindNode(
            {
                nodeName: 'input',
                setCustomValidity,
                validity: {
                    tooShort: true
                }
            },
            () => {
              const spy = jest.fn(({ input }) => <input {...input} />)
              TestUtils.renderIntoDocument(
                <Form initialValues={{ foo: 'bar' }} onSubmit={onSubmitMock} subscription={{}}>
                  {() =>
                      <Html5ValidationField
                          tooShort={(value, { minLength }) =>
                              `Value ${value} should have at least ${minLength} characters.`}
                          minLength={8} name="foo" render={spy} />
                  }
                </Form>
              )
              expect(spy).toHaveBeenCalled()
              expect(spy).toHaveBeenCalledTimes(2)
              expect(spy.mock.calls[1][0].meta.error).toBe('Value bar should have at least 8 characters.')
            }
        )
      })
  })

})
