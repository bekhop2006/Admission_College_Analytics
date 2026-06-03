import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { fetchUniversity } from '../api/client'
import type { University } from '../types'

/** Detail page for one university and eligible programs. */
export function UniversityDetailPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const entScore = searchParams.get('ent') ? Number(searchParams.get('ent')) : undefined
  const [university, setUniversity] = useState<University | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    fetchUniversity(Number(id), entScore)
      .then(setUniversity)
      .catch((err) => setError(err instanceof Error ? err.message : 'Не найдено'))
  }, [id, entScore])

  if (error) return <p className="error page">{error}</p>
  if (!university) return <p className="page muted">Загрузка…</p>

  return (
    <main className="page detail">
      <Link to="/" className="back-link">
        ← Назад к поиску
      </Link>
      <header className="detail-header">
        <div>
          <p className="uni-meta">
            {university.institution_type === 'college' ? 'Колледж' : 'ВУЗ'} · {university.city}
          </p>
          <h1>{university.name}</h1>
          {university.description && <p>{university.description}</p>}
        </div>
        <div className="ent-badge large">мин. {university.min_ent_score} ЕНТ</div>
      </header>
      {university.website && (
        <a href={university.website} target="_blank" rel="noreferrer" className="external-link">
          Сайт учреждения
        </a>
      )}

      <section>
        <h2>
          {entScore != null
            ? `Программы, доступные при ${entScore} баллах`
            : 'Все программы'}
        </h2>
        {university.programs.length === 0 ? (
          <p className="muted">Нет подходящих программ для указанного балла.</p>
        ) : (
          <table className="programs-table">
            <thead>
              <tr>
                <th>Программа</th>
                <th>Мин. ЕНТ</th>
                <th>Грант от</th>
                <th>Язык</th>
              </tr>
            </thead>
            <tbody>
              {university.programs.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.min_ent_score}</td>
                  <td>{p.grant_min_ent_score ?? '—'}</td>
                  <td>{p.language}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  )
}
