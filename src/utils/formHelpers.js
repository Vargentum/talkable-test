// @flow
'use strict'
import React, { Component, PropTypes as PT } from 'react'
import { Col, Row, FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap'
import { mapValues, invoke, reduce, isFunction, keys, last } from 'lodash'
import cls from 'classnames'
import { Field } from 'redux-form'

export const smallInputCfg = {
  main: 2, label: 3
}

export const COL_CONFIG = {
  label: { xs: 12, sm: 3, md: 3 },
  main: { xs: 12, sm: 5, md: 6 }
}
const reverseColRatio = (colRatio) => 12 - colRatio
COL_CONFIG.mainReversed = mapValues(COL_CONFIG.main, reverseColRatio)
COL_CONFIG.labelReversed = mapValues(COL_CONFIG.label, reverseColRatio)

export function CompleteField ({
  colConfig = COL_CONFIG,
  label, id, showError, error, showSuccess, success, children,
  required, hidden,
  ...props
}) {
  const formGroupProps = {
    controlId: id,
    key: id
  }
  if (showError) {
    formGroupProps.validationState = 'error'
  } else {
    formGroupProps.validationState = 'success' // color by customer request
  }
  return <FormGroup
    {...formGroupProps}
     // trick: Form still registers appropriate field. Used when value handled by inner component.
    className={cls({
      'util-vsb--0': hidden,
      'util-pos--A': hidden
    })}
  >
    <Row>
      <Col componentClass={ControlLabel} {...COL_CONFIG.label}>
        <span>{label}</span>
        {required && <span className='required'> *</span>}
      </Col>
      <Col {...COL_CONFIG.main}>
        {children}
        {showError && <HelpBlock className='util-t--S'>{error}</HelpBlock>}
        {showSuccess && <HelpBlock className='util-t--S'>{success}</HelpBlock>}
      </Col>
    </Row>
  </FormGroup>
}
CompleteField.propTypes = {
  colConfig: PT.shape({
    main: PT.number,
    label: PT.number
  }),
  label:       PT.oneOfType([PT.node, PT.string]),
  id:          PT.string,
  showError:   PT.bool,
  error:       PT.string,
  showSuccess: PT.bool,
  success:     PT.string,
  children:    PT.oneOfType([PT.node, PT.string]),
  required:    PT.bool,
  hidden:      PT.bool
}

/* -----------------------------
  factory for redux form <Filed component={} /> fulfilling
----------------------------- */
export function createCompleteFieldComponent ({ Cmp = FormControl, fieldProps, required, inputProps }) {
  function CompleteFieldComponent ({ input, meta: { error, touched, asyncValidating } }) {
    return <CompleteField
      showError={error && touched}
      error={error}
      required={required}
      {...fieldProps}
    >
      <Cmp {...inputProps} {...input} />
      {asyncValidating && <span>Validating...</span>}
    </CompleteField>
  }
  CompleteFieldComponent.propTypes = {
    input: PT.object.isRequired,
    meta: PT.shape({
      error:           PT.string,
      touched:         PT.bool,
      asyncValidating: PT.bool
    })
  }
  return CompleteFieldComponent
}

/* -----------------------------
  Redux Form validation in declarative format
----------------------------- */

const makeValidation = (inputValue = '') => (errorString, { validIf, invalidIf, error }) => {
  if (
      (validIf && !validIf(inputValue)) ||
      (invalidIf && invalidIf(inputValue))
    ) {
    return errorString.concat([error])
  } else {
    return errorString
  }
}

// Fill required fiels errors if they are empty
const composeExistyErrors = (fields) => (errors, inputValue, currentFieldKey) => {
  const currentField = fields[currentFieldKey]
  return currentField && currentField.required && !inputValue
    ? { ...errors, [currentFieldKey]: `Field is required` }
    : errors
}

const composeValidationErrors = (fields) => (errors, inputValue, currentFieldKey) => {
  const currentField = fields[currentFieldKey]
  if (currentField && currentField.syncValidation) {
    const fieldErrors = reduce(currentField.syncValidation, makeValidation(inputValue), [])
    if (fieldErrors.length) {
      return {
        ...errors,
        [currentFieldKey]: fieldErrors.join('. ')
      }
    }
  }
  return errors
}

// Populate empty fields in received from redux-form object, to properly validate
const completeFormDataWithFieldsKeys = (formData: Object, keysHolder: Object): Object => {
  return mapValues(keysHolder, (value, key) => formData[key] || '')
}

export const describeErrors = (fields) => (reduxFormData) => {
  const formDataWithAllkeys = completeFormDataWithFieldsKeys(reduxFormData, fields)
  const existanceErrors = reduce(formDataWithAllkeys, composeExistyErrors(fields), {})
  const validationErrors = reduce(formDataWithAllkeys, composeValidationErrors(fields), {})
  return { ...validationErrors, ...existanceErrors }
}

/* -----------------------------
  Async validate builder
----------------------------- */
// export const asyncValidatePhone = (formId): Function =>
//   (values, dispatch, props, blurredField): Promise =>
//     new Promise((resolve, reject) => {
//       dispatch(
//         validatePhone({
//           formId,
//           fieldKey: blurredField,
//           fieldValue: values[blurredField],
//           resolve,
//           reject
//         })
//       )
//     })

/* -----------------------------
  Redux form props Composer
    - sync validatrion,
    - async validation,
    - field props
----------------------------- */
const getAsyncValidationFields = (p, { asyncValidation }, k) =>
  isFunction(asyncValidation) ? { ...p, [k]: asyncValidation } : p

export const genReduxFormProps = (formScheme) => {
  const asyncValidationFields = reduce(formScheme, getAsyncValidationFields, {})
  return {
    fields: keys(formScheme),
    validate: describeErrors(formScheme),
    asyncValidate: (...args) => {
      const blurredField = last(args)
      return invoke(asyncValidationFields, blurredField, ...args)
    },
    asyncBlurFields: keys(asyncValidationFields),
    initialValues: mapValues(formScheme, 'initialValue')
  }
}

/* -----------------------------
  Form Initiator Hoc
    Inject formComponents to underlying form
    - array of inited components through reduxForm Field
----------------------------- */
export function fieldComponentsInjector (scheme) {
  return function (Cmp) {
    return class extends Component {
      componentWillMount () {
        this.initFieldComponents()
      }
      initFieldComponents () {
        this.fieldComponents = mapValues(scheme, fieldComponentsInjector.schemeToFields)
      }
      render () {
        return <Cmp {...this.props} fieldComponents={this.fieldComponents} />
      }
    }
  }
}
fieldComponentsInjector.schemeToFields = schemeToFields

function schemeToFields ({ reduxFieldProps, ...props }, name) {
  return <Field
    {...reduxFieldProps}
    key={name}
    name={name}
    component={createCompleteFieldComponent(props)} />
}

schemeToFields.propTypes = {
  reduxFieldProps: PT.object
}
