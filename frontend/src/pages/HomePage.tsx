import { type FormEvent, useEffect, useState } from 'react'
import { fetchCities, searchUniversities } from '../api/client'
import { UniversityCard } from '../components/UniversityCard'
import type { EntSearchResponse } from '../types'

/** Public page: enter ENT score and browse matching universities. */
export function HomePage() {
  const [entScore, setEntScore] = useState(90)
  const [city, setCity] = useState('')
  const [institutionType, setInstitutionType] = useState('')
  const [cities, setCities] = useState<string[]>([])
  const [result, setResult] = useState<EntSearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCities().then(setCities).catch(() => setCities([]))
  }, [])

  /** Run ENT search with current filters. */
  async function handleSearch(event?: FormEvent) {
    event?.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await searchUniversities({
        ent_score: entScore,
        city: city || undefined,
        institution_type: institutionType || undefined,
      })
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка поиска')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleSearch()
  }, [])

  return (
    <main className="page">
      <section className="hero-panel">
        <h1>Куда поступить с твоим ЕНТ?</h1>
        <p>
          Введи балл Единого национального тестирования — покажем вузы и колледжи Казахстана, куда
          можно подать документы.
        </p>
        <form className="search-form" onSubmit={handleSearch}>
          <label>
            Балл ЕНТ
            <input
              type="number"
              min={0}
              max={140}
              value={entScore}
              onChange={(e) => setEntScore(Number(e.target.value))}
            />
          </label>
          <label>
            Город
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">Все города</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            Тип
            <select
              value={institutionType}
              onChange={(e) => setInstitutionType(e.target.value)}
            >
              <option value="">Все</option>
              <option value="university">ВУЗ</option>
              <option value="college">Колледж</option>
            </select>
          </label>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Ищем…' : 'Найти'}
          </button>
        </form>
      </section>

      {error && <p className="error">{error}</p>}

      {result && (
        <section>
          <h2 className="section-title">
            Найдено: {result.total_matches} · ваш балл {result.ent_score}
          </h2>
          {result.universities.length === 0 ? (
            <p className="muted">По этому баллу вариантов нет — попробуйте снизить фильтры.</p>
          ) : (
            <div className="grid">
              {result.universities.map((u) => (
                <UniversityCard key={u.id} university={u} entScore={result.ent_score} />
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  )
}
