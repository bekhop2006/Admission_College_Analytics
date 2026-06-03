import { type FormEvent, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  fetchCities,
  fetchCombinations,
  fetchSpecialties,
  searchUniversities,
} from '../api/client'
import { ResultsSection } from '../components/home/ResultsSection'
import { SearchPanel } from '../components/SearchPanel'
import type { EntSearchResponse, FilterOption } from '../types'

/** Dedicated search page with filters and university results. */
export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [entScore, setEntScore] = useState(() => Number(searchParams.get('ent')) || 90)
  const [city, setCity] = useState(() => searchParams.get('city') ?? '')
  const [institutionType, setInstitutionType] = useState(() => searchParams.get('type') ?? '')
  const [combination, setCombination] = useState(() => searchParams.get('combination') ?? '')
  const [specialty, setSpecialty] = useState(() => searchParams.get('specialty') ?? '')
  const [cities, setCities] = useState<string[]>([])
  const [combinations, setCombinations] = useState<FilterOption[]>([])
  const [specialties, setSpecialties] = useState<string[]>([])
  const [result, setResult] = useState<EntSearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    Promise.all([fetchCities(), fetchCombinations()])
      .then(([cityList, combinationList]) => {
        setCities(cityList)
        setCombinations(combinationList)
      })
      .catch(() => {
        setCities([])
        setCombinations([])
      })
  }, [])

  useEffect(() => {
    if (!combination) {
      setSpecialties([])
      return
    }

    fetchSpecialties(combination)
      .then((list) => {
        setSpecialties(list)
        setSpecialty((current) => (current && list.includes(current) ? current : ''))
      })
      .catch(() => {
        setSpecialties([])
        setSpecialty('')
      })
  }, [combination])

  /** Sync current filters to the URL for shareable search links. */
  function syncUrlParams(
    score: number,
    combo: string,
    spec: string,
    cityValue: string,
    typeValue: string,
  ) {
    const params = new URLSearchParams()
    params.set('ent', String(score))
    if (combo) params.set('combination', combo)
    if (spec) params.set('specialty', spec)
    if (cityValue) params.set('city', cityValue)
    if (typeValue) params.set('type', typeValue)
    setSearchParams(params, { replace: true })
  }

  /** Run ENT search with current filters or explicit overrides. */
  async function handleSearch(
    event?: FormEvent,
    overrides?: {
      combination?: string
      specialty?: string
      city?: string
      institutionType?: string
    },
  ) {
    event?.preventDefault()
    setLoading(true)
    setError('')

    const nextCombination = overrides?.combination ?? combination
    const nextSpecialty = overrides?.specialty ?? specialty
    const nextCity = overrides?.city ?? city
    const nextInstitutionType = overrides?.institutionType ?? institutionType

    try {
      const data = await searchUniversities({
        ent_score: entScore,
        city: nextCity || undefined,
        institution_type: nextInstitutionType || undefined,
        combination: nextCombination || undefined,
        specialty: nextSpecialty || undefined,
      })
      setResult(data)
      syncUrlParams(entScore, nextCombination, nextSpecialty, nextCity, nextInstitutionType)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка поиска')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialized) return
    setInitialized(true)
    handleSearch()
  }, [initialized])

  /** Update combination and clear specialty when user changes the pair. */
  function handleCombinationChange(value: string) {
    setCombination(value)
    setSpecialty('')
  }

  const combinationLabel = combinations.find((item) => item.id === combination)?.label

  return (
    <main className="page search-page">
      <header className="search-page-header">
        <Link to="/" className="back-link">
          ← На главную
        </Link>
        <h1>Подбор вузов по ЕНТ</h1>
        <p className="page-lead">
          Укажите балл, комбинацию профильных предметов и дополнительные фильтры — покажем
          подходящие учреждения.
        </p>
      </header>

      <SearchPanel
        entScore={entScore}
        combination={combination}
        specialty={specialty}
        city={city}
        institutionType={institutionType}
        combinations={combinations}
        specialties={specialties}
        cities={cities}
        loading={loading}
        onEntScoreChange={setEntScore}
        onCombinationChange={handleCombinationChange}
        onSpecialtyChange={setSpecialty}
        onCityChange={setCity}
        onInstitutionTypeChange={setInstitutionType}
        onSubmit={handleSearch}
      />

      {error && (
        <div className="alert alert-error home-alert" role="alert">
          {error}
        </div>
      )}

      {result && (
        <ResultsSection
          result={result}
          combination={combination}
          specialty={specialty}
          city={city}
          institutionType={institutionType}
          combinationLabel={combinationLabel}
          onClearCombination={() => {
            handleCombinationChange('')
            handleSearch(undefined, { combination: '', specialty: '' })
          }}
          onClearSpecialty={() => {
            setSpecialty('')
            handleSearch(undefined, { specialty: '' })
          }}
          onClearCity={() => {
            setCity('')
            handleSearch(undefined, { city: '' })
          }}
          onClearType={() => {
            setInstitutionType('')
            handleSearch(undefined, { institutionType: '' })
          }}
        />
      )}
    </main>
  )
}
