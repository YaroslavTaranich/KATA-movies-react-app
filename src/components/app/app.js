import { Component } from 'react'

import MoviesServise from '../../services/MoviesServise'

export default class App extends Component {
  constructor() {
    super()
    this.moviesServise = new MoviesServise()
    this.state = {
      pageNumber: 1,
      data: null,
    }
  }

  componentDidMount() {
    const { pageNumber } = this.state
    this.moviesServise.searchMovie(pageNumber).then((body) => {
      this.setState({
        data: body,
      })
    })
  }

  render() {
    const { data } = this.state
    console.log(data)
    return <h1>Hello</h1>
  }
}
