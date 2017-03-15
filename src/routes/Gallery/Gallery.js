'use strict'
import React, { Component, PropTypes as PT } from 'react'
import R from 'ramda'
import {Row, Col, Thumbnail} from 'react-bootstrap'
import reduxUi from 'redux-ui'
import {mapRender} from 'utils/helpers'
import apiClient from 'utils/apiClient'

export class Gallery extends Component {
  static propTypes = {}
  static defaultProps = {}

  componentDidMount () {
    this.loadImages()
  }

  loadImages() {
    const {updateUI} = this.props
    updateUI('isLoading', true)
    apiClient.getGalleryImages()
      .then((data) => {
        updateUI({isLoading: false, images: Gallery.getImagesFromAPIResponse(data)})
      })
      .catch((err) => {
        updateUI({error: true})
        throw err
      })
  }

  render() {
    const {ui: {images, isLoading, error}} = this.props

    return (
      <div>
        <h1>Top commented</h1>
        {isLoading
          ? <h2>Loading...</h2>
          : error
            ? <h2> Error, try again</h2>
            : <ImagesList images={images} />
        }
      </div>
    )
  }
}

Gallery.getImagesFromAPIResponse = R.pipe(
  R.path(['data', 'data', 'children']),
  R.map(({data: {thumbnail, title, num_comments, permalink}}) => ({
    image: thumbnail,
    title,
    totalComments: num_comments,
    link: permalink
  }))
)


export default R.pipe(
  reduxUi({
    key: 'Gallery',
    state: {
      isLoading: false,
      error: null,
      images: []
    }
  })
)(Gallery)



/* -----------------------------
  UI
----------------------------- */
export function ImagesList ({images}) {
  return <Row>
    {R.map(mapRender(Image), images)}
  </Row>
}

export function Image ({image, title, totalComments, link}) {
  return <Col md={3}>
    <Thumbnail src={image} alt="250x200">
      <h3>{title}</h3>
      <p>Number of comments {totalComments}</p>
      <p><a href={link}>Link</a></p>
    </Thumbnail>
  </Col>
}
