'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AdminPageLoading from '@/components/AdminPageLoading'
import AppointmentTable from '@/components/AppointmentTable'
import AppointmentDetail from '@/components/AppointmentDetail'
import TnrWaitlistDetail from '@/components/TnrWaitlistDetail'
import { RefreshCw, Search } from 'lucide-react'

export default function AdminTnrPage() {
  const router = useRouter()
  const [authChecking, setAuthChecking] = useState(true)
  const [staffName, setStaffName] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [waitlist, setWaitlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [selectedWaitlistEntry, setSelectedWaitlistEntry] = useState(null)

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
        } else {
          setStaffName(data.staffName)
          setAuthChecking(false)
        }
      })
      .catch(() => router.replace('/admin'))
  }, [router])

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await fetch('/api/appointments?status=tnr&limit=100', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setAppointments(data.appointments || [])
      }
    } catch (err) {
      console.error('Failed to fetch TNR appointments:', err)
    }
  }, [])

  const fetchWaitlist = useCallback(async () => {
    try {
      const res = await fetch('/api/tnr-waitlist?moved=1', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setWaitlist(data.waitlist || [])
      }
    } catch (err) {
      console.error('Failed to fetch TNR waitlist:', err)
    }
  }, [])

  const fetchAll = useCallback(() => {
    setLoading(true)
    Promise.all([fetchAppointments(), fetchWaitlist()]).finally(() => setLoading(false))
  }, [fetchAppointments, fetchWaitlist])

  useEffect(() => {
    if (!authChecking) fetchAll()
  }, [authChecking, fetchAll])

  const searchLower = searchInput.trim().toLowerCase()
  const appointmentsFiltered = !searchLower
    ? appointments
    : appointments.filter((a) => {
        const haystack = [
          a.owner_first_name,
          a.owner_last_name,
          a.owner_name,
          a.owner_email,
          a.owner_phone,
          a.city,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return haystack.includes(searchLower)
      })
  const waitlistFiltered = !searchLower
    ? waitlist
    : waitlist.filter((row) => {
        const haystack = [row.first_name, row.last_name, row.email, row.phone]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return haystack.includes(searchLower)
      })

  const allEntries = [
    ...appointmentsFiltered.map((a) => ({ type: 'appointment', ...a })),
    ...waitlistFiltered.map((t) => ({ type: 'tnr', ...t })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const handleSelectEntry = (entry) => {
    if (entry.type === 'tnr') {
      setSelectedWaitlistEntry(entry)
      setSelectedAppointment(null)
    } else {
      setSelectedAppointment(entry)
      setSelectedWaitlistEntry(null)
    }
  }

  const showOverlay = authChecking || loading
  if (showOverlay) {
    return <AdminPageLoading />
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">TNR</h1>
          <p className="text-sm text-slate-500">
            Intake submissions moved to TNR and TNR waitlist entries. One place for all TNR.
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="self-start flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-600 font-medium transition-colors cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      <section aria-label="TNR list">
        <div className="flex justify-end mb-3">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue transition-all"
            />
          </div>
        </div>
        <AppointmentTable
          entries={allEntries}
          loading={loading}
          total={allEntries.length}
          page={1}
          totalPages={1}
          onSelectEntry={handleSelectEntry}
        />
      </section>

      {selectedAppointment && (
        <AppointmentDetail
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onUpdate={(updated) => {
            if (updated.status !== 'tnr') {
              setAppointments((prev) => prev.filter((apt) => apt.id !== updated.id))
              setSelectedAppointment(null)
              return
            }
            setAppointments((prev) =>
              prev.map((apt) => (apt.id === updated.id ? updated : apt))
            )
            setSelectedAppointment(updated)
          }}
          onDelete={() => {
            setAppointments((prev) => prev.filter((apt) => apt.id !== selectedAppointment.id))
            setSelectedAppointment(null)
          }}
          staffName={staffName}
        />
      )}

      {selectedWaitlistEntry && (
        <TnrWaitlistDetail
          entry={selectedWaitlistEntry}
          alreadyOnTnrPage
          onClose={() => setSelectedWaitlistEntry(null)}
          onMoved={() => {
            fetchWaitlist()
            setSelectedWaitlistEntry(null)
          }}
        />
      )}
    </div>
  )
}
