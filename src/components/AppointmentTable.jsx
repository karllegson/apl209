'use client'

import { format } from 'date-fns'
import StatusBadge from './StatusBadge'
import { AlertTriangle, ChevronLeft, ChevronRight, FileText, ImageIcon } from 'lucide-react'

const REQUESTED_SERVICE_LABELS = {
  spay_neuter: 'Spay & Neuter',
  vaccines: 'Vaccines only',
  wellness_other: 'Wellness / Other',
  tnr: 'TNR',
}

export default function AppointmentTable({
  appointments,
  entries: entriesProp,
  loading,
  total,
  page,
  totalPages,
  onPageChange,
  onSelect,
  onSelectEntry,
  highlightedId,
}) {
  const isMerged = Array.isArray(entriesProp) && entriesProp.length >= 0
  const entries = isMerged ? entriesProp : (appointments || []).map((apt) => ({ type: 'appointment', ...apt }))
  const onRowSelect = onSelectEntry || ((entry) => entry.type === 'appointment' && onSelect?.(entry))
  if (loading) {
    return (
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 text-center text-slate-400">
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if ((isMerged ? entries.length === 0 : !appointments?.length)) {
    return (
      <div className="bg-white rounded-xl border-2 border-slate-200 p-12 text-center shadow-sm">
        <p className="text-slate-400 text-sm">No submissions found.</p>
      </div>
    )
  }

  const getPetSummary = (pets) => {
    if (!pets || !Array.isArray(pets) || pets.length === 0) return '—'
    return pets
      .map((p) => {
        const emoji = p.type === 'cat' ? '🐱' : '🐶'
        return `${emoji} ${p.pet_name || p.type}`
      })
      .join(', ')
  }

  const hasSickPet = (pets) => {
    if (!pets || !Array.isArray(pets)) return false
    return pets.some((p) => p.currently_sick_injured === true)
  }

  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-slate-200 bg-slate-100">
              {isMerged && (
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  Type
                </th>
              )}
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                Owner
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                Pets
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                City
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                Services
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                Submitted
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.map((entry) => {
              if (entry.type === 'tnr') {
                const name = [entry.first_name, entry.last_name].filter(Boolean).join(' ') || '—'
                return (
                  <tr
                    key={`tnr-${entry.id}`}
                    onClick={() => onRowSelect(entry)}
                    className="cursor-pointer transition-colors hover:bg-apl-blue/5"
                  >
                    {isMerged && (
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-violet-700 bg-violet-100 px-2 py-1 rounded">TNR</span>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-800">{name}</p>
                      <p className="text-xs text-slate-400">{entry.phone || entry.email || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-400">—</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-400">—</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-700">TNR waitlist</p>
                      <div className="flex items-center gap-2 mt-1">
                        {entry.customer_notes && String(entry.customer_notes).trim() && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-500" title="Has note">
                            <FileText className="w-3 h-3" /> Note
                          </span>
                        )}
                        {entry.photo_url && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-500" title="Has photo">
                            <ImageIcon className="w-3 h-3" /> Photo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">
                        {entry.created_at ? format(new Date(entry.created_at), 'MMM d, yyyy') : '—'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {entry.created_at ? format(new Date(entry.created_at), 'h:mm a') : '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-400">—</span>
                    </td>
                  </tr>
                )
              }
              const apt = entry
              return (
                <tr
                  key={apt.id}
                  onClick={() => onRowSelect(apt)}
                  className={`cursor-pointer transition-colors hover:bg-apl-blue/5 ${
                    highlightedId === apt.id ? 'bg-amber-100/80 ring-2 ring-amber-400/60' : ''
                  }`}
                >
                  {isMerged && (
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">Intake</span>
                    </td>
                  )}
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">
                    {[apt.owner_first_name, apt.owner_last_name].filter(Boolean).join(' ') || apt.owner_name || '—'}
                    {hasSickPet(apt.pets) && (
                      <AlertTriangle className="inline w-3.5 h-3.5 text-red-500 ml-1.5" />
                    )}
                  </p>
                  <p className="text-xs text-slate-400">{apt.owner_phone}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-slate-700">
                    {getPetSummary(apt.pets)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {apt.num_pets} pet{apt.num_pets !== 1 ? 's' : ''}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-slate-700">
                    {[apt.street_address, [apt.city, apt.state].filter(Boolean).join(', '), apt.zip_code].filter(Boolean).join(' ') || '—'}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">
                    {REQUESTED_SERVICE_LABELS[apt.requested_service] ||
                      apt.requested_service ||
                      '—'}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {apt.wants_microchip && (
                      <span className="text-[10px] bg-apl-blue/10 text-apl-blue-dark px-1.5 py-0.5 rounded font-medium">
                        Chip
                      </span>
                    )}
                    {apt.wants_nail_trim && (
                      <span className="text-[10px] bg-apl-blue/10 text-apl-blue-dark px-1.5 py-0.5 rounded font-medium">
                        Nails
                      </span>
                    )}
                    {apt.wants_flea_treatment && (
                      <span className="text-[10px] bg-apl-blue/10 text-apl-blue-dark px-1.5 py-0.5 rounded font-medium">
                        Flea
                      </span>
                    )}
                    {!apt.wants_microchip &&
                      !apt.wants_nail_trim &&
                      !apt.wants_flea_treatment &&
                      !apt.requested_service && (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-slate-700">
                    {format(new Date(apt.created_at), 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-slate-400">
                    {format(new Date(apt.created_at), 'h:mm a')}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={apt.status} />
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t-2 border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-500">
            Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of{' '}
            {total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-slate-600 px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
