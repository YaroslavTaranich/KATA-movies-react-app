import { keyAPI } from './APIkey'

export default class MoviesServise {
  constructor() {
    this.baseURL = 'https://api.themoviedb.org/3'
    this.searchURL = 'https://d2nsx85y22o8i8.cloudfront.net/3'

    this.headers = {
      'Content-Type': 'application/json;charset=utf-8',
    }

    this.qureyAuth = `api_key=${keyAPI}`

    this.getFetchOptions = {
      method: 'GET',
      headers: this.headers,
      redirect: 'follow',
    }
  }

  static formatMovies = (data) => {
    const movies = {
      byId: data.results.reduce((acc, movie) => {
        acc[movie.id] = {
          id: movie.id,
          title: movie.original_title,
          releaseDate: movie.release_date,
          description: movie.overview,
          posterSrc: movie.poster_path,
          genresIds: movie.genre_ids,
          voteAverage: +movie.vote_average.toFixed(1),
          rating: movie.rating,
        }
        return acc
      }, {}),
      allIds: data.results.reduce((acc, movie) => {
        acc.push(movie.id)
        return acc
      }, []),
    }
    return {
      movies,
      totalResults: data.total_results,
      totalPages: data.total_pages,
    }
  }

  fetchJsonData = async (url, query = '', options = this.getFetchOptions, host = this.baseURL) => {
    const res = await fetch(`${host}${url}?${this.qureyAuth}${query}`, options)
    if (!res.ok) throw new Error('Fetching faild')
    const body = await res.json()
    return body
  }

  searchMovie = async (page, query) => {
    const body = await this.fetchJsonData(
      '/search/movie',
      `&query=${query}&page=${page}`,
      this.getFetchOptions,
      this.searchURL
    )
    return MoviesServise.formatMovies(body)
  }

  getPopularMovie = async (page) => {
    const body = await this.fetchJsonData('/movie/popular', `&page=${page}`)
    return MoviesServise.formatMovies(body)
  }

  setGuestSesion = async () => {
    const sessionId = localStorage.getItem('guestSessionId')
    const isAlive = sessionId ? await this.checkGuestSesion(sessionId) : false

    if (isAlive) return sessionId

    const body = await this.fetchJsonData('/authentication/guest_session/new')
    localStorage.setItem('guestSessionId', body.guest_session_id)
    return body.guest_session_id
  }

  checkGuestSesion = async (sessionId) => {
    const body = await this.fetchJsonData(`/guest_session/${sessionId}`)
    return body.success
  }

  getRatedMoviesGuestSession = async (sessionId, page = 1) => {
    const body = await this.fetchJsonData(`/guest_session/${sessionId}/rated/movies`, `&page=${page}`)
    return MoviesServise.formatMovies(body)
  }

  getAllMoviesRatingGuestSession = async (sessionId) => {
    function MakeRatingObject({ byId, allIds }) {
      return allIds.reduce((acc, id) => {
        acc[id] = byId[id].rating
        return acc
      }, {})
    }

    let res = {}
    let body = await this.getRatedMoviesGuestSession(sessionId, 1)
    const { totalPages, totalResults, movies } = body

    if (!totalResults) return res

    res = MakeRatingObject(movies)

    if (totalPages === 1) return res

    for (let i = 2; i <= totalPages; i++) {
      // eslint-disable-next-line no-await-in-loop
      body = await this.getRatedMoviesGuestSession(sessionId, i)
      res = { ...res, ...MakeRatingObject(body.movies) }
    }
    return res
  }

  setRatingGuest = async (sessionId, movieId, rateValue) => {
    const postBody = JSON.stringify({ value: rateValue })
    const options = {
      method: rateValue === 0 ? 'DELETE' : 'POST',
      headers: this.headers,
      redirect: 'follow',
      body: postBody,
    }
    const body = await this.fetchJsonData(`/movie/${movieId}/rating`, `&guest_session_id=${sessionId}`, options)
    return body.success
  }

  getGenres = async () => {
    const body = await this.fetchJsonData('/genre/movie/list')
    return body.genres.reduce((acc, genre) => {
      acc[genre.id] = genre.name
      return acc
    }, {})
  }
}
