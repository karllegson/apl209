'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Check, Square, ChevronDown, ChevronRight, Loader2, Plus } from 'lucide-react'

const API = '/api/admin/sharefile-checklist'

function fetchOptions(method, body) {
  const opts = { method, credentials: 'include', headers: { 'Content-Type': 'application/json' } }
  if (body != null) opts.body = JSON.stringify(body)
  return opts
}
export default function AdminSharefileChecklist({ onCompletionChange }) {
  const [items, setItems] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [needsMigration, setNeedsMigration] = useState(false)
  const [emptyMessage, setEmptyMessage] = useState(null)
  const [showListWhenAllDone, setShowListWhenAllDone] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addLabel, setAddLabel] = useState('')
  const [addSubmitting, setAddSubmitting] = useState(false)

  const loadItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(API, fetchOptions('GET'))
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      const list = (data.items || []).map((x) => ({
        id: x.id,
        label: x.label || '',
        checked: !!x.checked,
        moreInfo: x.moreInfo || '',
        tool: x.tool || '',
        canEditMoreInfo: !!x.canEditMoreInfo,
      }))
      setItems(list)
      setNeedsMigration(Boolean(data.needsMigration))
      setEmptyMessage(data.message || null)
    } catch (err) {
      setError(err.message || 'Failed to load Sharefile checklist')
      setItems([])
      setNeedsMigration(false)
      setEmptyMessage(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const toggleChecked = async (id) => {
    const current = items.find((item) => item.id === id)
    if (!current) return
    const nextChecked = !current.checked
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked: nextChecked } : item)))
    try {
      const res = await fetch(`${API}/${id}`, fetchOptions('PATCH', { checked: nextChecked }))
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }
    } catch (err) {
      // revert on error
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked: current.checked } : item)))
      setError(err.message || 'Failed to update checklist item')
    }
  }

  const toggleExpanded = (id) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const startAdd = () => {
    setAdding(true)
    setAddLabel('')
    setError(null)
  }

  const cancelAdd = () => {
    setAdding(false)
    setAddLabel('')
  }

  const submitAdd = async () => {
    const label = addLabel.trim()
    if (!label) return
    setAddSubmitting(true)
    setError(null)
    try {
      const res = await fetch(API, fetchOptions('POST', { label }))
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      const newItem = data.item
      if (newItem) {
        setItems((prev) => [...prev, {
          id: newItem.id,
          label: newItem.label || '',
          checked: !!newItem.checked,
          moreInfo: newItem.moreInfo || '',
          tool: newItem.tool || '',
          canEditMoreInfo: !!newItem.canEditMoreInfo,
        }])
      } else {
        await loadItems()
      }
      setAdding(false)
      setAddLabel('')
    } catch (err) {
      setError(err.message || 'Failed to add item')
    } finally {
      setAddSubmitting(false)
    }
  }

  const allDone = items.length > 0 && items.every((item) => item.checked)

  const latestOnCompletionChange = useRef(onCompletionChange)

  useEffect(() => {
    latestOnCompletionChange.current = onCompletionChange
  }, [onCompletionChange])

  useEffect(() => {
    if (typeof latestOnCompletionChange.current === 'function') {
      latestOnCompletionChange.current(allDone)
    }
  }, [allDone])

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 flex items-center justify-center text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span className="text-sm">Loading Sharefile checklist…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    )
  }

  const loadDefaultList = async () => {
    setLoading(true)
    setError(null)
    setNeedsMigration(false)
    setEmptyMessage(null)
    try {
      const res = await fetch(`${API}?reseed=1`, fetchOptions('GET'))
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      const list = (data.items || []).map((x) => ({
        id: x.id,
        label: x.label || '',
        checked: !!x.checked,
        moreInfo: x.moreInfo || '',
        tool: x.tool || '',
        canEditMoreInfo: !!x.canEditMoreInfo,
      }))
      setItems(list)
    } catch (err) {
      setError(err.message || 'Failed to load default checklist')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-4 text-sm text-slate-600 space-y-3">
        {emptyMessage && <p>{emptyMessage}</p>}
        {!emptyMessage && <p>Sharefile checklist items will appear here once configured.</p>}
        <button
          type="button"
          onClick={loadDefaultList}
          className="inline-flex items-center gap-1.5 rounded-lg bg-apl-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-apl-primary/90 transition-colors"
        >
          Load default checklist
        </button>
      </div>
    )
  }

  if (allDone && !showListWhenAllDone) {
    return (
      <div className="rounded-xl border border-slate-200 bg-emerald-50/80 px-4 py-3 text-sm text-slate-700 flex flex-wrap items-center justify-between gap-3">
        <span>All Sharefile items completed.</span>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={loadDefaultList}
            className="text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            Reset to full list
          </button>
          <button
            type="button"
            onClick={() => setShowListWhenAllDone(true)}
            className="text-xs font-medium text-apl-primary hover:text-apl-blue-dark"
          >
            Show checklist
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={loadDefaultList}
          className="text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          Reset to full list
        </button>
        {allDone && (
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
            disabled={!addLabel.trim() || addSubmitting}
            className="rounded-lg bg-apl-primary px-3 py-2 text-xs font-medium text-white hover:bg-apl-primary/90 disabled:opacity-50 disabled:pointer-events-none"
          >
            {addSubmitting ? 'Adding…' : 'Add'}
          </button>
          <button
            type="button"
            onClick={cancelAdd}
            disabled={addSubmitting}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      )}
      <ul className="divide-y divide-slate-100">
        {items.map((item) => {
          const isExpanded = expandedId === item.id
          const hasMoreInfo = true
          const hasTool = !!item.tool
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
                    {(hasMoreInfo || hasTool) && (
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
                    )}
                  </div>
                  {isExpanded && (hasMoreInfo || hasTool) && (
                    <div className="mt-2 pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                      {hasMoreInfo && (
                        <textarea
                          value={item.moreInfo || ''}
                          onChange={(e) => {
                            const text = e.target.value
                            setItems((prev) =>
                              prev.map((x) =>
                                x.id === item.id ? { ...x, moreInfo: text } : x
                              )
                            )
                          }}
                          onBlur={async (e) => {
                            const text = e.target.value
                            try {
                              const res = await fetch(`${API}/${item.id}`, fetchOptions('PATCH', { moreInfo: text }))
                              if (!res.ok) {
                                const data = await res.json().catch(() => ({}))
                                throw new Error(data.error || `HTTP ${res.status}`)
                              }
                            } catch (err) {
                              setError(err.message || 'Failed to save more info')
                              loadItems()
                            }
                          }}
                          placeholder="Notes or instructions…"
                          rows={3}
                          className="w-full resize-y rounded-md bg-slate-100/70 text-xs text-slate-600 placeholder:text-slate-400 placeholder:not-italic px-3 py-2 border-0 shadow-inner focus:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-300/60"
                        />
                      )}
                      {hasTool && item.tool === 'covetrusTax' && (
                        <Link
                          href="/admin/tools/covetrus"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-apl-primary hover:text-apl-blue-dark"
                        >
                          Open Covetrus tax tool →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
                <div className="shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={async () => {
                      const id = item.id
                      setItems((prev) => prev.filter((x) => x.id !== id))
                      try {
                        const res = await fetch(`${API}/${id}`, fetchOptions('DELETE'))
                        if (!res.ok) {
                          const data = await res.json().catch(() => ({}))
                          throw new Error(data.error || `HTTP ${res.status}`)
                        }
                      } catch (err) {
                        setError(err.message || 'Failed to delete item')
                        // reload from server to recover
                        loadItems()
                      }
                    }}
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

