import { useState } from 'react'
import { apiRequest } from './api'

function toDateInputValue(value) {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

export default function AdminRecordManager({ collection, records, token, onRecordsChange }) {
  const [draft, setDraft] = useState({ title: '', completionDate: '', description: '' })
  const [editingId, setEditingId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  function startEditing(record) {
    setEditingId(record._id)
    setDraft({
      title: record.title,
      completionDate: toDateInputValue(record.completionDate),
      description: record.description,
    })
    setError('')
    setNotice('')
  }

  function cancelEditing() {
    setEditingId(null)
    setDraft({ title: '', completionDate: '', description: '' })
    setError('')
    setNotice('')
  }

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const path = `/${collection}${editingId ? `/${editingId}` : ''}`
      const savedRecord = await apiRequest(path, {
        token,
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(draft),
      })
      const updatedRecords = editingId
        ? records.map((record) => (record._id === editingId ? savedRecord : record))
        : [...records, savedRecord]
      onRecordsChange(updatedRecords)
      setNotice(editingId ? 'Changes saved.' : 'Record added.')
      setEditingId(null)
      setDraft({ title: '', completionDate: '', description: '' })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  async function remove(record) {
    if (!window.confirm(`Delete “${record.title}”? This cannot be undone.`)) return

    setBusy(true)
    setError('')
    setNotice('')
    try {
      await apiRequest(`/${collection}/${record._id}`, { token, method: 'DELETE' })
      onRecordsChange(records.filter((item) => item._id !== record._id))
      if (editingId === record._id) cancelEditing()
      setNotice('Record deleted.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="admin-panel" aria-label={`${collection} administration`}>
      <div className="admin-panel-heading">
        <div>
          <p className="eyebrow">Administrator tools</p>
          <h2>Manage {collection}</h2>
        </div>
        {editingId && <button className="quiet-button" onClick={cancelEditing} type="button">Cancel edit</button>}
      </div>

      <form className="admin-form" onSubmit={submit}>
        <label>
          Title
          <input
            maxLength="120"
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            required
            value={draft.title}
          />
        </label>
        <label>
          Completion date
          <input
            onChange={(event) => setDraft({ ...draft, completionDate: event.target.value })}
            required
            type="date"
            value={draft.completionDate}
          />
        </label>
        <label>
          Description
          <textarea
            maxLength="2000"
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            required
            rows="3"
            value={draft.description}
          />
        </label>
        <button className="button button-dark" disabled={busy} type="submit">
          {busy ? 'Saving…' : editingId ? 'Save changes' : `Add ${collection.slice(0, -1)}`}
        </button>
      </form>

      {error && <p className="form-message form-error" role="alert">{error}</p>}
      {notice && <p className="form-message" role="status">{notice}</p>}

      {records.length === 0 ? (
        <p className="admin-empty">No saved {collection} yet.</p>
      ) : (
        <ul className="admin-record-list">
          {records.map((record) => (
            <li key={record._id}>
              <div>
                <strong>{record.title}</strong>
                <span>{new Date(record.completionDate).toLocaleDateString()}</span>
              </div>
              <div className="admin-actions">
                <button className="quiet-button" disabled={busy} onClick={() => startEditing(record)} type="button">Edit</button>
                <button className="quiet-button danger-button" disabled={busy} onClick={() => remove(record)} type="button">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
