import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { fetchUniversity } from '../api/client'
import { ProgramList } from '../components/ProgramList'
import { formatCity } from '../utils/cityLabels'
import type { University } from '../types'

/** Detail page for one university and eligible programs. */
export function UniversityDetailPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const entScore = searchParams.get('ent') ? Number(searchParams.get('ent')) : undefined
  const combination = searchParams.get('combination') ?? undefined
  const specialty = searchParams.get('specialty') ?? undefined
  const [university, setUniversity] = useState<University | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    fetchUniversity(Number(id), { entScore, combination, specialty })
      .then(setUniversity)
      .catch((err) => setError(err instanceof Error ? err.message : 'Не найдено'))
  }, [id, entScore, combination, specialty])

  const backLink = (() => {
    const params = new URLSearchParams()
    if (entScore != null) params.set('ent', String(entScore))
    if (combination) params.set('combination', combination)
    if (specialty) params.set('specialty', specialty)
    const query = params.toString()
    return query ? `/search?${query}` : '/search'
  })()

  if (error) {
    return (
      <main className="page">
        <div className="alert alert-error">{error}</div>
        <Link to={backLink} className="back-link">
          ← Вернуться к поиску
        </Link>
      </main>
    )
  }

  if (!university) {
    return (
      <main className="page">
        <p className="loading-text">Загрузка данных…</p>
      </main>
    )
  }

  const typeLabel = university.institution_type === 'college' ? 'Колледж' : 'ВУЗ'

  return (
    <main className="page page-detail">
      <Link to={backLink} className="back-link">
        ← Вернуться к поиску
      </Link>

      <header className="detail-hero">
        <div className="detail-hero-badges">
          <span className={`badge ${university.institution_type === 'college' ? 'badge-green' : 'badge-blue'}`}>
            {typeLabel}
          </span>
          <span className="badge badge-muted">{formatCity(university.city)}</span>
        </div>
        <h1 className="detail-title">{university.name}</h1>
        {university.description && <p className="detail-description">{university.description}</p>}
      </header>

      <div className="detail-info-grid">
        <div className="info-card">
          <span className="info-card-label">Минимальный балл ЕНТ</span>
          <strong className="info-card-value">{university.min_ent_score}</strong>
        </div>
        <div className="info-card">
          <span className="info-card-label">Программ в списке</span>
          <strong className="info-card-value">{university.programs.length}</strong>
        </div>
        {university.email && (
          <div className="info-card info-card-wide">
            <span className="info-card-label">Email</span>
            <a href={`mailto:${university.email}`} className="info-card-link">
              {university.email}
            </a>
          </div>
        )}
        {university.rector_name && (
          <div className="info-card info-card-wide">
            <span className="info-card-label">Ректор</span>
            <span className="info-card-text">{university.rector_name}</span>
          </div>
        )}
      </div>

      {university.website && (
        <a href={university.website} target="_blank" rel="noreferrer" className="btn btn-secondary">
          Открыть сайт учреждения ↗
        </a>
      )}

      <section className="detail-programs">
        <div className="detail-programs-header">
          <h2>
            {entScore != null
              ? `Программы при ${entScore} баллах ЕНТ`
              : 'Все программы'}
          </h2>
          {specialty && <p className="detail-programs-filter">Специальность: {specialty}</p>}
        </div>

        {university.programs.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">Нет подходящих программ</p>
            <p className="empty-state-text">
              Для указанного балла и фильтров программы не найдены. Попробуйте изменить параметры
              поиска.
            </p>
          </div>
        ) : (
          <ProgramList programs={university.programs} entScore={entScore} />
        )}
      </section>
    </main>
  )
}
