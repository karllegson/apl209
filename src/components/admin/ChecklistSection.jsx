'use client'

import { useState, useEffect } from 'react'
import { Check, Square, Plus, ChevronDown, ChevronRight } from 'lucide-react'

function loadItems(storageKey, defaultItems) {
  if (typeof window === 'undefined') return defaultItems
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return defaultItems
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((x) => ({
        id: String(x.id || crypto.randomUUID()),
        label: String(x.label || '').trim() || 'Untitled',
        checked: Boolean(x.checked),
        moreInfo: String(x.moreInfo || ''),
      }))
    }
    return defaultItems.map((x) => ({
      id: String(x.id),
      label: String(x.label || '').trim() || 'Untitled',
      checked: Boolean(x.checked),
      moreInfo: '',
    }))
  } catch {
    return defaultItems
  }
}

function saveItems(storageKey, items) {
  if (typeof window === 'undefined') return
  try {
    const toSave = items
      .filter((x) => x.label)
      .map((x) => ({ id: x.id, label: x.label, checked: x.checked, moreInfo: x.moreInfo ?? '' }))
    window.localStorage.setItem(storageKey, JSON.stringify(toSave))
  } catch (_) {}
}

export default function ChecklistSection({ storageKey, title, description, defaultItems, isActive, visible = true }) {
  const [items, setItems] = useState(defaultItems)
  const [expandedId, setExpandedId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [addLabel, setAddLabel] = useState('')
  const [showListWhenAllDone, setShowListWhenAllDone] = useState(false)

  useEffect(() => {
    setItems(loadItems(storageKey, defaultItems))
  }, [storageKey])

  useEffect(() => {
    saveItems(storageKey, items)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('apl-checklist-changed', { detail: { storageKey } }))
    }
  }, [storageKey, items])

  const toggleChecked = (id) => {
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, checked: !x.checked } : x))
    )
  }

  const removeItem = (id) => {
    setItems((prev) => prev.filter((x) => x.id !== id))
    if (expandedId === id) setExpandedId(null)
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

  const updateMoreInfo = (id, text) => {
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, moreInfo: String(text ?? '') } : x))
    )
  }

  const toggleExpanded = (id) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const startAdd = () => {
    setAdding(true)
    setAddLabel('')
  }

  const cancelAdd = () => {
    setAdding(false)
    setAddLabel('')
  }

  const submitAdd = () => {
    const label = addLabel.trim()
    if (!label) return
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label, checked: false, moreInfo: '' },
    ])
    setAdding(false)
    setAddLabel('')
  }

  if (!visible) {
    return null
  }

  const hasItems = items.length > 0
  const allCompleted = hasItems && items.every((x) => x.checked)

  if (allCompleted && !showListWhenAllDone) {
    return (
      <div className="rounded-xl border-2 border-slate-200 bg-emerald-50/80 px-4 py-3 text-sm text-slate-700 flex flex-wrap items-center justify-between gap-3">
        <span>All items completed.</span>
        <button
          type="button"
          onClick={() => setShowListWhenAllDone(true)}
          className="text-xs font-medium text-apl-primary hover:text-apl-blue-dark"
        >
          Show checklist
        </button>
      </div>
    )
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
        <div className="flex items-center gap-2">
          {isActive && (
            <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-apl-primary/15 text-apl-primary">
              Active now
            </span>
          )}
          {allCompleted && (
            <button
              type="button"
              onClick={() => setShowListWhenAllDone(false)}
              className="text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              Hide checklist
            </button>
          )}
          {!adding && (
            <button
              type="button"
              onClick={startAdd}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-apl-primary hover:text-apl-blue-dark"
            >
              <Plus className="w-3.5 h-3.5" />
              Add item
            </button>
          )}
        </div>
      </div>
      {adding && (
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={addLabel}
            onChange={(e) => setAddLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitAdd()
              if (e.key === 'Escape') cancelAdd()
            }}
            placeholder="New item label"
            className="flex-1 min-w-[140px] rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-apl-primary focus:outline-none focus:ring-1 focus:ring-apl-primary"
            autoFocus
          />
          <button
            type="button"
            onClick={submitAdd}
            disabled={!addLabel.trim()}
            className="rounded-lg bg-apl-primary px-3 py-2 text-xs font-medium text-white hover:bg-apl-primary/90 disabled:opacity-50 disabled:pointer-events-none"
          >
            Add
          </button>
          <button
            type="button"
            onClick={cancelAdd}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      )}
      <ul className="divide-y divide-slate-100">
        {items.map((item) => {
          const isExpanded = expandedId === item.id
          return (
            <li key={item.id} className="group">
              <div className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50/60 transition-colors">
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
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm ${
                        item.checked ? 'text-slate-400 line-through' : 'text-slate-800'
                      }`}
                    >
                      {item.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleExpanded(item.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                      <span>More info</span>
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="mt-2 pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                      <textarea
                        value={item.moreInfo ?? ''}
                        onChange={(e) => updateMoreInfo(item.id, e.target.value)}
                        placeholder="Notes or instructions…"
                        rows={3}
                        className="w-full resize-y rounded-md bg-slate-100/70 text-xs text-slate-600 placeholder:text-slate-400 placeholder:not-italic px-3 py-2 border-0 shadow-inner focus:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-300/60"
                      />
                    </div>
                  )}
                </div>
                <div className="shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-slate-400 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
