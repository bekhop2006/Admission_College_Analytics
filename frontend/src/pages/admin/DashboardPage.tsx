import { type FormEvent, useEffect, useState } from 'react'
import { fetchDashboardStats, importCsv } from '../../api/client'
import type { DashboardStats } from '../../types'

/** Admin dashboard with stats and CSV import. */
export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [importMsg, setImportMsg] = useState('')

  useEffect(() => {
    fetchDashboardStats().then(setStats).catch(() => setStats(null))
  }, [])

  /** Handle CSV file upload for bulk import. */
  async function handleImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const fileInput = form.elements.namedItem('file') as HTMLInputElement
    const file = fileInput.files?.[0]
    if (!file) return
    try {
      const result = await importCsv(file)
      setImportMsg(
        `Импорт: +${result.created_universities} вузов, +${result.created_programs} программ`,
      )
      fetchDashboardStats().then(setStats)
    } catch {
      setImportMsg('Ошибка импорта')
    }
  }

  return (
    <div className="admin-section">
      <h1>Дашборд</h1>
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <span>Вузов / колледжей</span>
            <strong>{stats.universities_count}</strong>
          </div>
          <div className="stat-card">
            <span>Программ</span>
            <strong>{stats.programs_count}</strong>
          </div>
          <div className="stat-card">
            <span>Городов</span>
            <strong>{stats.cities_count}</strong>
          </div>
          <div className="stat-card">
            <span>Средний порог ЕНТ</span>
            <strong>{stats.avg_min_ent}</strong>
          </div>
        </div>
      )}

      {stats && stats.top_cities.length > 0 && (
        <section className="admin-block">
          <h2>Топ городов</h2>
          <ul className="city-list">
            {stats.top_cities.map((item) => (
              <li key={item.city}>
                {item.city} — {item.count}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="admin-block">
        <h2>Импорт CSV</h2>
        <p className="muted">
          Колонки: name, city, min_ent_score, program_name, program_min_ent, institution_type,
          website
        </p>
        <form onSubmit={handleImport}>
          <input type="file" name="file" accept=".csv" required />
          <button type="submit" className="btn-primary">
            Загрузить
          </button>
        </form>
        {importMsg && <p>{importMsg}</p>}
      </section>
    </div>
  )
}
