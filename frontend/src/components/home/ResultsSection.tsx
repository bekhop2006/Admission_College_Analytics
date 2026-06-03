import { ActiveFilters } from '../ActiveFilters'
import { UniversityCard } from '../UniversityCard'
import { formatCity } from '../../utils/cityLabels'
import type { EntSearchResponse } from '../../types'

interface ResultsSectionProps {
  result: EntSearchResponse
  combination: string
  specialty: string
  city: string
  institutionType: string
  combinationLabel?: string
  onClearCombination: () => void
  onClearSpecialty: () => void
  onClearCity: () => void
  onClearType: () => void
}

/** Search results grid with active filter chips. */
export function ResultsSection({
  result,
  combination,
  specialty,
  city,
  institutionType,
  combinationLabel,
  onClearCombination,
  onClearSpecialty,
  onClearCity,
  onClearType,
}: ResultsSectionProps) {
  return (
    <section className="home-results">
      <div className="results-header">
        <h2 className="results-title">
          {result.total_matches === 0
            ? 'Ничего не найдено'
            : `Найдено ${result.total_matches} ${pluralUniversities(result.total_matches)}`}
        </h2>
        <p className="results-subtitle">Программы, доступные при {result.ent_score} баллах ЕНТ</p>
      </div>

      <ActiveFilters
        entScore={result.ent_score}
        combinationLabel={combinationLabel}
        specialty={specialty || undefined}
        cityLabel={city ? formatCity(city) : undefined}
        institutionType={institutionType || undefined}
        onClearCombination={onClearCombination}
        onClearSpecialty={onClearSpecialty}
        onClearCity={onClearCity}
        onClearType={onClearType}
      />

      {result.universities.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">По этим фильтрам вариантов нет</p>
          <p className="empty-state-text">
            Попробуйте снизить балл, выбрать другую комбинацию предметов или убрать дополнительные
            фильтры.
          </p>
        </div>
      ) : (
        <div className="results-grid">
          {result.universities.map((university) => (
            <UniversityCard
              key={university.id}
              university={university}
              entScore={result.ent_score}
              combination={combination}
              specialty={specialty}
            />
          ))}
        </div>
      )}
    </section>
  )
}

/** Return correct Russian plural form for university count. */
function pluralUniversities(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'учреждение'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'учреждения'
  return 'учреждений'
}
