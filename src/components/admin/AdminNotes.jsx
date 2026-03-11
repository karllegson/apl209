'use client'

import { useState, useEffect, useCallback } from 'react'
import { StickyNote, Plus, Trash2, Check, Square, Loader2 } from 'lucide-react'

const API = '/api/admin/notes'

function fetchOptions(method, body) {
  const opts = { method, credentials: 'include', headers: { 'Content-Type': 'application/json' } }
  if (body != null) opts.body = JSON.stringify(body)
  return opts
}

export default function AdminNotes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [pendingId, setPendingId] = useState(null)

  const loadNotes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(API, fetchOptions('GET'))
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      const list = (data.notes || []).map((n) => ({
        id: n.id,
        text: n.text || '',
        checked: !!n.checked,
        createdAt: n.createdAt || n.created_at,
      }))
      setNotes(list)
    } catch (err) {
      setError(err.message || 'Failed to load notes')
      setNotes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  const addNote = async () => {
    const text = draft.trim()
    if (!text) {
      setShowNew(false)
      setDraft('')
      return
    }
    setPendingId('add')
    try {
      const res = await fetch(API, fetchOptions('POST', { text }))
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      const note = data.note
      if (note) {
        setNotes((prev) => [
          { id: note.id, text: note.text, checked: !!note.checked, createdAt: note.createdAt || note.created_at },
          ...prev,
        ])
      }
      setDraft('')
      setShowNew(false)
    } catch (err) {
      setError(err.message || 'Failed to add note')
    } finally {
      setPendingId(null)
    }
  }

  const updateNote = async (id, text) => {
    const trimmed = text.trim()
    if (!trimmed) {
      await removeNote(id)
      setEditingId(null)
      return
    }
    setPendingId(id)
    try {
      const res = await fetch(`/api/admin/notes/${id}`, fetchOptions('PATCH', { text: trimmed }))
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      if (data.deleted) {
        setNotes((prev) => prev.filter((n) => n.id !== id))
      } else if (data.note) {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === id
              ? { ...n, text: data.note.text, checked: !!data.note.checked, createdAt: data.note.createdAt || data.note.created_at }
              : n
          )
        )
      }
      setEditingId(null)
    } catch (err) {
      setError(err.message || 'Failed to update note')
    } finally {
      setPendingId(null)
    }
  }

  const removeNote = async (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
    if (editingId === id) setEditingId(null)
    try {
      const res = await fetch(`/api/admin/notes/${id}`, fetchOptions('DELETE'))
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }
    } catch (err) {
      setError(err.message || 'Failed to delete note')
      loadNotes()
    }
  }

  const toggleChecked = async (id) => {
    const note = notes.find((n) => n.id === id)
    if (!note) return
    const nextChecked = !note.checked
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, checked: nextChecked } : n)))
    try {
      const res = await fetch(`/api/admin/notes/${id}`, fetchOptions('PATCH', { checked: nextChecked }))
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }
    } catch (err) {
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, checked: note.checked } : n)))
      setError(err.message || 'Failed to update')
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-amber-500 shrink-0" />
          <h3 className="text-sm font-semibold text-slate-800">Notes & reminders</h3>
        </div>
        <button
          type="button"
          onClick={() => { setShowNew(true); setDraft(''); setError(null); }}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-apl-primary hover:bg-apl-blue-50 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add note
        </button>
      </div>
      <div className="p-4 space-y-3">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-8 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <>
            {showNew && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Reminder or note..."
                  className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-apl-primary/30 focus:border-apl-primary"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addNote()
                    if (e.key === 'Escape') { setShowNew(false); setDraft(''); }
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={addNote}
                  disabled={pendingId === 'add'}
                  className="px-3 py-2 rounded-lg bg-apl-primary text-white text-sm font-medium hover:bg-apl-blue-dark disabled:opacity-60"
                >
                  {pendingId === 'add' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </button>
              </div>
            )}
            {notes.length === 0 && !showNew && (
              <p className="text-sm text-slate-500">No notes yet. Add reminders or notes above.</p>
            )}
            <ul className="space-y-2">
              {notes.map((note) => (
                <li key={note.id} className="group flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => toggleChecked(note.id)}
                    className="shrink-0 mt-0.5 p-0.5 rounded text-slate-400 hover:text-apl-primary transition-colors"
                    aria-label={note.checked ? 'Uncheck' : 'Check'}
                  >
                    {note.checked ? (
                      <Check className="w-5 h-5 text-apl-primary" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                  {editingId === note.id ? (
                    <input
                      type="text"
                      defaultValue={note.text}
                      className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-apl-primary/30"
                      onBlur={(e) => updateNote(note.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.target.blur()
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      autoFocus
                    />
                  ) : (
                    <>
                      <span
                        className={`flex-1 text-sm cursor-text py-0.5 rounded hover:bg-slate-50 min-w-0 ${note.checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}
                        onClick={() => setEditingId(note.id)}
                      >
                        {note.text}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeNote(note.id)}
                        className="shrink-0 p-1 rounded text-slate-300 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                        aria-label="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
