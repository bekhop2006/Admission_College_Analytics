/** SQLite connection, schema initialization, and query helpers. */

import Database from 'better-sqlite3'
import { config } from './config.js'
import type { ProgramRow, UniversityRow, UniversityWithPrograms, UserPublic, UserRow } from './types.js'

export const db = new Database(config.databasePath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

/** Add a column when upgrading an existing SQLite database. */
function addColumnIfMissing(table: string, column: string, definition: string): void {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]
  if (!columns.some((item) => item.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
  }
}

/** Create tables and apply lightweight migrations for new columns. */
export function initSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      hashed_password TEXT NOT NULL,
      full_name TEXT NOT NULL DEFAULT 'Administrator',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS universities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      short_name TEXT,
      legal_name TEXT,
      city TEXT NOT NULL,
      region TEXT,
      institution_type TEXT NOT NULL DEFAULT 'university',
      min_ent_score INTEGER NOT NULL,
      website TEXT,
      description TEXT,
      address TEXT,
      founded_year INTEGER,
      email TEXT,
      rector_name TEXT,
      rector_contacts TEXT,
      nct_code INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS programs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      university_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      specialty_code TEXT,
      gop_code TEXT,
      education_field_code TEXT,
      education_field_name TEXT,
      study_form TEXT,
      language TEXT NOT NULL DEFAULT 'kaz/ru',
      min_ent_score INTEGER NOT NULL,
      grant_min_ent_score INTEGER,
      source_year INTEGER,
      FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_universities_city ON universities(city);
    CREATE INDEX IF NOT EXISTS idx_universities_min_ent ON universities(min_ent_score);
    CREATE INDEX IF NOT EXISTS idx_programs_university ON programs(university_id);
    CREATE INDEX IF NOT EXISTS idx_programs_min_ent ON programs(min_ent_score);
    CREATE INDEX IF NOT EXISTS idx_programs_gop ON programs(gop_code);
  `)

  addColumnIfMissing('universities', 'short_name', 'TEXT')
  addColumnIfMissing('universities', 'legal_name', 'TEXT')
  addColumnIfMissing('universities', 'region', 'TEXT')
  addColumnIfMissing('universities', 'address', 'TEXT')
  addColumnIfMissing('universities', 'founded_year', 'INTEGER')
  addColumnIfMissing('universities', 'email', 'TEXT')
  addColumnIfMissing('universities', 'rector_name', 'TEXT')
  addColumnIfMissing('universities', 'rector_contacts', 'TEXT')
  addColumnIfMissing('universities', 'nct_code', 'INTEGER')
  addColumnIfMissing('programs', 'gop_code', 'TEXT')
  addColumnIfMissing('programs', 'education_field_code', 'TEXT')
  addColumnIfMissing('programs', 'education_field_name', 'TEXT')
  addColumnIfMissing('programs', 'study_form', 'TEXT')
  addColumnIfMissing('programs', 'source_year', 'INTEGER')
  addColumnIfMissing('users', 'role', "TEXT NOT NULL DEFAULT 'user'")

  db.prepare(`UPDATE users SET role = 'admin' WHERE email = ?`).run(config.adminEmail)
}

/** Fetch all programs belonging to a university. */
export function getProgramsByUniversity(universityId: number): ProgramRow[] {
  return db
    .prepare('SELECT * FROM programs WHERE university_id = ? ORDER BY min_ent_score ASC')
    .all(universityId) as ProgramRow[]
}

/** Attach programs array to a university row. */
export function withPrograms(university: UniversityRow): UniversityWithPrograms {
  return { ...university, programs: getProgramsByUniversity(university.id) }
}

/** Map a database user row to a public API profile. */
export function toPublicUser(user: UserRow): UserPublic {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role === 'admin' ? 'admin' : 'user',
    created_at: user.created_at,
  }
}

/** Find user by email for authentication. */
export function findUserByEmail(email: string): UserRow | undefined {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined
}

/** Count all universities in the database. */
export function countUniversities(): number {
  return (db.prepare('SELECT COUNT(*) AS count FROM universities').get() as { count: number }).count
}

/** Count all programs in the database. */
export function countPrograms(): number {
  return (db.prepare('SELECT COUNT(*) AS count FROM programs').get() as { count: number }).count
}

/** List all universities ordered by name. */
export function listUniversities(): UniversityRow[] {
  return db.prepare('SELECT * FROM universities ORDER BY name ASC').all() as UniversityRow[]
}

/** List universities with optional city and institution type filters. */
export function listUniversitiesFiltered(city?: string, institutionType?: string): UniversityRow[] {
  let sql = 'SELECT * FROM universities WHERE 1=1'
  const params: string[] = []
  if (city) {
    sql += ' AND LOWER(city) = LOWER(?)'
    params.push(city)
  }
  if (institutionType) {
    sql += ' AND institution_type = ?'
    params.push(institutionType)
  }
  sql += ' ORDER BY min_ent_score DESC'
  return db.prepare(sql).all(...params) as UniversityRow[]
}

/** Find one university by primary key. */
export function findUniversityById(id: number): UniversityRow | undefined {
  return db.prepare('SELECT * FROM universities WHERE id = ?').get(id) as UniversityRow | undefined
}

/** Return distinct city names for filter dropdowns. */
export function listCities(): string[] {
  return (db.prepare('SELECT DISTINCT city FROM universities ORDER BY city ASC').all() as { city: string }[]).map(
    (row) => row.city,
  )
}

/** Return distinct specialty (program) names for filter dropdowns. */
export function listSpecialties(): string[] {
  return (db.prepare('SELECT DISTINCT name FROM programs ORDER BY name ASC').all() as { name: string }[]).map(
    (row) => row.name,
  )
}

/** Insert a university and return the created row. */
export function insertUniversity(
  data: Partial<Omit<UniversityRow, 'id' | 'created_at'>> & Pick<UniversityRow, 'name' | 'city' | 'min_ent_score'>,
): UniversityRow {
  const payload = {
    short_name: null,
    legal_name: null,
    region: null,
    institution_type: 'university',
    website: null,
    description: null,
    address: null,
    founded_year: null,
    email: null,
    rector_name: null,
    rector_contacts: null,
    nct_code: null,
    ...data,
  }
  const stmt = db.prepare(`
    INSERT INTO universities (
      name, short_name, legal_name, city, region, institution_type, min_ent_score,
      website, description, address, founded_year, email, rector_name, rector_contacts, nct_code
    ) VALUES (
      @name, @short_name, @legal_name, @city, @region, @institution_type, @min_ent_score,
      @website, @description, @address, @founded_year, @email, @rector_name, @rector_contacts, @nct_code
    )
  `)
  const result = stmt.run(payload)
  return findUniversityById(Number(result.lastInsertRowid))!
}

/** Update university fields and return the updated row. */
export function updateUniversity(id: number, fields: Partial<UniversityRow>): UniversityRow | undefined {
  const existing = findUniversityById(id)
  if (!existing) return undefined

  const next = { ...existing, ...fields, id: existing.id, created_at: existing.created_at }
  db.prepare(`
    UPDATE universities SET
      name = @name, short_name = @short_name, legal_name = @legal_name, city = @city, region = @region,
      institution_type = @institution_type, min_ent_score = @min_ent_score, website = @website,
      description = @description, address = @address, founded_year = @founded_year, email = @email,
      rector_name = @rector_name, rector_contacts = @rector_contacts, nct_code = @nct_code
    WHERE id = @id
  `).run(next)
  return findUniversityById(id)
}

/** Delete a university by id. */
export function deleteUniversity(id: number): boolean {
  const result = db.prepare('DELETE FROM universities WHERE id = ?').run(id)
  return result.changes > 0
}

/** Insert a program row. */
export function insertProgram(
  data: Partial<Omit<ProgramRow, 'id'>> & Pick<ProgramRow, 'university_id' | 'name' | 'min_ent_score'>,
): ProgramRow {
  const payload = {
    specialty_code: null,
    gop_code: null,
    education_field_code: null,
    education_field_name: null,
    study_form: null,
    language: 'kaz/ru',
    grant_min_ent_score: null,
    source_year: null,
    ...data,
  }
  const stmt = db.prepare(`
    INSERT INTO programs (
      university_id, name, specialty_code, gop_code, education_field_code, education_field_name,
      study_form, language, min_ent_score, grant_min_ent_score, source_year
    ) VALUES (
      @university_id, @name, @specialty_code, @gop_code, @education_field_code, @education_field_name,
      @study_form, @language, @min_ent_score, @grant_min_ent_score, @source_year
    )
  `)
  const result = stmt.run(payload)
  return db.prepare('SELECT * FROM programs WHERE id = ?').get(result.lastInsertRowid) as ProgramRow
}

/** Find university by name and city for CSV import upsert logic. */
export function findUniversityByNameCity(name: string, city: string): UniversityRow | undefined {
  return db
    .prepare('SELECT * FROM universities WHERE name = ? AND city = ?')
    .get(name, city) as UniversityRow | undefined
}

/** Aggregate dashboard statistics. */
export function getDashboardStats() {
  const universitiesCount = (db.prepare('SELECT COUNT(*) AS count FROM universities').get() as { count: number }).count
  const programsCount = (db.prepare('SELECT COUNT(*) AS count FROM programs').get() as { count: number }).count
  const citiesCount = (db.prepare('SELECT COUNT(DISTINCT city) AS count FROM universities').get() as { count: number })
    .count
  const avgMinEnt =
    (db.prepare('SELECT AVG(min_ent_score) AS avg FROM programs').get() as { avg: number | null }).avg ?? 0
  const topCities = db
    .prepare(`SELECT city, COUNT(*) AS count FROM universities GROUP BY city ORDER BY count DESC LIMIT 5`)
    .all() as { city: string; count: number }[]

  return {
    universities_count: universitiesCount,
    programs_count: programsCount,
    cities_count: citiesCount,
    avg_min_ent: Math.round(Number(avgMinEnt) * 10) / 10,
    top_cities: topCities,
  }
}

/** Insert admin user if missing. */
export function insertUser(
  email: string,
  hashedPassword: string,
  fullName: string,
  role: 'user' | 'admin' = 'user',
): UserRow {
  const result = db
    .prepare('INSERT INTO users (email, hashed_password, full_name, role) VALUES (?, ?, ?, ?)')
    .run(email, hashedPassword, fullName, role)
  return db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as UserRow
}

/** Create a regular user account and return the created row. */
export function createUser(email: string, hashedPassword: string, fullName: string): UserRow {
  return insertUser(email, hashedPassword, fullName, 'user')
}
