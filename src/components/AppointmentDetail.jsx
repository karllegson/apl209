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
  PawPrint,
  Heart,
  Shield,
  Stethoscope,
  Sparkles,
  FileText,
  AlertTriangle,
  Loader2,
  Trash2,
  Pencil,
} from 'lucide-react'

const statusActions = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-600 hover:bg-amber-700' },
  { value: 'confirmed', label: 'Confirm', color: 'bg-apl-primary hover:bg-apl-blue-dark' },
  { value: 'completed', label: 'Complete', color: 'bg-teal-600 hover:bg-teal-700' },
  { value: 'cancelled', label: 'Cancel', color: 'bg-stone-500 hover:bg-stone-600' },
  { value: 'no-show', label: 'No Show', color: 'bg-stone-500 hover:bg-stone-600' },
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

export default function AppointmentDetail({
  appointment,
  onClose,
  onUpdate,
  onDelete,
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
        body: JSON.stringify({ status: newStatus }),
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

        <div className="p-6 space-y-6 text-base">
          {/* Status & Actions */}
          <div>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
              Status
            </p>
            <StatusBadge status={appointment.status} />
            <div className="flex flex-wrap gap-2 mt-3">
              {statusActions.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => handleStatusChange(value)}
                  disabled={updating || value === appointment.status}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${color}`}
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : label}
                </button>
              ))}
            </div>
          </div>

          {/* Owner Info */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-apl-blue" />
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                  Owner Information
                </p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-5 space-y-4">
              {!isEditing ? (
                <>
                  <div className="flex items-center gap-2 text-base">
                    <User className="w-4 h-4 text-slate-400" />
                    <EmptyHighlight value={[owner.owner_first_name, owner.owner_last_name].filter(Boolean).join(' ')}>
                      <span className="text-slate-700 font-medium">
                        {[owner.owner_first_name, owner.owner_last_name].filter(Boolean).join(' ') || '—'}
                      </span>
                    </EmptyHighlight>
                    {owner.is_returning_customer && (
                      <span className="text-xs bg-apl-blue/15 text-apl-blue-dark px-2 py-1 rounded font-semibold">Returning</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-base">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <EmptyHighlight value={owner.owner_phone}>
                      <a href={`tel:${owner.owner_phone}`} className="text-apl-blue hover:underline">{owner.owner_phone || '—'}</a>
                    </EmptyHighlight>
                  </div>
                  <div className="flex items-center gap-2 text-base">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <EmptyHighlight value={owner.owner_email}>
                      <a href={`mailto:${owner.owner_email}`} className="text-apl-blue hover:underline">{owner.owner_email || '—'}</a>
                    </EmptyHighlight>
                  </div>
                  <div className="flex items-center gap-2 text-base">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <EmptyHighlight value={[owner.street_address, owner.city, owner.state, owner.zip_code].filter(Boolean).join('')}>
                      <span className="text-slate-600">
                        {[owner.street_address, [owner.city, owner.state].filter(Boolean).join(', '), owner.zip_code].filter(Boolean).join(' ') || '—'}
                      </span>
                    </EmptyHighlight>
                  </div>
                  <p className="text-sm text-slate-400">
                    Preferred: <EmptyHighlight value={owner.preferred_contact}>{owner.preferred_contact || '—'}</EmptyHighlight>
                    {' · '}
                    Heard via: <EmptyHighlight value={owner.how_heard}>{owner.how_heard || '—'}</EmptyHighlight>
                  </p>
                </>
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
                </>
              )}
            </div>
          </div>

          {/* Pets */}
          {pets.map((pet, i) => (
            <div key={i}>
              <div className="flex items-center gap-2 mb-3">
                <PawPrint className="w-5 h-5 text-apl-blue" />
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                  {pet.pet_name || `Pet ${i + 1}`} — {pet.type === 'cat' ? '🐈 Cat' : '🐕 Dog'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-5 space-y-4 text-base">
                {!isEditing ? (
                  <>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="col-span-2"><span className="text-slate-400">Name:</span> <EmptyHighlight value={pet.pet_name}><span className="text-slate-700">{pet.pet_name || '—'}</span></EmptyHighlight></div>
                  <div><span className="text-slate-400">Breed:</span> <EmptyHighlight value={pet.breed}><span className="text-slate-700">{pet.breed || '—'}</span></EmptyHighlight></div>
                  <div><span className="text-slate-400">Age:</span> <EmptyHighlight value={pet.age}><span className="text-slate-700">{pet.age || '—'}</span></EmptyHighlight></div>
                  <div><span className="text-slate-400">Weight:</span> <EmptyHighlight value={pet.weight}><span className="text-slate-700">{pet.weight || '—'}</span></EmptyHighlight></div>
                  <div><span className="text-slate-400">Sex:</span> <EmptyHighlight value={pet.sex}><span className="text-slate-700 capitalize">{pet.sex || '—'}</span></EmptyHighlight></div>
                  <div className="col-span-2"><span className="text-slate-400">Owned:</span> <EmptyHighlight value={pet.how_long_owned}><span className="text-slate-700">{pet.how_long_owned || '—'}</span></EmptyHighlight></div>
                </div>
                {pet.sex === 'male' && (
                  <div className="text-sm bg-apl-blue/10 rounded-lg p-3 border border-apl-blue/20">
                    <span className="text-apl-blue-dark font-medium">Testicles descended:</span>{' '}
                    <EmptyHighlight value={pet.testicles_descended}>
                      <span className="text-apl-blue-dark capitalize">{pet.testicles_descended || '—'}</span>
                    </EmptyHighlight>
                  </div>
                )}
                {pet.sex === 'female' && (
                  <div className="text-sm bg-pink-50 rounded-lg p-3 border border-pink-100">
                    <span className="text-pink-600 font-medium">In heat/pregnant:</span>{' '}
                    <EmptyHighlight value={pet.in_heat_or_pregnant}>
                      <span className="text-pink-800 capitalize">{pet.in_heat_or_pregnant || '—'}</span>
                    </EmptyHighlight>
                    {pet.last_heat_pregnancy_date ? (
                      <span className="text-pink-600"> · Date: {pet.last_heat_pregnancy_date}</span>
                    ) : (
                      <EmptyHighlight value={pet.last_heat_pregnancy_date}> · Date: —</EmptyHighlight>
                    )}
                  </div>
                )}
                <div className="border-t border-slate-200 pt-2 mt-2">
                  <div className="flex items-center gap-1.5 mb-2"><Heart className="w-4 h-4 text-apl-blue" /><span className="text-sm font-semibold text-slate-500">Medical</span></div>
                  <div className="grid grid-cols-1 gap-1.5 text-sm">
                    <div>Sick/injured: <EmptyHighlight value={pet.currently_sick_injured}><strong className={pet.currently_sick_injured ? 'text-red-600' : 'text-slate-700'}>{boolLabel(pet.currently_sick_injured)}</strong></EmptyHighlight></div>
                    <div>Conditions: <EmptyHighlight value={pet.medical_conditions?.length ? pet.medical_conditions.join(', ') : ''}><strong className="text-slate-700">{pet.medical_conditions?.length ? `${pet.medical_conditions.join(', ')}${pet.medical_conditions_other ? ` (${pet.medical_conditions_other})` : ''}` : '—'}</strong></EmptyHighlight></div>
                    <div>Previous surgeries: <EmptyHighlight value={pet.previous_surgeries}><strong className="text-slate-700">{boolLabel(pet.previous_surgeries)}</strong></EmptyHighlight>{pet.previous_surgeries === true && pet.previous_surgeries_details && <span className="text-slate-600"> — {pet.previous_surgeries_details}</span>}</div>
                    <div>Drug/vaccine reactions: <EmptyHighlight value={pet.drug_vaccine_reactions}><strong className="text-slate-700">{boolLabel(pet.drug_vaccine_reactions)}</strong></EmptyHighlight>{pet.drug_vaccine_reactions === true && pet.drug_vaccine_reactions_details && <span className="text-slate-600"> — {pet.drug_vaccine_reactions_details}</span>}</div>
                    <div>Current medications: <EmptyHighlight value={pet.current_medications}><strong className="text-slate-700">{boolLabel(pet.current_medications)}</strong></EmptyHighlight>{pet.current_medications === true && pet.current_medications_details && <span className="text-slate-600"> — {pet.current_medications_details}</span>}</div>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-2">
                  <div className="flex items-center gap-1.5 mb-2"><Shield className="w-4 h-4 text-apl-blue" /><span className="text-sm font-semibold text-slate-500">Vaccination</span></div>
                  <div className="grid grid-cols-1 gap-1.5 text-sm">
                    <div>Rabies vaccinated: <EmptyHighlight value={pet.rabies_vaccinated}><strong className="text-slate-700 capitalize">{pet.rabies_vaccinated || '—'}</strong></EmptyHighlight></div>
                    <div>Rabies (1–3 yrs): <EmptyHighlight value={pet.rabies_within_1_3_years}><strong className="text-slate-700 capitalize">{pet.rabies_within_1_3_years || '—'}</strong></EmptyHighlight></div>
                    <div>Disease exposure (30d): <EmptyHighlight value={pet.exposed_to_diseases}><strong className={pet.exposed_to_diseases ? 'text-red-600' : 'text-slate-700'}>{boolLabel(pet.exposed_to_diseases)}</strong></EmptyHighlight></div>
                    <div>Fleas/ticks: <EmptyHighlight value={pet.has_fleas_ticks}><strong className={pet.has_fleas_ticks ? 'text-amber-600' : 'text-slate-700'}>{boolLabel(pet.has_fleas_ticks)}</strong></EmptyHighlight></div>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-2">
                  <div className="flex items-center gap-1.5 mb-1"><Stethoscope className="w-4 h-4 text-apl-blue" /><span className="text-sm font-semibold text-slate-500">Behavior</span></div>
                  <p className="text-sm capitalize text-slate-700"><EmptyHighlight value={pet.vet_behavior}>{pet.vet_behavior || '—'}</EmptyHighlight></p>
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
                    <label className="block text-xs text-slate-500 mb-1">Age</label>
                    <input
                      value={pet.age || ''}
                      onChange={(e) => updatePet(i, 'age', e.target.value)}
                      placeholder="e.g. 2 years"
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
                      <label className="block text-xs text-slate-500 mb-1">In heat / pregnant</label>
                      <select
                        value={pet.in_heat_or_pregnant || ''}
                        onChange={(e) => updatePet(i, 'in_heat_or_pregnant', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-pink-200 bg-pink-50/50 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue cursor-pointer"
                      >
                        <option value="">—</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </div>
                    {(pet.in_heat_or_pregnant === 'yes' || pet.in_heat_or_pregnant === 'unknown') && (
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Last heat / pregnancy date</label>
                        <input
                          value={pet.last_heat_pregnancy_date || ''}
                          onChange={(e) => updatePet(i, 'last_heat_pregnancy_date', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue"
                        />
                      </div>
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

                {/* Behavior */}
                <div className="border-t border-slate-200 pt-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Stethoscope className="w-4 h-4 text-apl-blue" />
                    <span className="text-sm font-semibold text-slate-500">Behavior at vet</span>
                  </div>
                  <input
                    value={pet.vet_behavior || ''}
                    onChange={(e) => updatePet(i, 'vet_behavior', e.target.value)}
                    placeholder="e.g. calm, nervous, aggressive"
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue"
                  />
                </div>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Optional Services */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-apl-blue" />
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                Requested Services
              </p>
            </div>
            {!isEditing ? (
              <div className="flex flex-wrap gap-2">
                {(services.wants_microchip || services.wants_nail_trim || services.wants_flea_treatment) ? (
                  <>
                    {services.wants_microchip && <span className="text-sm bg-apl-blue/10 text-apl-blue-dark px-3 py-1.5 rounded-lg font-medium">Microchip</span>}
                    {services.wants_nail_trim && <span className="text-sm bg-apl-blue/10 text-apl-blue-dark px-3 py-1.5 rounded-lg font-medium">Nail Trim</span>}
                    {services.wants_flea_treatment && <span className="text-sm bg-apl-blue/10 text-apl-blue-dark px-3 py-1.5 rounded-lg font-medium">Flea Treatment</span>}
                  </>
                ) : (
                  <EmptyHighlight value="">
                    <span className="text-sm text-slate-400">None</span>
                  </EmptyHighlight>
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
          <div className="text-sm text-slate-400 space-y-1">
            <p>Legal acknowledged: {appointment.legal_acknowledged ? '✅ Yes' : '❌ No'}</p>
            <p>Signature: <EmptyHighlight value={appointment.signature}><span className="italic text-slate-600">{appointment.signature || '—'}</span></EmptyHighlight></p>
          </div>

          {/* Admin Notes */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-apl-blue" />
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                Admin Notes
              </p>
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
          <div className="text-sm text-slate-400 space-y-1 pt-2 border-t border-slate-100">
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
