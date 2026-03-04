'use client'

import { useState, useEffect } from 'react'
import { Check, Square, Plus, Trash2, ChevronDown, ChevronRight, FileDown, Link2 } from 'lucide-react'
import AdminJitasaReminder from './AdminJitasaReminder'

const STORAGE_KEY = 'apl-admin-jitasa-checklist'

const DEFAULT_ITEMS = [
  { id: '1', label: 'Gather expense receipts', checked: false },
  { id: '2', label: 'Export bank statement', checked: false, tool: 'export' },
  { id: '3', label: 'Compile invoice summary', checked: false, tool: 'notes' },
  { id: '4', label: 'Send package to Jitasa', checked: false, tool: 'link', linkLabel: 'Open email', linkHref: 'mailto:?subject=APL%20Documents%20-%20Month%20Submission&body=Please%20find%20attached%20documents%20for%20accounting.' },
]

function loadItems() {
  if (typeof window === 'undefined') return DEFAULT_ITEMS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_ITEMS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed.map((x) => ({
          id: String(x.id || crypto.randomUUID()),
          label: String(x.label || '').trim() || 'Untitled',
          checked: Boolean(x.checked),
          tool: x.tool || null,
          linkLabel: x.linkLabel || null,
          linkHref: x.linkHref || null,
          notes: x.notes || '',
        }))
      : DEFAULT_ITEMS
  } catch {
    return DEFAULT_ITEMS
  }
}

function saveItems(items) {
  if (typeof window === 'undefined') return
  try {
    const toSave = items
      .filter((x) => x.label && !x.isNew)
      .map(({ isNew, ...rest }) => rest)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch (_) {}
}

export default function AdminChecklist() {
  const [items, setItems] = useState(DEFAULT_ITEMS)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    setItems(loadItems())
  }, [])

  useEffect(() => {
    saveItems(items)
  }, [items])

  const toggleChecked = (id) => {
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, checked: !x.checked } : x))
    )
  }

  const updateNotes = (id, notes) => {
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, notes } : x))
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

  const addItem = () => {
    const id = crypto.randomUUID()
    setItems((prev) => [...prev, { id, label: '', checked: false, isNew: true }])
    setExpandedId(id)
  }

  const handleExport = () => {
    // Placeholder — can wire to real export later
    window.alert('Export would run here. Connect this to your bank export or reports API.')
  }

  return (
    <div className="space-y-4">
      <AdminJitasaReminder />
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Monthly checklist</h3>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-apl-primary hover:bg-apl-blue-50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add item
          </button>
        </div>
        <ul className="divide-y divide-slate-100">
          {items.map((item) => {
            const hasTool = !!item.tool
            const isExpanded = expandedId === item.id
            return (
              <li key={item.id} className="group">
                <div className="flex items-start gap-2 sm:gap-3 px-4 py-3 hover:bg-slate-50/50 transition-colors">
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
                      {item.isNew ? (
                        <input
                          type="text"
                          placeholder="Type item name..."
                          autoFocus
                          className="text-sm border border-slate-300 rounded-lg px-2 py-1 flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-apl-primary/30 focus:border-apl-primary"
                          onBlur={(e) => {
                            updateLabel(item.id, e.target.value)
                            setItems((prev) =>
                              prev.map((x) =>
                                x.id === item.id ? { ...x, isNew: false } : x
                              )
                            )
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.target.blur()
                            }
                          }}
                          defaultValue=""
                        />
                      ) : (
                        <span
                          className={`text-sm ${item.checked ? 'text-slate-400 line-through' : 'text-slate-800'}`}
                        >
                          {item.label}
                        </span>
                      )}
                      {hasTool && (
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className="shrink-0 p-1 rounded text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                          title="Show tool"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="shrink-0 p-1 rounded text-slate-300 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all ml-auto"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {hasTool && isExpanded && (
                      <div className="mt-3 pl-7 space-y-2">
                        {item.tool === 'export' && (
                          <button
                            type="button"
                            onClick={handleExport}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
                          >
                            <FileDown className="w-4 h-4" />
                            Export bank statement
                          </button>
                        )}
                        {item.tool === 'notes' && (
                          <textarea
                            value={item.notes || ''}
                            onChange={(e) => updateNotes(item.id, e.target.value)}
                            placeholder="Add notes..."
                            rows={2}
                            className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-apl-primary/30 focus:border-apl-primary resize-none"
                          />
                        )}
                        {item.tool === 'link' && item.linkHref && (
                          <a
                            href={item.linkHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-apl-blue-50 hover:bg-apl-blue-100 text-apl-primary text-sm font-medium transition-colors"
                          >
                            <Link2 className="w-4 h-4" />
                            {item.linkLabel || 'Open link'}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
