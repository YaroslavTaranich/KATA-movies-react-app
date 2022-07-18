import React, { Component } from 'react'
import { PropTypes } from 'prop-types'
import { Row, Spin, Alert, Button, Space } from 'antd'
import _ from 'lodash'

import './cardlist.css'
import MoviesServise from '../../services/MoviesServise'
import MovieCard from '../movieCard/movieCard'

export default class CardList extends Component {
  debounceGetMovies = _.debounce(() => {
    const { paginationHandler } = this.props
    this.getMovies()
    paginationHandler(1)
  }, 500)

  constructor(props) {
    super(props)
    this.moviesServise = new MoviesServise()
    this.state = {
      status: 'loading',
      movies: null,
      ratedMovies: {},
      ratingError: false,
      resizeHelper: null,
    }
  }

  componentDidMount() {
    this.getMovies()
    window.addEventListener('resize', this.onResize)
  }

  componentDidUpdate(prevProps) {
    const { pageNumber, searchQuery, selectedTab, guestSessionId } = this.props
    if (pageNumber !== prevProps.pageNumber && selectedTab === prevProps.selectedTab) {
      if (selectedTab === 'search') this.getMovies()
      if (selectedTab === 'rated') this.getRaitedMovies()
    }
    if (searchQuery !== prevProps.searchQuery && selectedTab === 'search') {
      this.debounceGetMovies()
    }
    if (selectedTab !== prevProps.selectedTab) {
      if (selectedTab === 'rated') {
        this.debounceGetMovies.cancel()
        this.getRaitedMovies()
      }
      if (selectedTab === 'search') this.getMovies()
    }
    if (guestSessionId !== prevProps.guestSessionId) {
      this.moviesServise.getAllMoviesRatingGuestSession(guestSessionId).then((res) => {
        this.setState({ ratedMovies: res })
      })
    }
  }

  componentDidCatch() {
    this.onError()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize)
  }

  onLoading = () => {
    this.setState({
      status: 'loading',
    })
  }

  onError = () => {
    this.setState({
      status: 'error',
    })
  }

  onMoviesLoaded = ({ movies, totalResults }) => {
    const { totalResultsHandler, selectedTab } = this.props
    totalResultsHandler(totalResults)
    if (totalResults === 0) {
      this.setState({
        movies: null,
        status: selectedTab === 'search' ? 'noresults' : 'norated',
      })
    } else {
      this.setState({ movies, status: 'ok' })
    }
  }

  getMovies = () => {
    const { pageNumber, searchQuery } = this.props
    this.onLoading()
    if (searchQuery) {
      this.moviesServise.searchMovie(pageNumber, searchQuery).then(this.onMoviesLoaded).catch(this.onError)
    } else {
      this.moviesServise.getPopularMovie(pageNumber).then(this.onMoviesLoaded).catch(this.onError)
    }
  }

  getRaitedMovies = () => {
    const { pageNumber, guestSessionId } = this.props
    this.onLoading()
    this.moviesServise
      .getRatedMoviesGuestSession(guestSessionId, pageNumber)
      .then(this.onMoviesLoaded)
      .catch(this.onError)
  }

  renderMovieCards = () => {
    const {
      movies: { allIds, byId },
      ratedMovies,
      resizeHelper,
    } = this.state
    return allIds.map((id) => {
      const { title, releaseDate, description, posterSrc, genresIds, voteAverage } = byId[id]
      return (
        <MovieCard
          key={id}
          id={id}
          title={title}
          date={releaseDate}
          description={description}
          src={posterSrc}
          genresIds={genresIds}
          voteAverage={voteAverage}
          movieRatingHandler={this.movieRatingHandler}
          ratedMovies={ratedMovies}
          resizeHelper={resizeHelper}
        />
      )
    })
  }

  setRating = (movieId, rating, error) => {
    this.setState(({ ratedMovies }) => ({
      ratingError: error,
      ratedMovies: { ...ratedMovies, ...{ [movieId]: rating } },
    }))
  }

  movieRatingHandler = (movieId, rating) => {
    const { guestSessionId } = this.props
    this.setRating(movieId, rating, false)
    this.moviesServise.setRatingGuest(guestSessionId, movieId, rating).catch(() => {
      this.setRating(movieId, 0, true)
    })
  }

  onResize = (e) => {
    const width = e.target.innerWidth
    if (width < 1050) {
      _.debounce(() => {
        this.setState({ resizeHelper: e.target.innerWidth })
      }, 500)()
    }
  }

  render() {
    const { status, ratingError } = this.state
    const { searchQuery, selectedTabHandler } = this.props

    const ratingWarning = ratingError ? (
      <Alert
        className="warning"
        message="Can't set rating for a movie"
        description="Try again later"
        type="warning"
        showIcon
        closable
      />
    ) : null

    let content

    switch (status) {
      case 'error':
        content = (
          <Alert
            message="Oops... something went wrong"
            description="Can't get movies, please try again leter"
            type="error"
            showIcon
          />
        )
        break
      case 'loading':
        content = <Spin size="large" />
        break
      case 'noresults':
        content = (
          <Alert
            message={`Can't find movies for "${searchQuery}"`}
            description="Try a different search term"
            type="warning"
            showIcon
          />
        )
        break
      case 'norated':
        content = (
          <Space size="middle" direction="vertical" align="center">
            <Alert message="Can't find rated movies" description="Find and rate some!" type="warning" showIcon />
            <Button size="large" type="primary" onClick={() => selectedTabHandler('search')}>
              To search!
            </Button>
          </Space>
        )
        break
      default:
        content = <Row gutter={[{ md: 32 }, { xs: 20, sm: 24, md: 32 }]}>{this.renderMovieCards()}</Row>
    }

    return (
      <>
        {ratingWarning}
        <section className="card-list">{content}</section>
      </>
    )
  }
}

CardList.defaultProps = {
  guestSessionId: null,
}

CardList.propTypes = {
  guestSessionId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  pageNumber: PropTypes.number.isRequired,
  searchQuery: PropTypes.string.isRequired,
  selectedTab: PropTypes.string.isRequired,
  paginationHandler: PropTypes.func.isRequired,
  selectedTabHandler: PropTypes.func.isRequired,
  totalResultsHandler: PropTypes.func.isRequired,
}
