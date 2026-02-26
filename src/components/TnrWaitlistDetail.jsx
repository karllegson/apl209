'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { X, Loader2, User, Copy, Check, Trash2 } from 'lucide-react'

function DetailRow({ label, value, copyable = true }) {
  const [copied, setCopied] = useState(false)
  const text = value != null && String(value).trim() !== '' ? String(value).trim() : '—'
  const toCopy = value != null && String(value).trim() !== '' ? String(value).trim() : ''
  const handleCopy = () => {
    if (toCopy === '') return
    navigator.clipboard.writeText(toCopy).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <div className="flex items-start justify-between gap-2 py-1.5 border-b border-slate-100 last:border-0">
      {label ? <span className="text-slate-500 text-sm shrink-0">{label}</span> : null}
      <span className="flex items-start gap-2 min-w-0 flex-1 justify-end">
        <span className="min-w-0 flex-1 text-right text-sm text-slate-800 break-words">{text}</span>
        {copyable && toCopy && (
          <button type="button" onClick={handleCopy} className="shrink-0 p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-apl-blue" title="Copy">
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        )}
      </span>
    </div>
  )
}

export default function TnrWaitlistDetail({ entry, onClose, onMoved, alreadyOnTnrPage = false }) {
  const isOnTnrPage = alreadyOnTnrPage || entry?.moved_to_tnr === true
  const [moving, setMoving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [fullscreenPhoto, setFullscreenPhoto] = useState(null)

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const handleMoveToTnr = async () => {
    if (!entry?.id || moving) return
    setMoving(true)
    try {
      const res = await fetch(`/api/tnr-waitlist/${entry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ moved_to_tnr: true }),
      })
      if (res.ok) {
        onMoved?.()
        onClose()
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Failed to move to TNR.')
      }
    } catch (err) {
      console.error(err)
      alert('Failed to move to TNR.')
    } finally {
      setMoving(false)
    }
  }

  const handleMoveBackToDashboard = async () => {
    if (!entry?.id || moving) return
    setMoving(true)
    try {
      const res = await fetch(`/api/tnr-waitlist/${entry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ moved_to_tnr: false }),
      })
      if (res.ok) {
        onMoved?.()
        onClose()
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Failed to move back to dashboard.')
      }
    } catch (err) {
      console.error(err)
      alert('Failed to move back to dashboard.')
    } finally {
      setMoving(false)
    }
  }

  const handleDelete = async () => {
    if (!entry?.id || deleting) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/tnr-waitlist/${entry.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        onMoved?.()
        onClose()
        setShowDeleteConfirm(false)
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Failed to delete entry.')
      }
    } catch (err) {
      console.error(err)
      alert('Failed to delete entry.')
    } finally {
      setDeleting(false)
    }
  }

  if (!entry) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />

      {fullscreenPhoto && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 cursor-pointer"
          onClick={() => setFullscreenPhoto(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Photo full screen"
        >
          <button
            type="button"
            onClick={() => setFullscreenPhoto(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white z-10"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fullscreenPhoto}
            alt=""
            className="max-w-full max-h-[calc(100vh-2rem)] object-contain pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div
        className="relative w-full md:max-w-md bg-white shadow-2xl animate-slide-in-right overflow-y-auto custom-scrollbar"
        role="dialog"
        aria-modal="true"
        aria-label="TNR waitlist entry"
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-slate-800">TNR waitlist entry</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer text-slate-500"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 md:p-6 space-y-5">
          {/* Entry details card — same style as Client details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-apl-blue" />
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Entry details</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <DetailRow label="First name" value={entry.first_name} />
              <DetailRow label="Last name" value={entry.last_name} />
              <DetailRow label="Email" value={entry.email} />
              <DetailRow label="Phone" value={entry.phone} />
              <DetailRow
                label="Submitted"
                value={entry.created_at ? format(new Date(entry.created_at), 'MMM d, yyyy h:mm a') : ''}
                copyable={!!entry.created_at}
              />
              {entry.photo_url && (
                <>
                  <div className="py-1.5 border-b border-slate-100">
                    <p className="text-slate-500 text-sm mb-2">Photo</p>
                    <button
                      type="button"
                      onClick={() => setFullscreenPhoto(entry.photo_url)}
                      className="block w-full rounded-lg overflow-hidden border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-apl-blue/30"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={entry.photo_url} alt="" className="w-full max-h-40 object-contain cursor-pointer" />
                    </button>
                  </div>
                </>
              )}
              {(entry.customer_notes != null && String(entry.customer_notes).trim() !== '') && (
                <div className="py-1.5 border-b border-slate-100 last:border-0">
                  <p className="text-slate-500 text-sm mb-1">Customer notes</p>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap">{entry.customer_notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action card — same style as status/buttons section */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            {isOnTnrPage ? (
              <>
                <button
                  type="button"
                  onClick={handleMoveBackToDashboard}
                  disabled={moving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 border-2 border-slate-300 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {moving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                      Moving…
                    </>
                  ) : (
                    'Move back to dashboard'
                  )}
                </button>
                <p className="text-xs text-slate-500 text-center">
                  This will move this entry back to the main dashboard list.
                </p>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleMoveToTnr}
                  disabled={moving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-apl-primary hover:bg-apl-blue-dark text-white border-2 border-transparent shadow-sm transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {moving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                      Moving…
                    </>
                  ) : (
                    'Move to TNR'
                  )}
                </button>
                <p className="text-xs text-slate-500 text-center">
                  This will move this entry to the TNR page and remove it from the dashboard.
                </p>
              </>
            )}
            <div className="pt-2 border-t border-slate-200">
              {showDeleteConfirm ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-600 flex-1">Remove this entry permanently?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 border border-red-200 cursor-pointer disabled:opacity-60"
                  >
                    {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete entry
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
