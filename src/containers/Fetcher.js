'use strict'
import React, { Component } from 'react'
import R from 'ramda'
import { connect } from 'react-redux'
// import { select } from 'redux-crud-store'
/*
Example:
import { crudActions as coursesCrudActions, MODEL as COURSES_MODEL }
  from 'routes/speedreading/Courses/modules/courses'
*/

/* -----------------------------
  Redux-crud-store Fetchers (work with react-redux-crud)
----------------------------- */

export function collectionFetcherFactory (resources, mapStateToProps, mapDispatchToProps) {
  return function collectionFetcher (Cmp) {
    class CollectionFetcher extends Component {

      shouldComponentUpdate (nextProps, nextState) {
        return resources.some(resouceName =>
          nextProps[resouceName] !== this.props[resouceName]
        )
      }
      componentWillMount () {
        R.map(this.fetch(this.props), resources)
      }
      componentWillReceiveProps (nextProps) {
        R.map(this.fetch(nextProps), resources)
      }
      fetch = (props) => (resouceName) => {
        if (props[resouceName] && props[resouceName].needsFetch) {
          props.dispatch(props[resouceName].fetch)
        }
      }
      render () {
        return <Cmp {...this.props} />
      }
    }
    return connect(mapStateToProps, mapDispatchToProps)(CollectionFetcher)
  }
}

/*
Example:
export const LessonFetcher = collectionFetcherFactory(
  [LESSONS_MODEL, EXERCISES_MODEL],
  (state, ownProps) => ({
    [LESSONS_MODEL]: select(lessonsCrudActions.fetchById(ownProps.params.id), state.models),
    [EXERCISES_MODEL]: select(exercisesCrudActions.fetchAll({ lesson_id: ownProps.params.id }), state.models)
  })
)
*/

/* -----------------------------
  Non Redux-crud-store fetchers
----------------------------- */

// function onWillMountDoer (actions) {
//   return function (Cmp) {
//     class Doer extends Component {
//       componentWillMount () {
//         R.map((action, actionName) => this.props[actionName](), actions)
//       }
//       render () {
//         return <Cmp {...this.props} />
//       }
//     }
//     return connect(R.identity({}), actions)(Doer)
//   }
// }

// export const UserFetcher = onWillMountDoer({fetchUser})
