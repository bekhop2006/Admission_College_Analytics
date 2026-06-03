import { Link } from 'react-router-dom'
import type { UniversityListItem } from '../types'

interface Props {
  university: UniversityListItem
  entScore: number
}

/** Card showing a university match for the current ENT score. */
export function UniversityCard({ university, entScore }: Props) {
  const typeLabel = university.institution_type === 'college' ? 'Колледж' : 'ВУЗ'

  return (
    <article className="uni-card">
      <div className="uni-card-head">
        <div>
          <p className="uni-meta">
            {typeLabel} · {university.city}
          </p>
          <h3>{university.name}</h3>
        </div>
        <div className="ent-badge">от {university.min_ent_score}</div>
      </div>
      <p className="uni-stats">
        Программ: {university.program_count}
        {university.matching_programs > 0 && (
          <> · подходят по ЕНТ: {university.matching_programs}</>
        )}
      </p>
      <Link to={`/universities/${university.id}?ent=${entScore}`} className="btn-secondary">
        Смотреть программы
      </Link>
    </article>
  )
}
