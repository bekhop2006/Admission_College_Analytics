import { Link } from 'react-router-dom'
import { BookOpenIcon } from '../icons/BookOpenIcon'
import type { PublicStats } from '../../types'

interface HeroSectionProps {
  stats: PublicStats | null
  entScore: number
  matchCount: number | null
  searchPath: string
}

/** Landing hero with headline, live stats and call-to-action. */
export function HeroSection({ stats, entScore, matchCount, searchPath }: HeroSectionProps) {
  return (
    <section className="home-hero">
      <div className="home-hero-content">
        <p className="home-hero-badge">Официальные данные НЦТ · 2024</p>
        <h1 className="home-hero-title">
          Найдите вуз,<br />
          куда можно поступить<br />
          с вашим <span className="text-accent">баллом ЕНТ</span>
        </h1>
        <p className="home-hero-lead">
          Пороговые баллы по каждой специальности, комбинации профильных предметов и фильтры
          по городу — всё в одном месте.
        </p>

        <div className="home-hero-actions">
          <Link to={searchPath} className="btn btn-primary btn-lg">
            Подобрать вузы
          </Link>
          {matchCount != null && (
            <p className="home-hero-hint">
              При {entScore} баллах доступно <strong>{matchCount}</strong> учреждений
            </p>
          )}
        </div>

        <div className="home-stats-row">
          <div className="home-stat">
            <strong>{stats?.universities_count ?? '—'}</strong>
            <span>вузов и колледжей</span>
          </div>
          <div className="home-stat">
            <strong>{stats?.programs_count ?? '—'}</strong>
            <span>специальностей</span>
          </div>
          <div className="home-stat">
            <strong>{stats?.cities_count ?? '—'}</strong>
            <span>городов</span>
          </div>
        </div>
      </div>

      <div className="home-hero-visual" aria-hidden="true">
        <div className="home-hero-card">
          <div className="home-hero-card-icon">
            <BookOpenIcon size={48} />
          </div>
          <div className="home-hero-card-score">
            <span className="home-hero-card-label">Пример балла</span>
            <strong>{entScore}</strong>
          </div>
          <div className="home-hero-card-tags">
            <span className="badge badge-blue">ЕНТ</span>
            <span className="badge badge-muted">Грант 2024</span>
          </div>
        </div>
      </div>
    </section>
  )
}
