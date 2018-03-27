<img src="html5.png" align="right"/>

# 🏁 React Final Form HTML5 Validation

[![NPM Version](https://img.shields.io/npm/v/react-final-form-html5-validation.svg?style=flat)](https://www.npmjs.com/package/react-final-form-html5-validation)
[![NPM Downloads](https://img.shields.io/npm/dm/react-final-form-html5-validation.svg?style=flat)](https://www.npmjs.com/package/react-final-form-html5-validation)
[![Build Status](https://travis-ci.org/final-form/react-final-form-html5-validation.svg?branch=master)](https://travis-ci.org/final-form/react-final-form-html5-validation)
[![codecov.io](https://codecov.io/gh/final-form/react-final-form-html5-validation/branch/master/graph/badge.svg)](https://codecov.io/gh/final-form/react-final-form-html5-validation)

---

🏁 React Final Form HTML5 Validation is swappable replacement for [🏁 React Final Form](https://github.com/final-form/react-final-form#-react-final-form)'s `Field` component that provides two-way HTML5 Validation bindings. The bindings are two-way because any [HTML5 contraint validation errors](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#the-constraint-validation-api) will be added to the 🏁 Final Form state, and any _field-level_ validation errors from 🏁 Final Form will be set into the HTML5 `validity.customError` state. Unfortunately, this functionality is not compatible with 🏁 React Final Form _record-level_ validation, so the two should not be mixed.

### Why not add this functionality directly into the officially bundled `Field` component?

Good question. The reason is that not everyone needs this functionality, and not everyone is using 🏁 React Final Form with the DOM (e.g. some people use it with React Native). Therefore it makes sense to make this a separate package. This version of `Field` is a thin wrapper over the official `Field` component, and the only `Field` API that this library uses/overrides is the field-level [`validate` prop](https://github.com/final-form/react-final-form#validate-value-any-allvalues-object--any), so even if you are using this library's `Field` component, you will still get improvements as features are added to the 🏁 React Final Form library in the future.

## Installation

```bash
npm install --save react-final-form-html5-validation react-final-form final-form
```

or

```bash
yarn add react-final-form-html5-validation react-final-form final-form
```

## [Example](https://codesandbox.io/s/14r018yjp4) 👀

## Usage

The way you specify rules and error messages in HTML5 is by giving first a rule prop, e.g. `required`, `min`, `maxLength`, and then an error message prop, e.g. `valueMissing`, `rangeUnderflow`, or `tooLong`, respectively. This library comes with built-in English defaults for the error messages, but you will probably want to override those by passing in your own.

```jsx
import { Form } from 'react-final-form'
import { Field } from 'react-final-form-html5-validation'

const MyForm = () => (
  <Form
    onSubmit={onSubmit}
    render={({ handleSubmit, pristine, invalid }) => (
      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name</label>
          <Field
            name="firstName"
            component="input"
            type="text"
            placeholder="First Name"
            required
            maxLength={20}
            tooLong="That name is too long!"
            pattern={/}
          />
        </div>
        ...
      </form>
    )}
  />
)
```

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

* [Rules and Messages](#rules-and-messages)
* [API](#api)
  * [Rules](#rules)
    * [`max?: Number`](#max-number)
    * [`maxLength?: Number`](#maxlength-number)
    * [`min?: Number`](#min-number)
    * [`minLength?: Number`](#minlength-number)
    * [`pattern?: string`](#pattern-string)
    * [`required?: boolean`](#required-boolean)
    * [`step?: Number`](#step-number)
  * [Messages](#messages)
    * [`badInput?: string`](#badinput-string)
    * [`patternMismatch?: string`](#patternmismatch-string)
    * [`rangeOverflow?: string`](#rangeoverflow-string)
    * [`rangeUnderflow?: string`](#rangeunderflow-string)
    * [`stepMismatch?: string`](#stepmismatch-string)
    * [`tooLong?: string`](#toolong-string)
    * [`tooShort?: string`](#tooshort-string)
    * [`typeMismatch?: string`](#typemismatch-string)
    * [`valueMissing?: string`](#valuemissing-string)
* [Internationalization](#internationalization)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Rules and Messages

These all come from the [HTML Standard](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#the-constraint-validation-api).

| Rule                                                                                                     | Value     | Message           | Meaning                                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------- | --------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|                                                                                                          |           | `badInput`        | [The value is invalid somehow](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#suffering-from-bad-input)                             |
| [`max`](https://html.spec.whatwg.org/multipage/input.html#attr-input-max)                                | `Number`  | `rangeOverflow`   | [The value is too high](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#suffering-from-an-overflow)                                  |
| [`maxLength`](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#attr-fe-maxlength) | `Number`  | `tooLong`         | [The value is too long](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#suffering-from-being-too-long)                               |
| [`min`](https://html.spec.whatwg.org/multipage/input.html#attr-input-min)                                | `Number`  | `rangeUnderflow`  | [The value is too small](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#suffering-from-an-underflow)                                |
| [`minLength`](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#attr-fe-minlength) | `Number`  | `tooShort`        | [The value is too short](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#suffering-from-being-too-short)                             |
| [`pattern`](https://html.spec.whatwg.org/multipage/input.html#attr-input-pattern)                        | `string`  | `patternMismatch` | [The value does not match the regular expression](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#suffering-from-a-pattern-mismatch) |
| [`required`](https://html.spec.whatwg.org/multipage/input.html#the-required-attribute)                   | `boolean` | `valueMissing`    | [The value is missing](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#suffering-from-being-missing)                                 |
| [`step`](https://html.spec.whatwg.org/multipage/input.html#attr-input-step)                              | `Number`  | `stepMismatch`    | [The value does not match the step granularity](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#suffering-from-a-step-mismatch)      |
|                                                                                                          |           | `typeMismatch`    | [The value does not match the specified `type`](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#suffering-from-a-type-mismatch)      |

## API

In addition to all the [`FieldProps`](https://github.com/final-form/react-final-form#fieldprops) that you can pass to the standard `Field`, to an HTML5 Validation `Field`, you may also pass:

### Rules

#### `max?: Number`

The maximum value allowed as the value for the input. If invalid, the `rangeOverflow` error will be displayed.

#### `maxLength?: Number`

The maximum length allowed of the input value. If invalid, the `tooLong` error will be displayed.

#### `min?: Number`

The minimum value allowed as the value for the input. If invalid, the `rangeUnderflow` error will be displayed.

#### `minLength?: Number`

The minimum length allowed of the input value. If invalid, the `tooShort` error will be displayed.

#### `pattern?: string`

A string regular expression to test the input value against. If invalid, the `patternMismatch` error will be displayed.

#### `required?: boolean`

Whether or not the field is required. If invalid, the `valueMissing` error will be displayed.

#### `step?: Number`

The step size between the `min` and `max` values. If invalid, the `stepMismatch` error will be displayed.

### Messages

#### `badInput?: string`

The message to display [when the input is invalid somehow](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#suffering-from-bad-input).

#### `patternMismatch?: string`

The message to display when the value does not match the pattern specified by the `pattern` prop.

#### `rangeOverflow?: string`

The message to display when the value is higher than the `max` prop.

#### `rangeUnderflow?: string`

The message to display when the value is lower than the `min` prop.

#### `stepMismatch?: string`

The message to display the value is not one of the valid steps specified by the `step` prop.

#### `tooLong?: string`

The message to display when the value longer than the value specified by the `maxLength` prop.

#### `tooShort?: string`

The message to display when the value shorter than the value specified by the `minLength` prop.

#### `typeMismatch?: string`

The message to display when the value does not match the `type` prop.

#### `valueMissing?: string`

The message to display when the value is required, but missing.

## Internationalization

If internationalization is important to your project, you should probably create a component that wraps this component. Pulls the localized messages from the context, and renders:

```jsx
<Field {...props} {...messages} />
```
