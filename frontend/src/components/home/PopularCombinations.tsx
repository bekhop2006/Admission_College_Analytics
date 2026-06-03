import { Link } from 'react-router-dom'
import type { FilterOption } from '../../types'

/** Popular ENT subject combination labels for quick selection. */
const POPULAR_LABELS = [
  'Математика - Физика',
  'Биология - Химия',
  'Математика - Информатика',
  'Всемирная история - География',
  'Биология - География',
  'Математика - География',
]

interface PopularCombinationsProps {
  combinations: FilterOption[]
  searchPath: string
}

/** Quick-pick chips that open the search page with a pre-selected combination. */
export function PopularCombinations({ combinations, searchPath }: PopularCombinationsProps) {
  const popular = POPULAR_LABELS.map((label) => combinations.find((item) => item.label === label)).filter(
    (item): item is FilterOption => Boolean(item),
  )

  if (popular.length === 0) return null

  return (
    <section className="home-popular">
      <h2 className="home-section-title">Популярные комбинации</h2>
      <p className="home-section-lead">
        Нажмите на пару предметов — откроется поиск с уже выбранной комбинацией
      </p>
      <div className="home-combo-chips">
        {popular.map((item) => (
          <Link
            key={item.id}
            to={`${searchPath}?combination=${encodeURIComponent(item.id)}`}
            className="home-combo-chip"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </section>
  )
}
