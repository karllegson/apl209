'use client'

import { useState, useEffect } from 'react'
import { StickyNote, Plus, Trash2, Check, Square } from 'lucide-react'

const STORAGE_KEY = 'apl-admin-notes'

function loadNotes() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.map((n) => ({
          id: String(n.id || crypto.randomUUID()),
          text: String(n.text || '').trim(),
          checked: Boolean(n.checked),
          createdAt: n.createdAt || new Date().toISOString(),
        })).filter((n) => n.text)
      : []
  } catch {
    return []
  }
}

function saveNotes(notes) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  } catch (_) {}
}

export default function AdminNotes() {
  const [notes, setNotes] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState('')
  const [showNew, setShowNew] = useState(false)

  useEffect(() => {
    setNotes(loadNotes())
  }, [])

  useEffect(() => {
    saveNotes(notes)
  }, [notes])

  const addNote = () => {
    const text = draft.trim()
    if (!text) {
      setShowNew(false)
      setDraft('')
      return
    }
    const id = crypto.randomUUID()
    setNotes((prev) => [{ id, text, checked: false, createdAt: new Date().toISOString() }, ...prev])
    setDraft('')
    setShowNew(false)
  }

  const updateNote = (id, text) => {
    const trimmed = text.trim()
    if (!trimmed) {
      setNotes((prev) => prev.filter((n) => n.id !== id))
      setEditingId(null)
      return
    }
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, text: trimmed } : n))
    )
    setEditingId(null)
  }

  const removeNote = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
    if (editingId === id) setEditingId(null)
  }

  const toggleChecked = (id) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, checked: !n.checked } : n))
    )
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
          onClick={() => { setShowNew(true); setDraft(''); }}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-apl-primary hover:bg-apl-blue-50 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add note
        </button>
      </div>
      <div className="p-4 space-y-3">
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
              className="px-3 py-2 rounded-lg bg-apl-primary text-white text-sm font-medium hover:bg-apl-blue-dark"
            >
              Save
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
      </div>
    </div>
  )
}
