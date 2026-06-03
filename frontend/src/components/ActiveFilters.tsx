interface ActiveFiltersProps {
  entScore: number
  combinationLabel?: string
  specialty?: string
  cityLabel?: string
  institutionType?: string
  onClearCombination: () => void
  onClearSpecialty: () => void
  onClearCity: () => void
  onClearType: () => void
}

/** Show active search filters as removable chips. */
export function ActiveFilters({
  entScore,
  combinationLabel,
  specialty,
  cityLabel,
  institutionType,
  onClearCombination,
  onClearSpecialty,
  onClearCity,
  onClearType,
}: ActiveFiltersProps) {
  const hasFilters = combinationLabel || specialty || cityLabel || institutionType

  if (!hasFilters) {
    return (
      <div className="active-filters">
        <span className="filter-chip filter-chip-static">Балл ЕНТ: {entScore}</span>
      </div>
    )
  }

  return (
    <div className="active-filters">
      <span className="filter-chip filter-chip-static">Балл ЕНТ: {entScore}</span>
      {combinationLabel && (
        <button type="button" className="filter-chip" onClick={onClearCombination}>
          {combinationLabel} ×
        </button>
      )}
      {specialty && (
        <button type="button" className="filter-chip" onClick={onClearSpecialty}>
          {specialty} ×
        </button>
      )}
      {cityLabel && (
        <button type="button" className="filter-chip" onClick={onClearCity}>
          {cityLabel} ×
        </button>
      )}
      {institutionType && (
        <button type="button" className="filter-chip" onClick={onClearType}>
          {institutionType === 'university' ? 'ВУЗ' : 'Колледж'} ×
        </button>
      )}
    </div>
  )
}
