import { type FormEvent } from 'react'
import { Field } from './ui/Field'
import type { FilterOption } from '../types'
import { formatCity } from '../utils/cityLabels'

interface SearchPanelProps {
  entScore: number
  combination: string
  specialty: string
  city: string
  institutionType: string
  combinations: FilterOption[]
  specialties: string[]
  cities: string[]
  loading: boolean
  onEntScoreChange: (value: number) => void
  onCombinationChange: (value: string) => void
  onSpecialtyChange: (value: string) => void
  onCityChange: (value: string) => void
  onInstitutionTypeChange: (value: string) => void
  onSubmit: (event?: FormEvent) => void
}

/** Main search form grouped into readable sections. */
export function SearchPanel({
  entScore,
  combination,
  specialty,
  city,
  institutionType,
  combinations,
  specialties,
  cities,
  loading,
  onEntScoreChange,
  onCombinationChange,
  onSpecialtyChange,
  onCityChange,
  onInstitutionTypeChange,
  onSubmit,
}: SearchPanelProps) {
  return (
    <form className="search-panel" onSubmit={onSubmit}>
      <section className="search-section">
        <h2 className="search-section-title">1. Ваш балл ЕНТ</h2>
        <div className="ent-score-block">
          <Field label="Балл от 0 до 140" hint="Пороговые значения из официального файла НЦТ, 2024">
            <div className="ent-score-inputs">
              <input
                className="input input-lg ent-score-number"
                type="number"
                min={0}
                max={140}
                value={entScore}
                onChange={(e) => onEntScoreChange(Number(e.target.value))}
              />
              <input
                className="ent-score-range"
                type="range"
                min={0}
                max={140}
                value={entScore}
                onChange={(e) => onEntScoreChange(Number(e.target.value))}
                aria-label="Балл ЕНТ"
              />
            </div>
          </Field>
        </div>
      </section>

      <section className="search-section">
        <h2 className="search-section-title">2. Профильные предметы</h2>
        <div className="search-grid search-grid-2">
          <Field
            label="Комбинация предметов"
            hint="Выберите пару профильных предметов, которые сдавали на ЕНТ"
          >
            <select
              className="select"
              value={combination}
              onChange={(e) => onCombinationChange(e.target.value)}
            >
              <option value="">Все комбинации</option>
              {combinations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Специальность"
            hint={
              combination
                ? `Доступно ${specialties.length} специальностей для этой комбинации`
                : 'Сначала выберите комбинацию предметов'
            }
          >
            <select
              className="select"
              value={specialty}
              onChange={(e) => onSpecialtyChange(e.target.value)}
              disabled={!combination}
            >
              <option value="">
                {combination ? 'Любая специальность из списка' : '— выберите комбинацию —'}
              </option>
              {specialties.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className="search-section">
        <h2 className="search-section-title">3. Дополнительно</h2>
        <div className="search-grid search-grid-2">
          <Field label="Город">
            <select className="select" value={city} onChange={(e) => onCityChange(e.target.value)}>
              <option value="">Все города</option>
              {cities.map((item) => (
                <option key={item} value={item}>
                  {formatCity(item)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Тип учреждения">
            <select
              className="select"
              value={institutionType}
              onChange={(e) => onInstitutionTypeChange(e.target.value)}
            >
              <option value="">Все</option>
              <option value="university">ВУЗ</option>
              <option value="college">Колледж</option>
            </select>
          </Field>
        </div>
      </section>

      <div className="search-actions">
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? 'Ищем варианты…' : 'Найти вузы'}
        </button>
      </div>
    </form>
  )
}
