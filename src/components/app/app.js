import { Component } from 'react'
import 'antd/dist/antd.min.css'
import { Alert, Pagination } from 'antd'
import { Offline } from 'react-detect-offline'

import './app.css'
import CardList from '../cardList/cardList'
import Header from '../header'
import MoviesServise from '../../services/MoviesServise'
import GenresContext from '../genresContext'

export default class App extends Component {
  constructor() {
    super()

    this.moviesServise = new MoviesServise()

    this.state = {
      pageNumber: 1,
      totalResults: 0,
      searchQuery: '',
      selectedTab: 'search',
      guestSessionId: null,
      genresList: null,
      isError: false,
    }
  }

  componentDidMount() {
    this.moviesServise.getGenres().then((genres) => {
      this.genresListHandler(genres)
    })

    this.moviesServise.setGuestSesion().then((id) => {
      this.guestSessionIdHandler(id)
    })
  }

  componentDidCatch() {
    this.setState({ isError: true })
  }

  makeHandler = (entery, value) => {
    this.setState({
      [entery]: value,
    })
  }

  paginationHandler = (pageNumber) => this.makeHandler('pageNumber', pageNumber)

  totalResultsHandler = (count) => this.makeHandler('totalResults', count)

  inputHandler = (value) => this.makeHandler('searchQuery', value)

  selectedTabHandler = (value) => this.makeHandler('selectedTab', value)

  genresListHandler = (obj) => this.makeHandler('genresList', obj)

  guestSessionIdHandler = (id) => this.makeHandler('guestSessionId', id)

  render() {
    const { pageNumber, totalResults, searchQuery, selectedTab, guestSessionId, genresList, isError } = this.state

    if (isError) {
      return (
        <Alert
          className="error"
          message="Oops... something went wrong"
          description="Fatal error, try again later"
          type="error"
          showIcon
        />
      )
    }

    return (
      <div className="app">
        <Header
          inputHandler={this.inputHandler}
          inputValue={searchQuery}
          selectedTabHandler={this.selectedTabHandler}
          selectedTab={selectedTab}
          paginationHandler={this.paginationHandler}
          pageNumber={pageNumber}
        />
        <Offline>
          <Alert
            type="warning"
            message="Oops.. "
            description="Problems with internet connection"
            showIcon
            className="warning"
          />
        </Offline>
        <GenresContext.Provider value={genresList}>
          <CardList
            pageNumber={pageNumber}
            paginationHandler={this.paginationHandler}
            totalResultsHandler={this.totalResultsHandler}
            searchQuery={searchQuery}
            guestSessionId={guestSessionId}
            selectedTab={selectedTab}
            selectedTabHandler={this.selectedTabHandler}
          />
        </GenresContext.Provider>
        <Pagination
          className="pagination"
          current={pageNumber}
          onChange={(num) => this.paginationHandler(num)}
          total={Math.min(totalResults, 500 * 20)}
          pageSize={20}
          hideOnSinglePage
        />
      </div>
    )
  }
}
