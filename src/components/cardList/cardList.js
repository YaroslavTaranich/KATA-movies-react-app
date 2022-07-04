import React, { Component } from 'react'
import { Row, Spin, Alert } from 'antd'
import _ from 'lodash'

import './cardlist.css'
import MoviesServise from '../../services/MoviesServise'
import MovieCard from '../movieCard/movieCard'

export default class CardList extends Component {
  constructor(props) {
    super(props)
    this.moviesServise = new MoviesServise()
    this.state = {
      status: 'loading',
      data: null,
    }

    this.onLoading = () => {
      this.setState({
        status: 'loading',
      })
    }

    this.onError = () => {
      this.setState({
        status: 'error',
      })
    }

    this.onMoviesLoaded = ({ movies, totalResults }) => {
      const { totalResultsHandler } = this.props
      totalResultsHandler(totalResults)
      if (totalResults === 0) {
        this.setState({
          data: null,
          status: 'noresults',
        })
      } else {
        this.setState({ data: movies, status: 'ok' })
      }
    }

    this.fetchData = () => {
      const { pageNumber, searchQuery } = this.props
      this.onLoading()
      this.moviesServise
        .searchMovie(pageNumber, searchQuery || 'return')
        .then(this.onMoviesLoaded)
        .catch(this.onError)
    }
    this.debounceFetchData = _.debounce(() => {
      const { paginationHandler } = this.props
      this.fetchData()
      paginationHandler(1)
    }, 500)

    this.renderMovieCards = () => {
      const { data } = this.state
      return data.map((movie) => {
        const { id, title, releaseDate, description, posterSrc, gendersIds, voteAverage } = movie
        return (
          <MovieCard
            key={id}
            title={title}
            date={releaseDate}
            description={description}
            src={posterSrc}
            genreIds={gendersIds}
            voteAverage={voteAverage}
          />
        )
      })
    }
  }

  componentDidMount() {
    this.fetchData()
  }

  componentDidUpdate(prevProps) {
    const { pageNumber, searchQuery } = this.props
    if (pageNumber !== prevProps.pageNumber) {
      this.fetchData()
    }
    if (searchQuery !== prevProps.searchQuery) {
      this.debounceFetchData()
    }
  }

  render() {
    const { status } = this.state
    const { searchQuery } = this.props
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
      default:
        content = <Row gutter={[32, 32]}>{this.renderMovieCards()}</Row>
    }

    return <section className="card-list">{content}</section>
  }
}
