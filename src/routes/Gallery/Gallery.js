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

  constructor(props) {
    super(props);
    this.limitImagesByTotalComments = this.limitImagesByTotalComments.bind(this)
    this.RangeSlider = createRangeSlider({initialValue: 0})
  }

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
  limitImagesByTotalComments(limit) {
    const {updateUI, ui: {images, imagesFilters}} = this.props
    updateUI('imagesFilters', R.assoc(
      'byTotalComments',
      R.pipe(R.prop('totalComments'), R.gte(R.__, limit)),
      imagesFilters
    ))
  }
  getFilteredImages() {
    const {ui: {images, imagesFilters}} = this.props
    return R.isEmpty(imagesFilters)
      ? images
      : R.reduce(
          (filtered, filterKey) => R.filter(imagesFilters[filterKey], filtered),
          images,
          R.keys(imagesFilters),
        )
  }
  render() {
    const {ui: {images, isLoading, error, imagesFilters}} = this.props

    return (
      <div>
        <h1>Top commented</h1>
        {isLoading
          ? <h2>Loading...</h2>
          : error
            ? <h2> Error, try again</h2>
            : <div>
                <this.RangeSlider
                  setTitle={(val) => <h3>Current filter: {val}</h3>}
                  onChange={this.limitImagesByTotalComments}
                  max={500}
                  step={10}
                />
                <ImagesList images={this.getFilteredImages()} />
              </div>
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
      images: [],
      imagesFilters: {}
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



/* -----------------------------
  Range slider
----------------------------- */
export function createRangeSlider ({initialValue}) {
  return reduxUi({
    key: 'RangeSlider',
    state: {
      value: initialValue,
    }
  })(RangeSliderUI)
}

function RangeSliderUI ({ui: {value}, updateUI, setTitle, onChange, ...props}) {
  return <div>
    <p><input {...props} type="range" value={value} onChange={({target: {value}}) => {
      updateUI({value: Number(value)})
      onChange(Number(value))
    }} /></p>
    <p>{setTitle(value)}</p>
  </div>
}
