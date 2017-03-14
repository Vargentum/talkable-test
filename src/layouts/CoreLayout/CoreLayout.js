import React from 'react'
import Header from '../../components/Header'
import '../../styles/core.styl'

export const CoreLayout = ({ children }) => (
  <div className='container'>
    <Header />
    {children}
  </div>
)

CoreLayout.propTypes = {
  children : React.PropTypes.element.isRequired
}

export default CoreLayout
