import { includes } from 'lodash'

/* -----------------------------
  factory for sagas function `pattern`
  This pattern matches only redux-form actions

  Read more: http://yelouafi.github.io/redux-saga/docs/api/index.html#takepattern
----------------------------- */

export function createReduxFormActionMatcher (actionType, ...formNames) {
  return (action) => {
    if (!action || !action.meta) return false
    return action.type === `redux-form/${actionType}` && includes(formNames, action.meta.form)
  }
}
