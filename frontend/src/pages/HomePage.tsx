import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCombinations, fetchPublicStats, searchUniversities } from '../api/client'
import { HeroSection } from '../components/home/HeroSection'
import { HowItWorks } from '../components/home/HowItWorks'
import { PopularCombinations } from '../components/home/PopularCombinations'
import type { FilterOption, PublicStats } from '../types'

/** Landing page — intro, stats and links to the search page. */
export function HomePage() {
  const [combinations, setCombinations] = useState<FilterOption[]>([])
  const [publicStats, setPublicStats] = useState<PublicStats | null>(null)
  const [previewMatches, setPreviewMatches] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([fetchCombinations(), fetchPublicStats()])
      .then(([combinationList, stats]) => {
        setCombinations(combinationList)
        setPublicStats(stats)
      })
      .catch(() => {
        setCombinations([])
        setPublicStats(null)
      })
  }, [])

  useEffect(() => {
    searchUniversities({ ent_score: 90 })
      .then((data) => setPreviewMatches(data.total_matches))
      .catch(() => setPreviewMatches(null))
  }, [])

  return (
    <main className="home-page">
      <HeroSection
        stats={publicStats}
        entScore={90}
        matchCount={previewMatches}
        searchPath="/search"
      />

      <HowItWorks />

      <PopularCombinations combinations={combinations} searchPath="/search" />

      <section className="home-cta">
        <h2 className="home-section-title">Готовы подобрать вуз?</h2>
        <p className="home-section-lead">
          Перейдите к поиску — укажите свой балл ЕНТ и комбинацию предметов.
        </p>
        <Link to="/search" className="btn btn-primary btn-lg">
          Перейти к поиску
        </Link>
      </section>

      <footer className="home-footer">
        <p>RNMC College Analytics · данные НЦТ, конкурс 2024</p>
        <p className="muted">АО «РНМЦ» — стажировочный проект</p>
      </footer>
    </main>
  )
}
