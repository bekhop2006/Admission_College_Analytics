import { type FormEvent, useEffect, useState } from 'react'
import { createUniversity, deleteUniversity, fetchAdminUniversities } from '../../api/client'
import type { University } from '../../types'

/** Admin CRUD list for universities. */
export function UniversitiesAdminPage() {
  const [items, setItems] = useState<University[]>([])
  const [form, setForm] = useState({
    name: '',
    city: '',
    min_ent_score: 70,
    institution_type: 'university',
    website: '',
    description: '',
  })

  /** Reload university list from API. */
  function load() {
    fetchAdminUniversities().then(setItems).catch(() => setItems([]))
  }

  useEffect(() => {
    load()
  }, [])

  /** Create a new university from the form. */
  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    await createUniversity({
      ...form,
      website: form.website || null,
      description: form.description || null,
    })
    setForm({ name: '', city: '', min_ent_score: 70, institution_type: 'university', website: '', description: '' })
    load()
  }

  /** Delete university by id after confirmation. */
  async function handleDelete(id: number, name: string) {
    if (!confirm(`Удалить «${name}»?`)) return
    await deleteUniversity(id)
    load()
  }

  return (
    <div className="admin-section">
      <h1>Вузы и колледжи</h1>

      <form className="admin-form" onSubmit={handleCreate}>
        <input
          placeholder="Название"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Город"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          required
        />
        <input
          type="number"
          min={0}
          max={140}
          value={form.min_ent_score}
          onChange={(e) => setForm({ ...form, min_ent_score: Number(e.target.value) })}
        />
        <select
          value={form.institution_type}
          onChange={(e) => setForm({ ...form, institution_type: e.target.value })}
        >
          <option value="university">ВУЗ</option>
          <option value="college">Колледж</option>
        </select>
        <button type="submit" className="btn-primary">
          Добавить
        </button>
      </form>

      <table className="programs-table admin-table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Город</th>
            <th>Мин. ЕНТ</th>
            <th>Программ</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.city}</td>
              <td>{u.min_ent_score}</td>
              <td>{u.programs?.length ?? 0}</td>
              <td>
                <button type="button" className="btn-danger" onClick={() => handleDelete(u.id, u.name)}>
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
