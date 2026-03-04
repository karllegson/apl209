'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminPageLoading from '@/components/AdminPageLoading'
import { MousePointerClick, RefreshCw, Lock, Copy, Check, Pencil, Plus, Trash2 } from 'lucide-react'

const LABELS_STORAGE_KEY = 'apl-analytics-link-labels'
const CUSTOM_ITEMS_STORAGE_KEY = 'apl-analytics-custom-items'
const FORM_SITE_BASE = 'https://apl209.vercel.app'

function getStoredLabels() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(LABELS_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

function getStoredCustomItems() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(CUSTOM_ITEMS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x) => x && typeof x.id === 'string' && x.id.trim()) : []
  } catch {
    return []
  }
}

// Add or rename items here; id must match ALLOWED_LINK_IDS in /lib/trackedLinkIds.js
const LINK_ITEMS = [
  { id: 'pricing-request-appointment', label: 'Pricing — Request appointment' },
  { id: 'pricing-back-to-home', label: 'Pricing — Back to home' },
  { id: 'google-business', label: 'Google Business profile' },
]

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const [staffName, setStaffName] = useState(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [linkClicks, setLinkClicks] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/me', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          router.replace('/admin')
          return null
        }
        return res.json()
      })
      .then((data) => {
        if (!data) return
        if (!data.staffName) {
          router.replace('/admin/who')
          return
        }
        setStaffName(data.staffName)
      })
      .catch(() => router.replace('/admin'))
      .finally(() => setAuthChecking(false))
  }, [router])

  useEffect(() => {
    if (!staffName) return
    const fetchStats = () => {
      setLoading(true)
      fetch('/api/stats', { credentials: 'include' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.stats?.linkClicks) setLinkClicks(data.stats.linkClicks)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
    fetchStats()
  }, [staffName])

  const canViewAnalytics = staffName === 'Karl Legson'
  const [copiedKey, setCopiedKey] = useState(null)
  const [customLabels, setCustomLabels] = useState({})
  const [customItems, setCustomItems] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editingValue, setEditingValue] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [addId, setAddId] = useState('')
  const [addLabel, setAddLabel] = useState('')

  useEffect(() => {
    setCustomLabels(getStoredLabels())
    setCustomItems(getStoredCustomItems())
  }, [])

  const getLabel = (id, defaultLabel) => (customLabels[id] != null && String(customLabels[id]).trim() !== '' ? String(customLabels[id]).trim() : defaultLabel)

  const saveLabel = (id, value) => {
    const trimmed = value.trim()
    const next = trimmed ? { ...customLabels, [id]: trimmed } : { ...customLabels }
    if (!trimmed) delete next[id]
    setCustomLabels(next)
    setEditingId(null)
    setEditingValue('')
    try {
      if (typeof window !== 'undefined') window.localStorage.setItem(LABELS_STORAGE_KEY, JSON.stringify(next))
    } catch (_) {}
  }

  const startEditing = (id, currentLabel) => {
    setEditingId(id)
    setEditingValue(currentLabel)
  }

  const saveCustomItems = (next) => {
    setCustomItems(next)
    try {
      if (typeof window !== 'undefined') window.localStorage.setItem(CUSTOM_ITEMS_STORAGE_KEY, JSON.stringify(next))
    } catch (_) {}
  }

  const handleAdd = () => {
    const id = addId.trim().toLowerCase().replace(/\s+/g, '-')
    const label = addLabel.trim()
    if (!id || !label) return
    const exists = [...LINK_ITEMS, ...customItems].some((x) => x.id === id)
    if (exists) {
      alert(`"${id}" already exists. Use a unique id.`)
      return
    }
    const next = [...customItems, { id, label }]
    saveCustomItems(next)
    setAddId('')
    setAddLabel('')
    setShowAddForm(false)
  }

  const removeCustomItem = (id) => {
    if (!customItems.some((x) => x.id === id)) return
    saveCustomItems(customItems.filter((x) => x.id !== id))
  }

  const allItems = [...LINK_ITEMS, ...customItems]

  const copyCode = (key, code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    })
  }

  useEffect(() => {
    if (!authChecking && staffName && staffName !== 'Karl Legson') {
      router.replace('/admin')
    }
  }, [authChecking, staffName, router])

  if (authChecking || loading) {
    return <AdminPageLoading />
  }

  if (!canViewAnalytics) {
    // Redirect in effect above; render nothing so non-Karl never sees analytics UI.
    return null
  }

  return (
    <>
      <header className="bg-white border-b border-slate-100 px-4 md:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="md:pl-0 pl-14">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-800">Analytics</h1>
                {loading && (
                  <span className="flex items-center gap-1.5 text-sm text-slate-500">
                    <span className="w-4 h-4 border-2 border-slate-300 border-t-apl-blue rounded-full animate-spin" />
                    Loading…
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">
                Link and button click tracking
              </p>
            </div>
            {canViewAnalytics && (
              <button
                onClick={() => {
                  setLoading(true)
                  fetch('/api/stats', { credentials: 'include' })
                    .then((res) => (res.ok ? res.json() : null))
                    .then((data) => {
                      if (data?.stats?.linkClicks) setLinkClicks(data.stats.linkClicks)
                    })
                    .finally(() => setLoading(false))
                }}
                disabled={loading}
                className="self-start md:self-auto flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-600 font-medium transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            )}
          </div>
        </header>

        <div className="p-4 md:p-8">
          {loading ? (
            <div className="space-y-4">
              <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-slate-200 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          ) : linkClicks && typeof linkClicks === 'object' ? (
            <div className="rounded-xl border-2 border-slate-200 bg-slate-50/80 p-4 md:p-6 max-w-3xl">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-slate-500" />
                Link / button clicks
              </p>
              <div className="mb-4 p-3 rounded-lg bg-slate-100 border border-slate-200 space-y-2 text-[11px] text-slate-600">
                <p className="font-semibold text-slate-700">How it works</p>
                <p><strong>Every URL below goes to the same form</strong> (your normal booking form). We only record <strong>where the click came from</strong> so you can see in the numbers: e.g. 50 from pricing page, 20 from your other site.</p>
                <p>Give each place (other website, pricing page, Google) its own URL from a card. Same form for everyone; we just count by source.</p>
                {/* Removed long JSX/trackClick instructions - focus on "same form, track source" */}
                <p className="hidden">Change <code className="bg-slate-200 px-1 rounded">href</code> to your URL (e.g. <code className="bg-slate-200 px-1 rounded">/book</code>). You don’t paste it onto an href — replace your normal link with this <code className="bg-slate-200 px-1 rounded">&lt;TrackedLink&gt;</code> component. Import: <code className="bg-slate-200 px-1 rounded">import TrackedLink from &apos;@/components/TrackedLink&apos;</code></p>
                <p className="hidden"><strong>JS:</strong> Use when it’s not a normal internal link — Call <code className="bg-slate-200 px-1 rounded">trackClick(&apos;id&apos;)</code> in the click handler. Import: <code className="bg-slate-200 px-1 rounded">import &#123; trackClick &#125; from &apos;@/lib/trackClick&apos;</code></p>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-apl-primary text-white text-sm font-medium hover:bg-apl-blue-dark"
                >
                  <Plus className="w-4 h-4" />
                  Add link
                </button>
                {showAddForm && (
                  <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-slate-200 bg-white">
                    <input
                      type="text"
                      placeholder="id (e.g. my-button)"
                      value={addId}
                      onChange={(e) => setAddId(e.target.value)}
                      className="text-sm rounded border border-slate-300 px-2 py-1.5 w-40 focus:outline-none focus:ring-2 focus:ring-apl-blue/50"
                    />
                    <input
                      type="text"
                      placeholder="Label"
                      value={addLabel}
                      onChange={(e) => setAddLabel(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                      className="text-sm rounded border border-slate-300 px-2 py-1.5 w-40 focus:outline-none focus:ring-2 focus:ring-apl-blue/50"
                    />
                    <button type="button" onClick={handleAdd} className="px-3 py-1.5 rounded bg-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-300">
                      Save
                    </button>
                    <button type="button" onClick={() => { setShowAddForm(false); setAddId(''); setAddLabel(''); }} className="text-slate-500 hover:text-slate-700 text-sm">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                New ids must be added to <code className="bg-slate-200 px-1 rounded">ALLOWED_LINK_IDS</code> in <code className="bg-slate-200 px-1 rounded">/lib/trackedLinkIds.js</code> or clicks won’t be recorded.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allItems.map(({ id, label: defaultLabel }) => {
                  const isCustom = customItems.some((x) => x.id === id)
                  const displayLabel = getLabel(id, defaultLabel)
                  const count = linkClicks[id] ?? 0
                  const linkSnippet = `<TrackedLink href="/book" linkId="${id}">${displayLabel}</TrackedLink>`
                  const scriptSnippet = `trackClick('${id}')`
                  const isEditing = editingId === id
                  return (
                    <div key={id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col gap-3">
                      <div className="flex items-center gap-2 min-h-[1.25rem]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => saveLabel(id, editingValue)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveLabel(id, editingValue)
                              if (e.key === 'Escape') {
                                setEditingId(null)
                                setEditingValue('')
                              }
                            }}
                            className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide flex-1 min-w-0 rounded border border-slate-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-apl-blue/50 focus:border-apl-blue"
                            autoFocus
                          />
                        ) : (
                          <>
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide flex-1">{displayLabel}</p>
                            <button
                              type="button"
                              onClick={() => startEditing(id, displayLabel)}
                              className="p-1 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 shrink-0"
                              title="Rename label"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            {isCustom && (
                              <button
                                type="button"
                                onClick={() => removeCustomItem(id)}
                                className="p-1 rounded text-slate-400 hover:bg-red-50 hover:text-red-600 shrink-0"
                                title="Remove"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-slate-800">{count}</p>
                      <div className="mt-auto space-y-2">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">URL for this source → form (we count clicks from here)</p>
                        <div className="relative">
                          <pre className="text-[11px] bg-apl-blue/10 rounded-lg p-2 pr-9 text-slate-800 overflow-x-auto whitespace-pre-wrap break-all font-mono border border-apl-blue/20">
                            {FORM_SITE_BASE + `/t/${id}`}
                          </pre>
                          <button
                            type="button"
                            onClick={() => copyCode(`${id}-href`, FORM_SITE_BASE + `/t/${id}`)}
                            className="absolute top-2 right-2 p-1 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                            title="Copy href"
                          >
                            {copiedKey === `${id}-href` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500">Use this href for this source. Everyone lands on the form; we just record that they came from here.</p>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Or in this app (JSX)</p>
                        <div className="relative">
                          <pre className="text-[11px] bg-slate-100 rounded-lg p-2 pr-9 text-slate-700 overflow-x-auto whitespace-pre-wrap break-all font-mono">
                            {linkSnippet}
                          </pre>
                          <button
                            type="button"
                            onClick={() => copyCode(`${id}-link`, linkSnippet)}
                            className="absolute top-2 right-2 p-1 rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                            title="Copy"
                          >
                            {copiedKey === `${id}-link` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Or call in JS</p>
                        <div className="relative">
                          <pre className="text-[11px] bg-slate-100 rounded-lg p-2 pr-9 text-slate-700 overflow-x-auto font-mono">
                            {scriptSnippet}
                          </pre>
                          <button
                            type="button"
                            onClick={() => copyCode(`${id}-script`, scriptSnippet)}
                            className="absolute top-2 right-2 p-1 rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                            title="Copy"
                          >
                            {copiedKey === `${id}-script` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600">No data available.</p>
          )}
        </div>
    </>
  )
}
