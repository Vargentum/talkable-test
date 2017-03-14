import { applyMiddleware, compose, createStore } from 'redux'
import { browserHistory } from 'react-router'
import makeRootReducer from './reducers'
import { updateLocation } from './location'
import createSagaMiddleware from 'redux-saga'
import runAllSagas from 'utils/runAllSagas'
import { crudSaga, ApiClient } from 'redux-crud-store'
import { API } from 'constants/endpoints'
import { persistStore, autoRehydrate } from 'redux-persist'
import immutableTransform from 'redux-persist-transform-immutable'

export default (initialState = {}) => {
  // ======================================================
  // Middleware Configuration
  // ======================================================
  const sagaMiddleware = createSagaMiddleware()
  const middleware = [
    sagaMiddleware
  ]

  // ======================================================
  // Store Enhancers
  // ======================================================
  const enhancers = [
    autoRehydrate()
  ]

  let composeEnhancers = compose

  if (__DEV__) {
    const composeWithDevToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    if (typeof composeWithDevToolsExtension === 'function') {
      composeEnhancers = composeWithDevToolsExtension
    }
  }

  // ======================================================
  // Store Instantiation and HMR Setup
  // ======================================================
  const store = createStore(
    makeRootReducer(),
    initialState,
    composeEnhancers(
      applyMiddleware(...middleware),
      ...enhancers
    )
  )
  store.asyncReducers = {}

  // To unsubscribe, invoke `store.unsubscribeHistory()` anytime
  store.unsubscribeHistory = browserHistory.listen(updateLocation(store))

  if (module.hot) {
    module.hot.accept('./reducers', () => {
      const reducers = require('./reducers').default
      store.replaceReducer(reducers(store.asyncReducers))
    })
  }

  // ======================================================
  // Redux Sagas & ReduxCrudStore
  // ======================================================
  const client = new ApiClient({ basePath: API })

  runAllSagas(sagaMiddleware.run, { crudSaga: crudSaga(client) })

  // ======================================================
  // Invoke storage persistence
  // ======================================================
  persistStore(store, {
    blacklist: ['router'],
    transforms: [
      immutableTransform({ whitelist: ['models', 'ui'] })
    ]
  })
  // }).purge();

  return store
}
