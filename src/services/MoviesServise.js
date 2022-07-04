import { tokenAPI } from './APIkey'

export default class MoviesServise {
  constructor() {
    this.baseURL = 'https://api.themoviedb.org/3'

    this.fetchOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `Bearer  ${tokenAPI}`,
      },
      redirect: 'follow',
    }

    this.formatSearchingMovies = (data) =>
      data.map((movie) => ({
        id: movie.id,
        title: movie.original_title,
        releaseDate: movie.release_date,
        description: movie.overview,
        posterSrc: movie.poster_path,
        genreIds: movie.genre_ids,
        voteAverage: movie.vote_average,
      }))

    this.searchMovie = async (page, query) => {
      const res = await fetch(`${this.baseURL}/search/movie/?query=${query}&page=${page}`, this.fetchOptions)

      if (!res.ok) throw new Error('Fetching faild')
      const body = await res.json()

      return {
        movies: this.formatSearchingMovies(body.results),
        totalResults: body.total_results,
        totalPages: body.totalPages,
      }
    }

    this.getMovie = async (id) => {
      const res = await fetch(`${this.baseURL}/movie/${id}`, this.fetchOptions)
      if (!res.ok) throw new Error('Fetching faild')
      const body = await res.json()
      return body
    }
  }
}
