'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import StatusBadge from '@/components/StatusBadge'
import AppointmentDetail from '@/components/AppointmentDetail'
import {
  RefreshCw,
  Plus,
  X,
  Loader2,
  Link2,
  Trash2,
  FileText,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'

const statusActions = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-600 hover:bg-amber-700' },
  { value: 'confirmed', label: 'Confirm', color: 'bg-apl-primary hover:bg-apl-blue-dark' },
  { value: 'attempted', label: 'Attempted', color: 'bg-orange-600 hover:bg-orange-700' },
  { value: 'cancelled', label: 'Cancel', color: 'bg-stone-500 hover:bg-stone-600' },
]

function formatDate(val) {
  if (!val) return '—'
  try {
    const d = typeof val === 'string' ? parseISO(val) : val
    return format(d, 'MMM d, yyyy')
  } catch {
    return String(val)
  }
}

function toDateInputValue(val) {
  if (!val) return ''
  const s = String(val).trim().slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ''
}

export default function AttemptedPage() {
  const router = useRouter()
  const [authChecking, setAuthChecking] = useState(true)
  const [attempted, setAttempted] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [mergeFor, setMergeFor] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(null)
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [viewFormAppointment, setViewFormAppointment] = useState(null)
  const [viewFormLoadingId, setViewFormLoadingId] = useState(null)
  const [staffName, setStaffName] = useState(null)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    standby_date: '',
    appointment_type: '',
    scheduled_date: '',
  })
  const [submitting, setSubmitting] = useState(false)

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
        if (!data.staffName) router.replace('/admin/who')
        else setStaffName(data.staffName)
      })
      .catch(() => router.replace('/admin'))
      .finally(() => setAuthChecking(false))
  }, [router])

  const fetchAttempted = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/attempted-appointments?includeMatches=1&status=attempted', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        const list = data.attempted || []
        const sorted = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        setAttempted(sorted)
      }
    } catch (err) {
      console.error('Failed to fetch attempted:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authChecking) fetchAttempted()
  }, [authChecking, fetchAttempted])

  const handleStatus = async (id, newStatus) => {
    setUpdatingId(id)
    setUpdatingStatus(newStatus)
    try {
      const res = await fetch(`/api/attempted-appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        const { attempted: updated } = await res.json()
        if (updated.status === 'attempted') {
          setAttempted((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)))
        } else {
          setAttempted((prev) => prev.filter((s) => s.id !== id))
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err)
    } finally {
      setUpdatingId(null)
      setUpdatingStatus(null)
    }
  }

  const startEdit = (s, field) => {
    const isDate = field === 'standby_date' || field === 'scheduled_date'
    setEditingCell({ id: s.id, field })
    setEditValue(
      isDate ? toDateInputValue(s[field]) : (s[field] || '')
    )
  }

  const handleInlineSave = async () => {
    if (!editingCell) return
    const { id, field } = editingCell
    const isDate = field === 'standby_date' || field === 'scheduled_date'
    const payload = {}
    if (isDate) {
      payload[field] = /^\d{4}-\d{2}-\d{2}$/.test(editValue.trim()) ? editValue.trim() : null
    } else {
      payload[field] = editValue.trim()
    }
    setEditingCell(null)
    setEditValue('')
    try {
      const res = await fetch(`/api/attempted-appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const { attempted: updated } = await res.json()
        setAttempted((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)))
      }
    } catch (err) {
      console.error('Failed to update attempted:', err)
    }
  }

  const handleViewForm = async (appointmentId) => {
    if (!appointmentId) return
    setViewFormLoadingId(appointmentId)
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, { credentials: 'include' })
      if (res.ok) {
        const { appointment } = await res.json()
        setViewFormAppointment(appointment)
      }
    } catch (err) {
      console.error('Failed to load form:', err)
    } finally {
      setViewFormLoadingId(null)
    }
  }

  const handleDelete = async (attemptedId) => {
    if (!confirm('Remove this attempted entry?')) return
    setDeletingId(attemptedId)
    try {
      const res = await fetch(`/api/attempted-appointments/${attemptedId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        setAttempted((prev) => prev.filter((s) => s.id !== attemptedId))
      }
    } catch (err) {
      console.error('Failed to delete:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const handleMerge = async (attemptedId, appointmentId) => {
    setUpdatingId(attemptedId)
    try {
      const res = await fetch(`/api/attempted-appointments/${attemptedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ merged_appointment_id: appointmentId }),
      })
      if (res.ok) {
        const { attempted: updated } = await res.json()
        setAttempted((prev) => prev.map((s) => (s.id === attemptedId ? { ...s, ...updated } : s)))
        setMergeFor(null)
      }
    } catch (err) {
      console.error('Failed to merge:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/attempted-appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone: form.phone.trim(),
          standby_date: form.standby_date || null,
          appointment_type: form.appointment_type.trim(),
          scheduled_date: form.scheduled_date || null,
        }),
      })
      if (res.ok) {
        setForm({ first_name: '', last_name: '', phone: '', standby_date: '', appointment_type: '', scheduled_date: '' })
        setShowAdd(false)
        fetchAttempted()
      }
    } catch (err) {
      console.error('Failed to add attempted:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (authChecking) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-apl-blue rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        <div className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-xl font-bold text-slate-800">Attempted</h1>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAdd(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-apl-primary text-white text-sm font-medium hover:bg-apl-blue-dark"
              >
                <Plus className="w-4 h-4" />
                Add attempted
              </button>
              <button
                type="button"
                onClick={fetchAttempted}
                disabled={loading}
                className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-slate-400">
                <div className="animate-pulse space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 bg-slate-100 rounded-lg" />
                  ))}
                </div>
              </div>
            ) : !attempted.length ? (
              <div className="p-12 text-center text-slate-400 text-sm">No attempted.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-[10%]" />
                    <col className="w-[10%]" />
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                    <col className="w-[14%]" />
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                    <col className="w-[18%]" />
                  </colgroup>
                  <thead>
                    <tr className="border-b-2 border-slate-200 bg-slate-100">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                        First Name
                      </th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                        Last Name
                      </th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                        Phone #
                      </th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                        Attempted date
                      </th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                        Appointment Type
                      </th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                        Scheduled Date
                      </th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                        Status
                      </th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attempted.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2 text-sm text-slate-800 align-middle w-0">
                          <div className="h-8 flex items-center">
                            {editingCell?.id === s.id && editingCell?.field === 'first_name' ? (
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={handleInlineSave}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleInlineSave()
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingCell(null)
                                    setEditValue('')
                                  }
                                }}
                                autoFocus
                                className="h-8 w-full min-w-0 box-border px-2 text-sm border border-slate-300 rounded leading-none"
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEdit(s, 'first_name')}
                                className="h-8 w-full text-left px-0 rounded hover:bg-slate-100 truncate"
                              >
                                {s.first_name || '—'}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm text-slate-800 align-middle w-0">
                          <div className="h-8 flex items-center">
                            {editingCell?.id === s.id && editingCell?.field === 'last_name' ? (
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={handleInlineSave}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleInlineSave()
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingCell(null)
                                    setEditValue('')
                                  }
                                }}
                                autoFocus
                                className="h-8 w-full min-w-0 box-border px-2 text-sm border border-slate-300 rounded leading-none"
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEdit(s, 'last_name')}
                                className="h-8 w-full text-left px-0 rounded hover:bg-slate-100 truncate"
                              >
                                {s.last_name || '—'}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm text-slate-800 align-middle w-0">
                          <div className="h-8 flex items-center">
                            {editingCell?.id === s.id && editingCell?.field === 'phone' ? (
                              <input
                                type="tel"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={handleInlineSave}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleInlineSave()
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingCell(null)
                                    setEditValue('')
                                  }
                                }}
                                autoFocus
                                className="h-8 w-full min-w-0 box-border px-2 text-sm border border-slate-300 rounded leading-none"
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEdit(s, 'phone')}
                                className="h-8 w-full text-left px-0 rounded hover:bg-slate-100 truncate"
                              >
                                {s.phone || '—'}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm text-slate-600 align-middle w-0">
                          <div className="h-8 flex items-center">
                            {editingCell?.id === s.id && editingCell?.field === 'standby_date' ? (
                              <input
                                type="date"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={handleInlineSave}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleInlineSave()
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingCell(null)
                                    setEditValue('')
                                  }
                                }}
                                autoFocus
                                className="h-8 w-full min-w-0 box-border px-2 text-sm border border-slate-300 rounded leading-none [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEdit(s, 'standby_date')}
                                className="h-8 w-full text-left px-0 rounded hover:bg-slate-100 truncate"
                              >
                                {formatDate(s.standby_date)}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm text-slate-600 align-middle w-0">
                          <div className="h-8 flex items-center">
                            {editingCell?.id === s.id && editingCell?.field === 'appointment_type' ? (
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={handleInlineSave}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleInlineSave()
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingCell(null)
                                    setEditValue('')
                                  }
                                }}
                                autoFocus
                                className="h-8 w-full min-w-0 box-border px-2 text-sm border border-slate-300 rounded leading-none"
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEdit(s, 'appointment_type')}
                                className="h-8 w-full text-left px-0 rounded hover:bg-slate-100 truncate"
                              >
                                {s.appointment_type || '—'}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm text-slate-600 align-middle w-0">
                          <div className="h-8 flex items-center">
                            {editingCell?.id === s.id && editingCell?.field === 'scheduled_date' ? (
                              <input
                                type="date"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={handleInlineSave}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleInlineSave()
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingCell(null)
                                    setEditValue('')
                                  }
                                }}
                                autoFocus
                                className="h-8 w-full min-w-0 box-border px-2 text-sm border border-slate-300 rounded leading-none [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEdit(s, 'scheduled_date')}
                                className="h-8 w-full text-left px-0 rounded hover:bg-slate-100 truncate"
                              >
                                {formatDate(s.scheduled_date)}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={s.status} />
                          {s.merged_appointment_id && (
                            <span className="ml-1 inline-flex items-center gap-0.5 text-xs text-teal-600">
                              <Link2 className="w-3 h-3" /> Merged
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-1">
                              {statusActions
                                .filter(({ value }) => value !== s.status)
                                .map(({ value, label, color }) => {
                                  const isUpdating = updatingId === s.id && updatingStatus === value
                                  return (
                                    <button
                                      key={value}
                                      type="button"
                                      onClick={() => handleStatus(s.id, value)}
                                      disabled={updatingId === s.id}
                                      className={`px-2 py-1 rounded text-xs font-medium text-white ${color} disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1`}
                                    >
                                      {isUpdating ? (
                                        <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                                      ) : (
                                        label
                                      )}
                                    </button>
                                  )
                                })}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-1.5">
                              {(s.source_appointment_id || s.merged_appointment_id) && (
                                <button
                                  type="button"
                                  onClick={() => handleViewForm(s.source_appointment_id || s.merged_appointment_id)}
                                  disabled={viewFormLoadingId != null}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-apl-blue hover:bg-apl-blue/10 disabled:opacity-50"
                                  title="View intake form"
                                >
                                  {viewFormLoadingId === (s.source_appointment_id || s.merged_appointment_id) ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <FileText className="w-3.5 h-3.5" />
                                  )}
                                  View form
                                </button>
                              )}
                              {mergeFor?.id === s.id ? (
                                <div className="flex items-center gap-1 flex-wrap">
                                  {(s.suggestedAppointments || []).length > 0 ? (
                                    (s.suggestedAppointments || []).map((apt) => (
                                      <button
                                        key={apt.id}
                                        type="button"
                                        onClick={() => handleMerge(s.id, apt.id)}
                                        disabled={updatingId === s.id}
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-teal-600 text-white hover:bg-teal-700"
                                      >
                                        Merge with {apt.owner_first_name || apt.owner_name || 'Appt'}
                                      </button>
                                    ))
                                  ) : (
                                    <span className="text-xs text-slate-500">No matches by phone.</span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setMergeFor(null)}
                                    className="p-1 text-slate-400 hover:text-slate-600"
                                    aria-label="Cancel merge"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setMergeFor(s)}
                                  title="Merge with intake form"
                                  className="p-1.5 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                  aria-label="Merge"
                                >
                                  <Link2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDelete(s.id)}
                                disabled={deletingId === s.id}
                                title="Delete"
                                className="p-1.5 rounded text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                aria-label="Delete"
                              >
                                {deletingId === s.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {viewFormAppointment && (
        <AppointmentDetail
          appointment={viewFormAppointment}
          onClose={() => setViewFormAppointment(null)}
          onUpdate={(updated) => {
            setViewFormAppointment(updated)
            if (updated.status === 'pending') {
              setAttempted((prev) => prev.filter((s) => s.source_appointment_id !== updated.id))
              setViewFormAppointment(null)
            }
          }}
          onDelete={() => setViewFormAppointment(null)}
          staffName={staffName}
        />
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">Add attempted</h2>
              <button type="button" onClick={() => setShowAdd(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone #</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Attempted date</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={form.standby_date}
                    onChange={(e) => setForm((f) => ({ ...f, standby_date: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        standby_date: format(new Date(), 'yyyy-MM-dd'),
                      }))
                    }
                    className="px-3 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-50 shrink-0"
                  >
                    Today
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Appointment Type</label>
                <input
                  type="text"
                  value={form.appointment_type}
                  onChange={(e) => setForm((f) => ({ ...f, appointment_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="e.g. Spay/Neuter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Scheduled Date</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={form.scheduled_date}
                    onChange={(e) => setForm((f) => ({ ...f, scheduled_date: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        scheduled_date: format(new Date(), 'yyyy-MM-dd'),
                      }))
                    }
                    className="px-3 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-50 shrink-0"
                  >
                    Today
                  </button>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-lg bg-apl-primary text-white text-sm font-medium hover:bg-apl-blue-dark disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
