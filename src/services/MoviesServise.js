import { tokenAPI } from './APIkey'

export default class MoviesServise {
  constructor() {
    this.baseURL = 'https://api.themoviedb.org/3/'

    this.fetchOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `Bearer  ${tokenAPI}`,
      },
      redirect: 'follow',
    }

    this.searchMovie = async (page = 1, query = 'return') => {
      const res = await fetch(`${this.baseURL}search/movie/?query=${query}&page=${page}`, this.fetchOptions)
      if (!res.ok) throw new Error('Fetching faild')
      const body = await res.json()
      return body
    }

    this.getMovie = async (id) => {
      const res = await fetch(`${this.baseURL}movie/${id}`, this.fetchOptions)
      if (!res.ok) throw new Error('Fetching faild')
      const body = await res.json()
      return body
    }
  }
}
