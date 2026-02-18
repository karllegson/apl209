'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import StatusBadge from './StatusBadge'
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  PawPrint,
  Heart,
  Shield,
  Stethoscope,
  Sparkles,
  FileText,
  Loader2,
  Trash2,
  Pencil,
  Copy,
  Check,
} from 'lucide-react'

const statusActions = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-600 hover:bg-amber-700' },
  { value: 'confirmed', label: 'Confirm', color: 'bg-apl-primary hover:bg-apl-blue-dark' },
  { value: 'attempted', label: 'Attempted', color: 'bg-orange-600 hover:bg-orange-700' },
  { value: 'cancelled', label: 'Cancel', color: 'bg-stone-500 hover:bg-stone-600' },
]

const boolLabel = (v) =>
  v === true ? 'Yes' : v === false ? 'No' : v || '—'

const isEmpty = (v) => v == null || (typeof v === 'string' && v.trim() === '')

function EmptyHighlight({ value, children, className = '' }) {
  const empty = isEmpty(value)
  return (
    <span
      className={
        empty
          ? `inline-block bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 text-amber-800 text-sm ${className}`
          : className
      }
      title={empty ? 'Missing' : undefined}
    >
      {children}
    </span>
  )
}

function CopyableField({ label, value, emptyHighlight = false, copyable = true }) {
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
        <span className="min-w-0 flex-1 text-right">
          {emptyHighlight ? (
            <EmptyHighlight value={toCopy || null} className="min-w-0 block">
              <span className="text-slate-800 text-sm break-words block">{text}</span>
            </EmptyHighlight>
          ) : (
            <span className="text-slate-800 text-sm break-words block">{text}</span>
          )}
        </span>
        {copyable && (
          <button type="button" onClick={handleCopy} className="shrink-0 p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-apl-blue" title="Copy">
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        )}
      </span>
    </div>
  )
}

function VetNoteWithCopy({ note }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(note).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <div>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Note for vet (from owner)</p>
      <div className="bg-amber-50/80 rounded-xl p-4 border border-amber-100 flex items-start justify-between gap-2">
        <p className="text-sm text-slate-800 whitespace-pre-wrap flex-1 min-w-0">{note}</p>
        <button type="button" onClick={handleCopy} className="shrink-0 p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-apl-blue" title="Copy">
          {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  )
}

export default function AppointmentDetail({
  appointment,
  onClose,
  onUpdate,
  onDelete,
  staffName = null,
}) {
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [savingDetails, setSavingDetails] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [adminNotes, setAdminNotes] = useState(appointment?.admin_notes || '')
  const [owner, setOwner] = useState({
    owner_first_name: '',
    owner_last_name: '',
    owner_phone: '',
    owner_email: '',
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    preferred_contact: 'call',
    how_heard: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    is_returning_customer: false,
  })
  const [pets, setPets] = useState([])
  const [services, setServices] = useState({
    wants_microchip: false,
    wants_nail_trim: false,
    wants_flea_treatment: false,
  })

  useEffect(() => {
    if (!appointment) return
    setAdminNotes(appointment.admin_notes || '')
    const first = appointment.owner_first_name ?? ''
    const last = appointment.owner_last_name ?? ''
    const fromName = (appointment.owner_name || '').trim().split(/\s+/)
    setOwner({
      owner_first_name: first || fromName[0] || '',
      owner_last_name: last || fromName.slice(1).join(' ') || '',
      owner_phone: appointment.owner_phone || '',
      owner_email: appointment.owner_email || '',
      street_address: appointment.street_address || '',
      city: appointment.city || '',
      state: appointment.state || '',
      zip_code: appointment.zip_code || '',
      preferred_contact: appointment.preferred_contact || 'call',
      how_heard: appointment.how_heard || '',
      emergency_contact_name: appointment.emergency_contact_name || '',
      emergency_contact_phone: appointment.emergency_contact_phone || '',
      is_returning_customer: appointment.is_returning_customer || false,
    })
    setPets(Array.isArray(appointment.pets) ? JSON.parse(JSON.stringify(appointment.pets)) : [])
    setServices({
      wants_microchip: appointment.wants_microchip || false,
      wants_nail_trim: appointment.wants_nail_trim || false,
      wants_flea_treatment: appointment.wants_flea_treatment || false,
    })
  }, [appointment])

  if (!appointment) return null

  const handleStatusChange = async (newStatus) => {
    if (newStatus === appointment.status) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          status_changed_by: staffName || '',
        }),
      })
      if (!res.ok) throw new Error('Failed to update')
      const data = await res.json()
      onUpdate?.(data.appointment)
    } catch (err) {
      console.error('Update failed:', err)
    } finally {
      setUpdating(false)
    }
  }

  const handleSaveNotes = async () => {
    setSavingNotes(true)
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: adminNotes }),
      })
      if (!res.ok) throw new Error('Failed to save')
      const data = await res.json()
      onUpdate?.(data.appointment)
    } catch (err) {
      console.error('Save notes failed:', err)
    } finally {
      setSavingNotes(false)
    }
  }

  const handleSaveDetails = async () => {
    setSavingDetails(true)
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...owner,
          owner_name: [owner.owner_first_name, owner.owner_last_name].map((s) => s?.trim()).filter(Boolean).join(' ') || '',
          ...services,
          num_pets: pets.length,
          pets,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      const data = await res.json()
      onUpdate?.(data.appointment)
      setIsEditing(false)
    } catch (err) {
      console.error('Save details failed:', err)
    } finally {
      setSavingDetails(false)
    }
  }

  const updatePet = (index, field, value) => {
    setPets((prev) => {
      const next = [...prev]
      next[index] = { ...(next[index] || {}), [field]: value }
      return next
    })
  }

  const handleCancelEdit = () => {
    if (!appointment) return
    const first = appointment.owner_first_name ?? ''
    const last = appointment.owner_last_name ?? ''
    const fromName = (appointment.owner_name || '').trim().split(/\s+/)
    setOwner({
      owner_first_name: first || fromName[0] || '',
      owner_last_name: last || fromName.slice(1).join(' ') || '',
      owner_phone: appointment.owner_phone || '',
      owner_email: appointment.owner_email || '',
      street_address: appointment.street_address || '',
      city: appointment.city || '',
      state: appointment.state || '',
      zip_code: appointment.zip_code || '',
      preferred_contact: appointment.preferred_contact || 'call',
      how_heard: appointment.how_heard || '',
      emergency_contact_name: appointment.emergency_contact_name || '',
      emergency_contact_phone: appointment.emergency_contact_phone || '',
      is_returning_customer: appointment.is_returning_customer || false,
    })
    setPets(Array.isArray(appointment.pets) ? JSON.parse(JSON.stringify(appointment.pets)) : [])
    setServices({
      wants_microchip: appointment.wants_microchip || false,
      wants_nail_trim: appointment.wants_nail_trim || false,
      wants_flea_treatment: appointment.wants_flea_treatment || false,
    })
    setIsEditing(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')
      onDelete?.(appointment.id)
      onClose()
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full md:w-1/2 max-w-3xl bg-white shadow-2xl animate-slide-in-right overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-slate-800">
            Intake Submission
          </h2>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer text-slate-500 hover:text-apl-blue"
                title="Edit"
              >
                <Pencil className="w-5 h-5" />
              </button>
            ) : null}
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="p-5 md:p-6 space-y-5 text-base">
          {/* Status & Actions — full width */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Current status</p>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <StatusBadge status={appointment.status} />
              {(appointment.status_changed_by || appointment.status_changed_at) && (
                <span className="text-xs text-slate-500">
                  {appointment.status_changed_by && <>Changed by <strong className="text-slate-600">{appointment.status_changed_by}</strong></>}
                  {appointment.status_changed_at && (
                    <> {appointment.status_changed_by ? '·' : ''} {format(new Date(appointment.status_changed_at), 'MMM d, yyyy h:mm a')}</>
                  )}
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              Change status {updating && <Loader2 className="inline-block w-3.5 h-3.5 animate-spin text-slate-400 ml-1 align-middle" aria-hidden />}
            </p>
            <div className="flex flex-wrap gap-2">
              {statusActions.map(({ value, label, color }) => {
                const isCurrent = value === appointment.status
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleStatusChange(value)}
                    disabled={updating}
                    className={`
                      inline-flex items-center justify-center min-w-[6rem] px-4 py-2.5 rounded-lg text-sm font-semibold
                      transition-colors cursor-pointer border-2
                      ${updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      ${isCurrent
                        ? `${color} text-white border-transparent shadow-sm`
                        : `bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50`
                      }
                    `}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Two columns: Client (left) / Patient (right) — like vet booking form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Client / Owner details */}
            <div className="space-y-4">
              {/* Owner Info */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-apl-blue" />
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Client details</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  {!isEditing ? (
                    <div className="space-y-0">
                      <CopyableField label="First Name" value={owner.owner_first_name} emptyHighlight />
                      <CopyableField label="Last Name" value={owner.owner_last_name} emptyHighlight />
                      {owner.is_returning_customer && <div className="py-1.5 text-xs bg-apl-blue/15 text-apl-blue-dark px-2 rounded font-semibold inline-block">Returning</div>}
                      <CopyableField label="Phone" value={owner.owner_phone} emptyHighlight />
                      <CopyableField label="Email" value={owner.owner_email} emptyHighlight />
                      <CopyableField label="Address" value={owner.street_address} emptyHighlight />
                      <CopyableField label="City" value={owner.city} emptyHighlight />
                      <CopyableField label="State" value={owner.state} emptyHighlight />
                      <CopyableField label="Postal" value={owner.zip_code} emptyHighlight />
                      <CopyableField label="Preferred contact" value={owner.preferred_contact} emptyHighlight />
                      <CopyableField label="How heard" value={owner.how_heard} emptyHighlight copyable={false} />
                      <CopyableField label="Emergency contact" value={[owner.emergency_contact_name, owner.emergency_contact_phone].filter(Boolean).join(' · ')} />
                    </div>
                  ) : (
                <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">First name</label>
                  <input
                    value={owner.owner_first_name}
                    onChange={(e) => setOwner((o) => ({ ...o, owner_first_name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Last name</label>
                  <input
                    value={owner.owner_last_name}
                    onChange={(e) => setOwner((o) => ({ ...o, owner_last_name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="returning"
                  checked={owner.is_returning_customer}
                  onChange={(e) => setOwner((o) => ({ ...o, is_returning_customer: e.target.checked }))}
                  className="rounded border-slate-300"
                />
                <label htmlFor="returning" className="text-sm text-slate-600">Returning customer</label>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Phone</label>
                <input
                  value={owner.owner_phone}
                  onChange={(e) => setOwner((o) => ({ ...o, owner_phone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Email</label>
                <input
                  type="email"
                  value={owner.owner_email}
                  onChange={(e) => setOwner((o) => ({ ...o, owner_email: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Street address</label>
                <input
                  value={owner.street_address}
                  onChange={(e) => setOwner((o) => ({ ...o, street_address: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">City</label>
                  <input
                    value={owner.city}
                    onChange={(e) => setOwner((o) => ({ ...o, city: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">State</label>
                  <input
                    value={owner.state}
                    onChange={(e) => setOwner((o) => ({ ...o, state: e.target.value }))}
                    placeholder="CA"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">ZIP code</label>
                  <input
                    value={owner.zip_code}
                    onChange={(e) => setOwner((o) => ({ ...o, zip_code: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Preferred contact</label>
                <select
                  value={owner.preferred_contact}
                  onChange={(e) => setOwner((o) => ({ ...o, preferred_contact: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue cursor-pointer"
                >
                  <option value="call">Call</option>
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">How heard about us</label>
                <input
                  value={owner.how_heard}
                  onChange={(e) => setOwner((o) => ({ ...o, how_heard: e.target.value }))}
                  placeholder="Optional"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Emergency contact name</label>
                  <input
                    value={owner.emergency_contact_name}
                    onChange={(e) => setOwner((o) => ({ ...o, emergency_contact_name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Emergency contact phone</label>
                  <input
                    value={owner.emergency_contact_phone}
                    onChange={(e) => setOwner((o) => ({ ...o, emergency_contact_phone: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue"
                  />
                </div>
              </div>
                </>
              )}
            </div>
          </div>

              {/* Vet note — left column */}
              {(appointment.vet_note && appointment.vet_note.trim()) ? (
                <VetNoteWithCopy note={appointment.vet_note.trim()} />
              ) : null}

              {/* Requested service — left column */}
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Requested service</p>
                <div className="bg-slate-50 rounded-xl p-4">
                  <CopyableField label="Service" value={appointment.requested_service} emptyHighlight />
                </div>
              </div>

              {/* Deposit & card — left column */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-apl-blue" />
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Deposit & card</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 space-y-0">
                  <CopyableField label="Deposit acknowledged" value={appointment.deposit_acknowledged ? 'Yes' : 'No'} copyable={false} />
                  <CopyableField label="Card last 4" value={appointment.deposit_card_last4} copyable={false} />
                  <CopyableField label="Expiry" value={appointment.deposit_card_expiry} copyable={false} />
                  <CopyableField label="Billing ZIP" value={appointment.deposit_billing_zip} copyable={false} />
                </div>
              </div>
            </div>

            {/* Right: Patient details */}
            <div className="space-y-6">
          {/* Pets */}
          {pets.map((pet, i) => (
            <div
              key={i}
              className={`rounded-xl border border-slate-200 overflow-hidden ${i % 2 === 0 ? 'bg-slate-50' : 'bg-slate-100/70'}`}
            >
              <div className="flex items-center gap-2 px-4 pt-4 pb-2 border-b border-slate-200/80 bg-white/50">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-apl-blue/10">
                  <PawPrint className="w-4 h-4 text-apl-blue" />
                </div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {pet.pet_name || `Pet ${i + 1}`} — {pet.type === 'cat' ? 'Cat' : 'Dog'}
                </p>
                {pets.length > 1 && (
                  <span className="ml-auto text-xs text-slate-400 font-medium">#{i + 1}</span>
                )}
              </div>
              <div className="p-4 space-y-3 text-sm">
                {!isEditing ? (
                  <>
                <div className="space-y-0">
                  <CopyableField label="Name" value={pet.pet_name} emptyHighlight />
                  <CopyableField label="Species" value={pet.type === 'cat' ? 'Cat' : pet.type ? 'Dog' : pet.type || ''} emptyHighlight />
                  <CopyableField label="Breed" value={pet.breed} emptyHighlight />
                  <CopyableField label="Color" value={pet.color} emptyHighlight />
                  <CopyableField label="Sex" value={pet.sex} emptyHighlight />
                  <CopyableField label="Age" value={pet.age} emptyHighlight />
                  <CopyableField label="Temperament" value={pet.vet_behavior} emptyHighlight />
                  <CopyableField label="Weight" value={pet.weight} emptyHighlight />
                  <CopyableField label="How long owned" value={pet.how_long_owned} emptyHighlight />
                </div>
                {pet.sex === 'male' && (
                  <div className="text-sm bg-apl-blue/10 rounded-lg p-3 border border-apl-blue/20">
                    <CopyableField label="Testicles descended" value={pet.testicles_descended} emptyHighlight />
                  </div>
                )}
                {pet.sex === 'female' && (
                  <div className="text-sm bg-pink-50 rounded-lg p-3 border border-pink-100 space-y-0">
                    <CopyableField label="In heat" value={pet.in_heat_or_pregnant} emptyHighlight />
                    <CopyableField label="Pregnant" value={pet.pregnant} emptyHighlight />
                    <CopyableField label="Last heat date" value={pet.last_heat_date || pet.last_heat_pregnancy_date} emptyHighlight />
                    <CopyableField label="Pregnancy date" value={pet.pregnancy_date} emptyHighlight />
                  </div>
                )}
                <div className="border-t border-slate-200 pt-2 mt-2">
                  <div className="flex items-center gap-1.5 mb-2"><Heart className="w-4 h-4 text-apl-blue" /><span className="text-sm font-semibold text-slate-500">Medical</span></div>
                  <div className="space-y-0">
                    <CopyableField label="Sick/injured" value={boolLabel(pet.currently_sick_injured)} emptyHighlight />
                    <CopyableField label="Conditions" value={pet.medical_conditions?.length ? `${pet.medical_conditions.join(', ')}${pet.medical_conditions_other ? ` (${pet.medical_conditions_other})` : ''}` : ''} emptyHighlight />
                    <CopyableField label="Previous surgeries" value={pet.previous_surgeries === true && pet.previous_surgeries_details ? `Yes — ${pet.previous_surgeries_details}` : boolLabel(pet.previous_surgeries)} emptyHighlight />
                    <CopyableField label="Drug/vaccine reactions" value={pet.drug_vaccine_reactions === true && pet.drug_vaccine_reactions_details ? `Yes — ${pet.drug_vaccine_reactions_details}` : boolLabel(pet.drug_vaccine_reactions)} emptyHighlight />
                    <CopyableField label="Current medications" value={pet.current_medications === true && pet.current_medications_details ? `Yes — ${pet.current_medications_details}` : boolLabel(pet.current_medications)} emptyHighlight />
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-2">
                  <div className="flex items-center gap-1.5 mb-2"><Shield className="w-4 h-4 text-apl-blue" /><span className="text-sm font-semibold text-slate-500">Vaccination</span></div>
                  <div className="space-y-0">
                    <CopyableField label="Rabies vaccinated" value={pet.rabies_vaccinated} emptyHighlight />
                    <CopyableField label="Rabies (1–3 yrs)" value={pet.rabies_within_1_3_years} emptyHighlight />
                    <CopyableField label="Disease exposure (30d)" value={boolLabel(pet.exposed_to_diseases)} emptyHighlight />
                    <CopyableField label="Fleas/ticks" value={boolLabel(pet.has_fleas_ticks)} emptyHighlight />
                  </div>
                </div>
                  </>
                ) : (
                  <>
                {/* Basic */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Pet name</label>
                    <input
                      value={pet.pet_name || ''}
                      onChange={(e) => updatePet(i, 'pet_name', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Breed</label>
                    <input
                      value={pet.breed || ''}
                      onChange={(e) => updatePet(i, 'breed', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Color</label>
                    <input
                      value={pet.color || ''}
                      onChange={(e) => updatePet(i, 'color', e.target.value)}
                      placeholder="e.g. Black, Orange tabby"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Age</label>
                    <input
                      value={pet.age || ''}
                      onChange={(e) => updatePet(i, 'age', e.target.value)}
                      placeholder="e.g. 2 years"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Temperament</label>
                    <input
                      value={pet.vet_behavior || ''}
                      onChange={(e) => updatePet(i, 'vet_behavior', e.target.value)}
                      placeholder="e.g. calm, nervous, aggressive"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Weight</label>
                    <input
                      value={pet.weight || ''}
                      onChange={(e) => updatePet(i, 'weight', e.target.value)}
                      placeholder="e.g. 25 lbs"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Sex</label>
                    <select
                      value={pet.sex || ''}
                      onChange={(e) => updatePet(i, 'sex', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue cursor-pointer"
                    >
                      <option value="">—</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">How long have you had this pet?</label>
                    <input
                      value={pet.how_long_owned || ''}
                      onChange={(e) => updatePet(i, 'how_long_owned', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue"
                    />
                  </div>
                </div>

                {/* Sex-specific */}
                {pet.sex === 'male' && (
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Testicles descended</label>
                    <select
                      value={pet.testicles_descended || ''}
                      onChange={(e) => updatePet(i, 'testicles_descended', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-apl-blue/20 bg-apl-blue/5 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue cursor-pointer"
                    >
                      <option value="">—</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>
                )}
                {pet.sex === 'female' && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">In heat</label>
                      <select
                        value={pet.in_heat_or_pregnant || ''}
                        onChange={(e) => updatePet(i, 'in_heat_or_pregnant', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-pink-200 bg-pink-50/50 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue cursor-pointer"
                      >
                        <option value="">—</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="unsure">Unsure</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Pregnant</label>
                      <select
                        value={pet.pregnant || ''}
                        onChange={(e) => updatePet(i, 'pregnant', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-pink-200 bg-pink-50/50 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue cursor-pointer"
                      >
                        <option value="">—</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="unsure">Unsure</option>
                      </select>
                    </div>
                    {(pet.in_heat_or_pregnant === 'yes' || pet.in_heat_or_pregnant === 'unsure' || pet.pregnant === 'yes' || pet.pregnant === 'unsure') && (
                      <>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Last heat date</label>
                          <input
                            type="date"
                            value={pet.last_heat_date ?? pet.last_heat_pregnancy_date ?? ''}
                            onChange={(e) => updatePet(i, 'last_heat_date', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Pregnancy date</label>
                          <input
                            type="date"
                            value={pet.pregnancy_date ?? ''}
                            onChange={(e) => updatePet(i, 'pregnancy_date', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Medical */}
                <div className="border-t border-slate-200 pt-2 space-y-2">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Heart className="w-4 h-4 text-apl-blue" />
                    <span className="text-sm font-semibold text-slate-500">Medical</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Sick/injured</label>
                      <select
                        value={pet.currently_sick_injured === true ? 'yes' : pet.currently_sick_injured === false ? 'no' : ''}
                        onChange={(e) => updatePet(i, 'currently_sick_injured', e.target.value === 'yes' ? true : e.target.value === 'no' ? false : null)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue cursor-pointer"
                      >
                        <option value="">—</option>
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Previous surgeries</label>
                      <select
                        value={pet.previous_surgeries === true ? 'yes' : pet.previous_surgeries === false ? 'no' : ''}
                        onChange={(e) => updatePet(i, 'previous_surgeries', e.target.value === 'yes' ? true : e.target.value === 'no' ? false : null)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue cursor-pointer"
                      >
                        <option value="">—</option>
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                      {pet.previous_surgeries === true && (
                        <input
                          type="text"
                          value={pet.previous_surgeries_details ?? ''}
                          onChange={(e) => updatePet(i, 'previous_surgeries_details', e.target.value)}
                          placeholder="Details..."
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue"
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Medical conditions (comma-separated)</label>
                    <input
                      value={Array.isArray(pet.medical_conditions) ? pet.medical_conditions.join(', ') : ''}
                      onChange={(e) => {
                        const val = e.target.value
                        updatePet(i, 'medical_conditions', val ? val.split(',').map((s) => s.trim()).filter(Boolean) : [])
                      }}
                      placeholder="e.g. heart murmur, diabetes"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Drug/vaccine reactions</label>
                      <select
                        value={pet.drug_vaccine_reactions === true ? 'yes' : pet.drug_vaccine_reactions === false ? 'no' : ''}
                        onChange={(e) => updatePet(i, 'drug_vaccine_reactions', e.target.value === 'yes' ? true : e.target.value === 'no' ? false : null)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue cursor-pointer"
                      >
                        <option value="">—</option>
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                      {pet.drug_vaccine_reactions === true && (
                        <input
                          type="text"
                          value={pet.drug_vaccine_reactions_details ?? ''}
                          onChange={(e) => updatePet(i, 'drug_vaccine_reactions_details', e.target.value)}
                          placeholder="Details..."
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Current medications</label>
                      <select
                        value={pet.current_medications === true ? 'yes' : pet.current_medications === false ? 'no' : ''}
                        onChange={(e) => updatePet(i, 'current_medications', e.target.value === 'yes' ? true : e.target.value === 'no' ? false : null)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue cursor-pointer"
                      >
                        <option value="">—</option>
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                      {pet.current_medications === true && (
                        <input
                          type="text"
                          value={pet.current_medications_details ?? ''}
                          onChange={(e) => updatePet(i, 'current_medications_details', e.target.value)}
                          placeholder="Details..."
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Vaccination */}
                <div className="border-t border-slate-200 pt-2 space-y-2">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Shield className="w-4 h-4 text-apl-blue" />
                    <span className="text-sm font-semibold text-slate-500">Vaccination</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Rabies vaccinated</label>
                      <select
                        value={pet.rabies_vaccinated || ''}
                        onChange={(e) => updatePet(i, 'rabies_vaccinated', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue cursor-pointer"
                      >
                        <option value="">—</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Rabies within 1–3 yrs</label>
                      <select
                        value={pet.rabies_within_1_3_years || ''}
                        onChange={(e) => updatePet(i, 'rabies_within_1_3_years', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue cursor-pointer"
                      >
                        <option value="">—</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Exposed to diseases (30d)</label>
                      <select
                        value={pet.exposed_to_diseases === true ? 'yes' : pet.exposed_to_diseases === false ? 'no' : ''}
                        onChange={(e) => updatePet(i, 'exposed_to_diseases', e.target.value === 'yes' ? true : e.target.value === 'no' ? false : null)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue cursor-pointer"
                      >
                        <option value="">—</option>
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Fleas/ticks</label>
                      <select
                        value={pet.has_fleas_ticks === true ? 'yes' : pet.has_fleas_ticks === false ? 'no' : ''}
                        onChange={(e) => updatePet(i, 'has_fleas_ticks', e.target.value === 'yes' ? true : e.target.value === 'no' ? false : null)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue cursor-pointer"
                      >
                        <option value="">—</option>
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    </div>
                  </div>
                </div>
                  </>
                )}
              </div>
            </div>
          ))}

            </div>
          </div>

          {/* Optional Services */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-apl-blue" />
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Add-ons & wellness</p>
            </div>
            {!isEditing ? (
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {services.wants_microchip && <span className="text-sm bg-apl-blue/10 text-apl-blue-dark px-3 py-1.5 rounded-lg font-medium">Microchip</span>}
                  {services.wants_nail_trim && <span className="text-sm bg-apl-blue/10 text-apl-blue-dark px-3 py-1.5 rounded-lg font-medium">Nail Trim</span>}
                  {services.wants_flea_treatment && <span className="text-sm bg-apl-blue/10 text-apl-blue-dark px-3 py-1.5 rounded-lg font-medium">Flea Treatment</span>}
                  {!(services.wants_microchip || services.wants_nail_trim || services.wants_flea_treatment) && (
                    <span className="text-sm text-slate-400">None</span>
                  )}
                </div>
                {Array.isArray(appointment.optional_vaccines) && appointment.optional_vaccines.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Optional vaccines</p>
                    <p className="text-sm text-slate-700">{appointment.optional_vaccines.join(', ')}</p>
                  </div>
                )}
                {Array.isArray(appointment.optional_wellness_services) && appointment.optional_wellness_services.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Optional wellness</p>
                    <p className="text-sm text-slate-700">{appointment.optional_wellness_services.join(', ')}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={services.wants_microchip}
                    onChange={(e) => setServices((s) => ({ ...s, wants_microchip: e.target.checked }))}
                    className="rounded border-slate-300"
                  />
                  <span className="text-base text-slate-700">Microchip</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={services.wants_nail_trim}
                    onChange={(e) => setServices((s) => ({ ...s, wants_nail_trim: e.target.checked }))}
                    className="rounded border-slate-300"
                  />
                  <span className="text-base text-slate-700">Nail Trim</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={services.wants_flea_treatment}
                    onChange={(e) => setServices((s) => ({ ...s, wants_flea_treatment: e.target.checked }))}
                    className="rounded border-slate-300"
                  />
                  <span className="text-base text-slate-700">Flea Treatment</span>
                </label>
              </div>
            )}
          </div>

          {/* Save / Cancel - only when editing */}
          {isEditing && (
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelEdit}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDetails}
                disabled={savingDetails}
                className="px-6 py-2.5 bg-apl-primary hover:bg-apl-blue-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {savingDetails ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {savingDetails ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* Legal */}
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Legal</p>
            <div className="bg-slate-50 rounded-xl p-4 space-y-0">
              <CopyableField label="Legal acknowledged" value={appointment.legal_acknowledged ? 'Yes' : 'No'} copyable={false} />
              <CopyableField label="Signature" value={appointment.signature} emptyHighlight copyable={false} />
            </div>
          </div>

          {/* Admin Notes */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-apl-blue" />
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Admin notes</p>
            </div>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add internal notes..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue transition-all resize-none"
            />
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              {savingNotes ? 'Saving...' : 'Save Notes'}
            </button>
          </div>

          {/* Timestamps */}
          <div className="text-xs text-slate-400 space-y-1 pt-4 border-t border-slate-100">
            <p>Submitted: {format(new Date(appointment.created_at), 'MMM d, yyyy h:mm a')}</p>
            {appointment.updated_at !== appointment.created_at && (
              <p>Updated: {format(new Date(appointment.updated_at), 'MMM d, yyyy h:mm a')}</p>
            )}
            <p className="font-mono text-xs text-slate-300 break-all">ID: {appointment.id}</p>
          </div>

          {/* Delete */}
          <div className="pt-2 border-t border-slate-100">
            {showDeleteConfirm ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-base text-red-700 mb-3">
                  Delete this submission? This cannot be undone.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-base font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-base font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 text-base text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete submission
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
