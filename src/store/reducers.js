import { combineReducers } from 'redux'
import locationReducer from './location'
import { crudReducer } from 'redux-crud-store'
import { reducer as uiReducer } from 'redux-ui'

export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    location: locationReducer,
    models: crudReducer,
    ui: uiReducer,
    ...asyncReducers
  })
}

export const injectReducer = (store, { key, reducer }) => {
  if (Object.hasOwnProperty.call(store.asyncReducers, key)) return

  store.asyncReducers[key] = reducer
  store.replaceReducer(makeRootReducer(store.asyncReducers))
}

export default makeRootReducer
