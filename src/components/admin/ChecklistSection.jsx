'use client'

import { useState, useEffect } from 'react'
import { Check, Square, Plus, Trash2 } from 'lucide-react'

function loadItems(storageKey, defaultItems) {
  if (typeof window === 'undefined') return defaultItems
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return defaultItems
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed.map((x) => ({
          id: String(x.id || crypto.randomUUID()),
          label: String(x.label || '').trim() || 'Untitled',
          checked: Boolean(x.checked),
        }))
      : defaultItems
  } catch {
    return defaultItems
  }
}

function saveItems(storageKey, items) {
  if (typeof window === 'undefined') return
  try {
    const toSave = items
      .filter((x) => x.label && !x.isNew)
      .map(({ isNew, ...rest }) => rest)
    window.localStorage.setItem(storageKey, JSON.stringify(toSave))
  } catch (_) {}
}

export default function ChecklistSection({ storageKey, title, description, defaultItems, isActive, visible = true }) {
  const [items, setItems] = useState(defaultItems)

  useEffect(() => {
    setItems(loadItems(storageKey, defaultItems))
  }, [storageKey])

  useEffect(() => {
    saveItems(storageKey, items)
  }, [storageKey, items])

  const toggleChecked = (id) => {
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, checked: !x.checked } : x))
    )
  }

  const removeItem = (id) => {
    setItems((prev) => prev.filter((x) => x.id !== id))
  }

  const updateLabel = (id, label) => {
    const trimmed = (label || '').trim()
    if (!trimmed) {
      removeItem(id)
      return
    }
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, label: trimmed } : x))
    )
  }

  const addItem = () => {
    const id = crypto.randomUUID()
    setItems((prev) => [...prev, { id, label: '', checked: false, isNew: true }])
  }

  if (!visible) {
    return null
  }

  const hasItems = items.length > 0
  const allCompleted = hasItems && items.every((x) => x.checked)
  if (allCompleted) {
    // Hide fully completed checklists; user can re-add items by clearing localStorage if needed.
    return null
  }

  return (
    <div
      className={`rounded-xl border-2 overflow-hidden transition-colors ${
        isActive ? 'border-apl-primary/40 bg-white shadow-sm' : 'border-slate-200 bg-slate-50/50'
      }`}
    >
      <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        {isActive && (
          <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-apl-primary/15 text-apl-primary">
            Active now
          </span>
        )}
      </div>
      <ul className="divide-y divide-slate-100">
        {items.map((item) => (
          <li key={item.id} className="group flex items-start gap-2 sm:gap-3 px-4 py-3 hover:bg-slate-50/50">
            <button
              type="button"
              onClick={() => toggleChecked(item.id)}
              className="shrink-0 mt-0.5 p-0.5 rounded text-slate-400 hover:text-apl-primary transition-colors"
              aria-label={item.checked ? 'Uncheck' : 'Check'}
            >
              {item.checked ? (
                <Check className="w-5 h-5 text-apl-primary" />
              ) : (
                <Square className="w-5 h-5" />
              )}
            </button>
            <div className="min-w-0 flex-1">
              {item.isNew ? (
                <input
                  type="text"
                  placeholder="Type item..."
                  autoFocus
                  className="text-sm border border-slate-300 rounded-lg px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-apl-primary/30"
                  onBlur={(e) => {
                    const val = e.target.value.trim()
                    if (!val) {
                      removeItem(item.id)
                      return
                    }
                    updateLabel(item.id, val)
                    setItems((prev) =>
                      prev.map((x) => (x.id === item.id ? { ...x, isNew: false } : x))
                    )
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                  defaultValue=""
                />
              ) : (
                <span
                  className={`text-sm ${item.checked ? 'text-slate-400 line-through' : 'text-slate-800'}`}
                >
                  {item.label}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="shrink-0 p-1 rounded text-slate-300 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
              aria-label="Remove"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <div className="px-4 py-2 border-t border-slate-100">
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-apl-primary hover:bg-apl-blue-50 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add item
        </button>
      </div>
    </div>
  )
}
