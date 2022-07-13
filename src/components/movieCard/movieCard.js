import React, { Component } from 'react'
import { PropTypes } from 'prop-types'
import './movieCard.css'
import { Col, Rate, Image } from 'antd'
import { format } from 'date-fns'

import GenresContext from '../genresContext'

import noImage from './no-image.webp'

function getGenresNames(ids, genres) {
  if (!ids || !genres) return null

  return ids.map((id) => {
    const key = `genre-${genres[id]}`
    return (
      <span key={key} className="genre">
        {genres[id]}
      </span>
    )
  })
}

function ratingColor(rate) {
  let color = '#66E900'
  if (rate <= 3) color = '#E90000'
  if (rate > 3 && rate <= 5) color = '#E97E00'
  if (rate > 5 && rate <= 7) color = '#E9D100'
  return {
    borderColor: color,
  }
}

function trimDescription(description, cardRef, headerRef, descriptionRef) {
  const cardHeight = cardRef.current.offsetHeight
  const headerHeight = headerRef.current.offsetHeight
  const descriptionWidth = descriptionRef.current.offsetWidth

  const maxHeight = cardHeight - (headerHeight + 90)

  const k = descriptionWidth > 300 ? 4 : 5.5

  const letersPerLine = Math.floor(descriptionWidth / k)

  const trimLength = Math.floor(letersPerLine * (maxHeight / 22))

  if (trimLength < 0) return null
  if (description.length < trimLength) return description
  const trimed = description.slice(0, trimLength).split(' ')
  trimed.pop()
  return [...trimed, '...'].join(' ')
}

export default class MovieCard extends Component {
  constructor(props) {
    super(props)

    this.imgBase = 'https://image.tmdb.org/t/p/w500'

    this.cardRef = React.createRef()
    this.headerRef = React.createRef()
    this.descriptionRef = React.createRef()

    this.state = {
      trimedDescription: null,
    }
  }

  componentDidMount() {
    this.setState({
      trimedDescription: null,
    })
    this.oldContext = null
  }

  componentDidUpdate(prevProps) {
    const { resizeHelper, description } = this.props

    if (resizeHelper !== prevProps.resizeHelper) {
      this.setState({
        trimedDescription: trimDescription(description, this.cardRef, this.headerRef, this.descriptionRef),
      })
    }
    if (this.oldContext !== this.context) {
      this.oldContext = this.context
      this.setState({
        trimedDescription: trimDescription(description, this.cardRef, this.headerRef, this.descriptionRef),
      })
    }
  }

  render() {
    const { id, src, title, date, voteAverage, genresIds, movieRatingHandler, ratedMovies } = this.props
    const { trimedDescription } = this.state

    const image = src ? this.imgBase + src : noImage

    const formatedDate = date ? <div className="movie_card__date">{format(new Date(date), 'PP')}</div> : null

    return (
      <GenresContext.Consumer>
        {(genresList) => (
          <Col md={12} xs={24}>
            <div className="movie-card" ref={this.cardRef}>
              <div className="movie-card__img-wrapper">
                <Image src={image} alt={title} width="100%" preview={Boolean(src)} />
              </div>
              <div className="movie-card__info">
                <header className="movie-card__header" ref={this.headerRef}>
                  <h5 className="movie-card__title">{title}</h5>
                  {formatedDate}
                  <div className="movie-card__genres">{getGenresNames(genresIds, genresList)} </div>
                </header>

                <div className="movie-card__description" ref={this.descriptionRef}>
                  {trimedDescription}
                </div>
                <Rate
                  className="movie-card__stars"
                  allowHalf
                  value={ratedMovies[id]}
                  count={10}
                  onChange={(v) => movieRatingHandler(id, v)}
                />
                <div className="movie-card__rate" style={ratingColor(voteAverage)}>
                  {voteAverage}
                </div>
              </div>
            </div>
          </Col>
        )}
      </GenresContext.Consumer>
    )
  }
}

MovieCard.contextType = GenresContext

MovieCard.defaultProps = {
  resizeHelper: null,
  date: '',
  src: '',
}

MovieCard.propTypes = {
  id: PropTypes.number.isRequired,
  src: PropTypes.string,
  title: PropTypes.string.isRequired,
  date: PropTypes.string,
  voteAverage: PropTypes.number.isRequired,
  genresIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  movieRatingHandler: PropTypes.func.isRequired,
  ratedMovies: PropTypes.objectOf(PropTypes.number).isRequired,
  resizeHelper: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
}
