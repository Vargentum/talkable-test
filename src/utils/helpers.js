'use strict'
import React from 'react'
import R from 'ramda'
import { uniqueId } from 'lodash'

export const mapRender = (Component, customProps = {}) => (props, idx) =>
  <Component
    key={uniqueId(Component.name)}
    {...{ ...props, ...customProps }} />

export const implementMe = () => alert('Not Implemented!')

// Hint: explicitly pass `null` if bind, to prevent `event passing`
export function setStateFor (key, value) {
  if (!this.state || !this.setState) throw new Error(`Seems ${this} isn't a statefull React Component`)
  if (this.state[key] === undefined) throw new Error(`There is no key ${key} in Component's state`)
  this.setState({
    [key]: value || !this.state[key]
  })
}

/* -----------------------------
  Path helpers
----------------------------- */
export const trimPathLeft = (path) => path.slice(1)

export const composeRelativePath = (...pathes) => pathes
  .map(path => R.head(path) === '/' ? trimPathLeft(path) : path)
  .join('/')

export const composeAbsolutePath = (...pathes) => '/' + composeRelativePath(...pathes)

