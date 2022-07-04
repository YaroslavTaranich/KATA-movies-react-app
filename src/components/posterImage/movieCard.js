import './movieCard.css'
import { Card, Col, Rate } from 'antd'
import { format } from 'date-fns'

export default function MovieCard({ src, title, description, date, voteAverage }) {
  const imgBase = 'https://image.tmdb.org/t/p/w500'

  function trimString(string, cardTitle = '') {
    let trimLength = 185
    if (cardTitle.length > 18) trimLength = 150
    if (cardTitle.length > 36) trimLength = 115
    if (cardTitle.length > 46) trimLength = 65
    if (string.length < trimLength) return string
    const trimed = string.slice(0, trimLength).split(' ')
    trimed.pop()
    return [...trimed, '...'].join(' ')
  }

  const formatedDate = date ? <div className="movie_card__date">{format(new Date(date), 'PP')}</div> : null

  return (
    <Col xs={24} md={12}>
      <Card>
        <div className="movie-card">
          <img className="movie-card__img" src={imgBase + src} alt={title} />
          <div className="movie-card__info">
            <h5 className="movie-card__title">{title}</h5>
            {formatedDate}
            <div className="movie-card__genres">
              <span className="genre">Action</span>
              <span className="genre">Drama</span>
            </div>
            <div className="movie-card__description">{trimString(description, title)}</div>
            <Rate className="movie-card__stars" allowHalf defaultValue={2.5} count={10} />
            <div className="movie-card__rate">{voteAverage}</div>
          </div>
        </div>
      </Card>
    </Col>
  )
}
