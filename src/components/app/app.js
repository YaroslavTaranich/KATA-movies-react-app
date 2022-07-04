import { Component } from 'react'
import 'antd/dist/antd.min.css'
import { Alert, Pagination } from 'antd'
import { Offline } from 'react-detect-offline'

import './app.css'
import CardList from '../cardList/cardList'
import Header from '../header'

export default class App extends Component {
  constructor() {
    super()

    this.state = {
      pageNumber: 1,
      totalResults: 0,
      searchQuery: '',
    }

    this.paginationHandler = (pageNumber) => {
      this.setState({
        pageNumber,
      })
    }

    this.totalResultsHandler = (count) => {
      this.setState({
        totalResults: count,
      })
    }
    this.inputHandler = (value) => {
      this.setState({
        searchQuery: value,
      })
    }
  }

  render() {
    const { pageNumber, totalResults, searchQuery } = this.state

    return (
      <div className="app">
        <Header inputHandler={this.inputHandler} inputValue={searchQuery} />
        <Offline>
          <Alert
            type="warning"
            message="Oops.. "
            description="Problems with internet connection"
            showIcon
            closable
            className="warning"
          />
        </Offline>

        <CardList
          pageNumber={pageNumber}
          paginationHandler={this.paginationHandler}
          totalResultsHandler={this.totalResultsHandler}
          searchQuery={searchQuery}
        />
        <Pagination
          className="pagination"
          current={pageNumber}
          onChange={(e) => this.paginationHandler(e)}
          total={totalResults}
          pageSize={20}
          hideOnSinglePage
        />
      </div>
    )
  }
}
