import { Link } from 'react-router-dom'
import { formatCity } from '../utils/cityLabels'
import type { UniversityListItem } from '../types'

interface Props {
  university: UniversityListItem
  entScore: number
  combination?: string
  specialty?: string
}

/** Card showing a university match for the current ENT score. */
export function UniversityCard({ university, entScore, combination, specialty }: Props) {
  const typeLabel = university.institution_type === 'college' ? 'Колледж' : 'ВУЗ'
  const params = new URLSearchParams({ ent: String(entScore) })
  if (combination) params.set('combination', combination)
  if (specialty) params.set('specialty', specialty)

  return (
    <article className="uni-card">
      <div className="uni-card-top">
        <span className={`badge ${university.institution_type === 'college' ? 'badge-green' : 'badge-blue'}`}>
          {typeLabel}
        </span>
        <span className="badge badge-muted">{formatCity(university.city)}</span>
      </div>

      <h3 className="uni-card-title">{university.name}</h3>

      <div className="uni-card-stats">
        <div className="uni-card-stat">
          <span className="uni-card-stat-label">Мин. ЕНТ</span>
          <strong className="uni-card-stat-value">{university.min_ent_score}</strong>
        </div>
        <div className="uni-card-stat">
          <span className="uni-card-stat-label">Подходят программ</span>
          <strong className="uni-card-stat-value">{university.matching_programs}</strong>
        </div>
        <div className="uni-card-stat">
          <span className="uni-card-stat-label">Всего программ</span>
          <strong className="uni-card-stat-value">{university.program_count}</strong>
        </div>
      </div>

      <Link to={`/universities/${university.id}?${params}`} className="btn btn-secondary uni-card-link">
        Смотреть программы →
      </Link>
    </article>
  )
}
