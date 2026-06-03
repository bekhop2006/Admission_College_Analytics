import type { Program } from '../types'

interface ProgramListProps {
  programs: Program[]
  entScore?: number
}

/** Render university programs as a readable list with score highlighting. */
export function ProgramList({ programs, entScore }: ProgramListProps) {
  return (
    <div className="program-list">
      {programs.map((program) => {
        const isMatch = entScore == null || program.min_ent_score <= entScore
        return (
          <article key={program.id} className={`program-item ${isMatch ? 'program-item-match' : ''}`}>
            <div className="program-item-main">
              <h3 className="program-item-title">{program.name}</h3>
              {program.education_field_name && (
                <p className="program-item-field">{program.education_field_name}</p>
              )}
            </div>
            <div className="program-item-meta">
              <div className="program-item-score">
                <span className="program-item-score-label">Мин. ЕНТ</span>
                <strong>{program.min_ent_score}</strong>
              </div>
              {program.study_form && (
                <span className="program-item-form">{program.study_form}</span>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}
