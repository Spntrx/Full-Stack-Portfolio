import { useState } from 'react'
import { apiRequest } from './api'

export default function AdminContactPanel({ token, records, loading, error, onRecordsChange }) {
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState({})
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [actionError, setActionError] = useState('')

  function edit(record) {
    setEditingId(record._id)
    setDraft({
      firstName: record.firstName,
      lastName: record.lastName,
      contactNumber: record.contactNumber,
      email: record.email,
      message: record.message,
    })
    setActionError('')
    setMessage('')
  }

  async function save(event) {
    event.preventDefault()
    setBusy(true)
    setActionError('')
    setMessage('')
    try {
      const updated = await apiRequest(`/contacts/${editingId}`, {
        token,
        method: 'PUT',
        body: JSON.stringify(draft),
      })
      onRecordsChange(records.map((record) => (record._id === editingId ? updated : record)))
      setEditingId(null)
      setDraft({})
      setMessage('Contact updated.')
    } catch (requestError) {
      setActionError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  async function remove(record) {
    if (!window.confirm(`Delete the message from ${record.firstName} ${record.lastName}?`)) return

    setBusy(true)
    setActionError('')
    setMessage('')
    try {
      await apiRequest(`/contacts/${record._id}`, { token, method: 'DELETE' })
      onRecordsChange(records.filter((item) => item._id !== record._id))
      if (editingId === record._id) {
        setEditingId(null)
        setDraft({})
      }
      setMessage('Contact deleted.')
    } catch (requestError) {
      setActionError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="admin-panel contact-admin-panel" aria-label="Contact administration">
      <div className="admin-panel-heading">
        <div>
          <p className="eyebrow">Administrator tools</p>
          <h2>Contact submissions</h2>
        </div>
        {editingId && (
          <button className="quiet-button" onClick={() => { setEditingId(null); setDraft({}) }} type="button">
            Cancel edit
          </button>
        )}
      </div>
      {loading && <p className="form-message" role="status">Loading submissions…</p>}
      {error && <p className="form-message form-error" role="alert">{error}</p>}
      {actionError && <p className="form-message form-error" role="alert">{actionError}</p>}
      {message && <p className="form-message" role="status">{message}</p>}
      {!loading && !error && records.length === 0 && <p className="admin-empty">No contact submissions yet.</p>}

      <ul className="contact-record-list">
        {records.map((record) => (
          <li key={record._id}>
            {editingId === record._id ? (
              <form className="admin-form" onSubmit={save}>
                {['firstName', 'lastName', 'contactNumber', 'email', 'message'].map((field) => (
                  <label key={field}>
                    {field === 'contactNumber' ? 'Contact number' : field === 'email' ? 'Email address' : field[0].toUpperCase() + field.slice(1)}
                    {field === 'message' ? (
                      <textarea
                        maxLength="2000"
                        onChange={(event) => setDraft({ ...draft, [field]: event.target.value })}
                        required
                        rows="3"
                        value={draft[field] || ''}
                      />
                    ) : (
                      <input
                        maxLength={field === 'contactNumber' ? 40 : field === 'email' ? 254 : 100}
                        minLength={field === 'contactNumber' ? 7 : undefined}
                        onChange={(event) => setDraft({ ...draft, [field]: event.target.value })}
                        pattern={field === 'contactNumber' ? '[+()0-9 .-]{7,40}' : undefined}
                        required
                        type={field === 'email' ? 'email' : 'text'}
                        value={draft[field] || ''}
                      />
                    )}
                  </label>
                ))}
                <button className="button button-dark" disabled={busy} type="submit">{busy ? 'Saving…' : 'Save contact'}</button>
              </form>
            ) : (
              <>
                <div>
                  <strong>{record.firstName} {record.lastName}</strong>
                  <span>{record.email} · {record.contactNumber}</span>
                  <p>{record.message}</p>
                  <time dateTime={record.createdAt}>{new Date(record.createdAt).toLocaleString()}</time>
                </div>
                <div className="admin-actions">
                  <button className="quiet-button" disabled={busy} onClick={() => edit(record)} type="button">Edit</button>
                  <button className="quiet-button danger-button" disabled={busy} onClick={() => remove(record)} type="button">Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
