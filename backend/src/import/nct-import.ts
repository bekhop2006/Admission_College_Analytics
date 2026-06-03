/** Import official NCT threshold scores and university metadata into SQLite. */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import { db } from '../db.js'
import type { UniversityMetadata } from '../types.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(__dirname, '../../data')
const NCT_FILE = path.join(DATA_DIR, 'nct-thresholds.xlsx')
const METADATA_FILE = path.join(DATA_DIR, 'universities-metadata.json')

interface NctRow {
  region: string
  nctCode: number
  legalName: string
  studyForm: string
  educationFieldCode: string
  educationFieldName: string
  gopCode: string
  programName: string
  minEntScore: number
}

/** Normalize text for fuzzy university name matching. */
export function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[«»"']/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Map NCT region label to a primary city for filters. */
export function regionToCity(region: string): string {
  const lower = normalizeName(region)
  if (lower.includes('астана') || lower.includes('astana')) return 'Astana'
  if (lower.includes('алмат') || lower.includes('almaty')) return 'Almaty'
  if (lower.includes('шымкент') || lower.includes('shymkent')) return 'Shymkent'
  if (lower.includes('караганд')) return 'Karaganda'
  if (lower.includes('акмол')) return 'Kokshetau'
  if (lower.includes('актюб') || lower.includes('актobe')) return 'Aktobe'
  if (lower.includes('атырау')) return 'Atyrau'
  if (lower.includes('запад')) return 'Uralsk'
  if (lower.includes('жамбыл')) return 'Taraz'
  if (lower.includes('костан')) return 'Kostanay'
  if (lower.includes('кызылор')) return 'Kyzylorda'
  if (lower.includes('мангист')) return 'Aktau'
  if (lower.includes('павлодар')) return 'Pavlodar'
  if (lower.includes('северо') || lower.includes('сolt')) return 'Petropavl'
  if (lower.includes('восточ')) return 'Ust-Kamenogorsk'
  if (lower.includes('туркест')) return 'Turkestan'
  if (lower.includes('абай') || lower.includes('semey')) return 'Semey'
  if (lower.includes('жетыс')) return 'Taldykorgan'
  if (lower.includes('улытау') || lower.includes('жезказ')) return 'Zhezkazgan'
  if (lower.includes('алматин')) return 'Kaskelen'
  return region.split(' ')[0] ?? 'Kazakhstan'
}

/** Parse the official NCT Excel file into structured rows. */
export function parseNctFile(filePath = NCT_FILE): NctRow[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`NCT file not found: ${filePath}`)
  }
  const workbook = XLSX.readFile(filePath)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, { header: 1, defval: '' })
  const parsed: NctRow[] = []

  for (const row of rows.slice(4)) {
    const legalName = String(row[3] ?? '').trim()
    const programName = String(row[8] ?? '').trim()
    const minEntScore = Number(row[9])
    if (!legalName || !programName || Number.isNaN(minEntScore)) continue

    parsed.push({
      region: String(row[1] ?? '').trim(),
      nctCode: Number(row[2]),
      legalName,
      studyForm: String(row[4] ?? '').trim(),
      educationFieldCode: String(row[5] ?? '').trim(),
      educationFieldName: String(row[6] ?? '').trim(),
      gopCode: String(row[7] ?? '').trim(),
      programName,
      minEntScore,
    })
  }
  return parsed
}

/** Load university contact metadata provided by RNMC. */
export function loadUniversityMetadata(filePath = METADATA_FILE): UniversityMetadata[] {
  if (!fs.existsSync(filePath)) return []
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as UniversityMetadata[]
}

/** Find metadata overlay for a legal university name from NCT. */
export function findMetadata(legalName: string, items: UniversityMetadata[]): UniversityMetadata | undefined {
  const normalized = normalizeName(legalName)
  return items.find((item) => item.match.some((token) => normalized.includes(normalizeName(token))))
}

/** Clear universities/programs and import NCT thresholds with metadata overlay. */
export function importNctData(options: { reset?: boolean } = {}): { universities: number; programs: number } {
  const rows = parseNctFile()
  const metadata = loadUniversityMetadata()

  if (options.reset) {
    db.exec('DELETE FROM programs; DELETE FROM universities;')
  }

  const grouped = new Map<string, NctRow[]>()
  for (const row of rows) {
    const key = `${row.nctCode}::${row.legalName}`
    const bucket = grouped.get(key) ?? []
    bucket.push(row)
    grouped.set(key, bucket)
  }

  let programCount = 0
  const insertUniversity = db.prepare(`
    INSERT INTO universities (
      name, short_name, legal_name, city, region, institution_type, min_ent_score,
      website, description, address, founded_year, email, rector_name, rector_contacts, nct_code
    ) VALUES (
      @name, @short_name, @legal_name, @city, @region, 'university', @min_ent_score,
      @website, @description, @address, @founded_year, @email, @rector_name, @rector_contacts, @nct_code
    )
  `)

  const insertProgram = db.prepare(`
    INSERT INTO programs (
      university_id, name, specialty_code, gop_code, education_field_code, education_field_name,
      study_form, language, min_ent_score, grant_min_ent_score, source_year
    ) VALUES (
      @university_id, @name, @specialty_code, @gop_code, @education_field_code, @education_field_name,
      @study_form, 'kaz/ru', @min_ent_score, @grant_min_ent_score, @source_year
    )
  `)

  const importTx = db.transaction(() => {
    for (const programs of grouped.values()) {
      const first = programs[0]
      const meta = findMetadata(first.legalName, metadata)
      const minEnt = Math.min(...programs.map((p) => p.minEntScore))
      const city = meta?.city ?? regionToCity(first.region)
      const displayName = meta?.shortName ?? first.legalName.replace(/\s+/g, ' ').trim()

      const result = insertUniversity.run({
        name: displayName,
        short_name: meta?.shortName ?? displayName,
        legal_name: first.legalName,
        city,
        region: first.region,
        min_ent_score: minEnt,
        website: meta?.website ?? null,
        description: meta?.address ? `Адрес: ${meta.address}` : null,
        address: meta?.address ?? null,
        founded_year: meta?.foundedYear ?? null,
        email: meta?.email ?? null,
        rector_name: meta?.rector ?? null,
        rector_contacts: meta?.rectorContacts ?? null,
        nct_code: first.nctCode,
      })

      const universityId = Number(result.lastInsertRowid)
      for (const program of programs) {
        insertProgram.run({
          university_id: universityId,
          name: program.programName,
          specialty_code: program.gopCode,
          gop_code: program.gopCode,
          education_field_code: program.educationFieldCode,
          education_field_name: program.educationFieldName,
          study_form: program.studyForm,
          min_ent_score: program.minEntScore,
          grant_min_ent_score: program.minEntScore,
          source_year: 2024,
        })
        programCount += 1
      }
    }
  })

  importTx()
  return { universities: grouped.size, programs: programCount }
}
