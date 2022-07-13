import { tokenAPI, keyAPI } from './APIkey'

export default class MoviesServise {
  constructor() {
    this.baseURL = 'https://api.themoviedb.org/3'

    this.headersWithToken = {
      'Content-Type': 'application/json;charset=utf-8',
      Authorization: `Bearer  ${tokenAPI}`,
    }
    this.headers = {
      'Content-Type': 'application/json;charset=utf-8',
    }

    this.qureyAuthentication = `api_key=${keyAPI}`

    this.getFetchOptions = {
      method: 'GET',
      headers: this.headers,
      redirect: 'follow',
    }

    this.formatMovies = (data) => ({
      byId: data.reduce((acc, movie) => {
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
      allIds: data.reduce((acc, movie) => {
        acc.push(movie.id)
        return acc
      }, []),
    })

    this.fetchJsonData = async (url, options = this.getFetchOptions) => {
      const res = await fetch(`${this.baseURL}${url}`, options)
      if (!res.ok) throw new Error('Fetching faild')
      const body = await res.json()
      return body
    }

    // поиск не работает в проде из-за редиректов
    // this.searchMovie = async (page, query) => {
    //   const body = await this.fetchJsonData(`/search/movie/?${this.qureyAuthentication}&query=${query}&page=${page}`)
    //   return {
    //     movies: this.formatMovies(body.results),
    //     totalResults: body.total_results,
    //     totalPages: body.totalPages,
    //   }
    // }

    // редиректит на этот хост
    this.searchMovie = async (page, query) => {
      const res = await fetch(
        `https://d2nsx85y22o8i8.cloudfront.net/3/search/movie?${this.qureyAuthentication}&query=${query}&page=${page}`,
        this.getFetchOptions
      )
      if (!res.ok) throw new Error('Fetching faild')
      const body = await res.json()

      return {
        movies: this.formatMovies(body.results),
        totalResults: body.total_results,
        totalPages: body.totalPages,
      }
    }

    this.getPopularMovie = async (page) => {
      const body = await this.fetchJsonData(`/movie/popular?${this.qureyAuthentication}&page=${page}`)
      return {
        movies: this.formatMovies(body.results),
        totalResults: body.total_results,
        totalPages: body.totalPages,
      }
    }

    this.setGuestSesion = async () => {
      const sessionId = localStorage.getItem('guestSessionId')
      const isAlive = sessionId ? await this.checkGuestSesion(sessionId) : false

      if (isAlive) return sessionId

      const body = await this.fetchJsonData(`/authentication/guest_session/new?${this.qureyAuthentication}`)
      localStorage.setItem('guestSessionId', body.guest_session_id)
      return body.guest_session_id
    }

    this.checkGuestSesion = async (sessionId) => {
      const body = await this.fetchJsonData(`/guest_session/${sessionId}?${this.qureyAuthentication}`)
      return body.success
    }

    this.getRatedMoviesGuestSession = async (sessionId, page = 1) => {
      const body = await this.fetchJsonData(
        `/guest_session/${sessionId}/rated/movies?page=${page}&${this.qureyAuthentication}`
      )
      return {
        movies: this.formatMovies(body.results),
        totalResults: body.total_results,
        totalPages: body.total_pages,
      }
    }

    this.getAllMoviesRatingGuestSession = async (sessionId) => {
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

    this.setRatingGuest = async (sessionId, movieId, rateValue) => {
      const postBody = JSON.stringify({ value: rateValue })
      const options = {
        method: rateValue === 0 ? 'DELETE' : 'POST',
        headers: this.headers,
        redirect: 'follow',
        body: postBody,
      }
      const body = await this.fetchJsonData(
        `/movie/${movieId}/rating?guest_session_id=${sessionId}&${this.qureyAuthentication}`,
        options
      )
      return body.success
    }

    this.getGenres = async () => {
      const body = await this.fetchJsonData(`/genre/movie/list?${this.qureyAuthentication}`)
      return body.genres.reduce((acc, genre) => {
        acc[genre.id] = genre.name
        return acc
      }, {})
    }
  }
}
