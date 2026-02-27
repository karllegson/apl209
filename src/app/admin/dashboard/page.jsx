'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import AdminPageLoading from '@/components/AdminPageLoading'
import StatsCards from '@/components/StatsCards'
import AppointmentTable from '@/components/AppointmentTable'
import AppointmentDetail from '@/components/AppointmentDetail'
import TnrWaitlistDetail from '@/components/TnrWaitlistDetail'
import { Search, Filter, RefreshCw, ArrowUpDown } from 'lucide-react'

const statusFilters = [
  { value: 'all', label: 'All (excl. confirmed, attempted & TNR)' },
  { value: 'pending', label: 'Pending' },
]

const sortOptions = [
  { value: 'oldest', label: 'Oldest first' },
  { value: 'newest', label: 'Newest first' },
]

export default function AdminDashboardPage() {
  const router = useRouter()
  const [staffName, setStaffName] = useState(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [stats, setStats] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [lastViewedId, setLastViewedId] = useState(null)
  const [sortOrder, setSortOrder] = useState('oldest')
  const [tnrWaitlist, setTnrWaitlist] = useState([])
  const [tnrLoading, setTnrLoading] = useState(true)
  const [selectedTnrEntry, setSelectedTnrEntry] = useState(null)

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
    if (!lastViewedId) return
    const timer = setTimeout(() => setLastViewedId(null), 5000)
    return () => clearTimeout(timer)
  }, [lastViewedId])

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const res = await fetch('/api/stats', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const fetchTnrWaitlist = useCallback(async () => {
    setTnrLoading(true)
    try {
      const res = await fetch('/api/tnr-waitlist?moved=0', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setTnrWaitlist(data.waitlist || [])
      }
    } catch (err) {
      console.error('Failed to fetch TNR waitlist:', err)
    } finally {
      setTnrLoading(false)
    }
  }, [])

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '100',
      })
      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      } else {
        params.set('excludeStatus', 'confirmed,attempted,cancelled,tnr')
      }
      if (search.trim()) params.set('search', search.trim())

      const res = await fetch(`/api/appointments?${params}`)
      if (res.ok) {
        const data = await res.json()
        const list = data.appointments || []
        let sorted = list
        if (statusFilter === 'all') {
          sorted = [...list].sort((a, b) => {
            const aPending = a.status === 'pending' ? 0 : 1
            const bPending = b.status === 'pending' ? 0 : 1
            if (aPending !== bPending) return aPending - bPending
            const aTime = new Date(a.created_at).getTime()
            const bTime = new Date(b.created_at).getTime()
            return sortOrder === 'oldest' ? aTime - bTime : bTime - aTime
          })
        }
        setAppointments(sorted)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search, sortOrder])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchTnrWaitlist()
  }, [fetchTnrWaitlist])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  // Debounced search
  const [searchInput, setSearchInput] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleRefresh = () => {
    fetchStats()
    fetchAppointments()
    fetchTnrWaitlist()
  }

  const handleSelectEntry = (entry) => {
    if (entry.type === 'tnr') {
      setSelectedTnrEntry(entry)
      setSelected(null)
    } else {
      setSelected(entry)
      setSelectedTnrEntry(null)
    }
  }

  const handleTnrAdded = () => {
    fetchTnrWaitlist()
  }

  const searchLower = (searchInput || '').trim().toLowerCase()
  const tnrFiltered =
    !searchLower && tnrWaitlist.length > 0
      ? tnrWaitlist
      : tnrWaitlist.filter((t) => {
          const name = [t.first_name, t.last_name, t.email, t.phone].filter(Boolean).join(' ').toLowerCase()
          return name.includes(searchLower)
        })
  const appointmentsFiltered =
    statusFilter === 'all' ? appointments : appointments.filter((a) => a.status === statusFilter)
  const allEntries = [
    ...appointmentsFiltered.map((a) => ({ type: 'appointment', ...a })),
    ...tnrFiltered.map((t) => ({ type: 'tnr', ...t })),
  ].sort((a, b) => {
    const ta = new Date(a.created_at).getTime()
    const tb = new Date(b.created_at).getTime()
    return sortOrder === 'oldest' ? ta - tb : tb - ta
  })
  const pageSize = 20
  const totalMerged = allEntries.length
  const totalPagesMerged = Math.max(1, Math.ceil(totalMerged / pageSize))
  const pageMerged = Math.min(page, totalPagesMerged)
  const currentPageEntries = allEntries.slice((pageMerged - 1) * pageSize, pageMerged * pageSize)

  const handleUpdate = (updatedAppointment) => {
    setAppointments((prev) => {
      const movedAway =
        (statusFilter === 'all' && ['confirmed', 'attempted', 'cancelled', 'tnr'].includes(updatedAppointment.status)) ||
        (statusFilter === 'pending' && updatedAppointment.status !== 'pending')
      if (movedAway) {
        return prev.filter((apt) => apt.id !== updatedAppointment.id)
      }
      return prev.map((apt) =>
        apt.id === updatedAppointment.id ? updatedAppointment : apt
      )
    })
    const movedAway =
      (statusFilter === 'all' && ['confirmed', 'attempted', 'cancelled', 'tnr'].includes(updatedAppointment.status)) ||
      (statusFilter === 'pending' && updatedAppointment.status !== 'pending')
    setSelected(movedAway ? null : updatedAppointment)
    fetchStats()
  }

  const handleDelete = (deletedId) => {
    setAppointments((prev) => prev.filter((apt) => apt.id !== deletedId))
    setTotal((prev) => prev - 1)
    fetchStats()
  }

  const showOverlay = authChecking || loading || statsLoading || tnrLoading
  if (showOverlay) {
    return <AdminPageLoading />
  }

  return (
    <div className="relative min-h-screen">
      {/* Blurry clinic background + peeking pets (same as form page) */}
      <div
        className="absolute inset-0 -z-10 bg-gray-900"
        style={{
          backgroundImage: 'url(/clinic-waiting-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(14px)',
        }}
      />
      <div className="absolute inset-0 -z-10 bg-black/60" aria-hidden />
      <div className="absolute inset-y-0 left-[75%] right-[-25%] md:left-[82%] md:right-[-40%] z-[1] pointer-events-none flex items-center" aria-hidden>
        <div className="relative w-[42vw] h-[36vh] max-h-[55%] md:w-full md:h-full md:max-h-[65%] md:max-w-[55%] opacity-[0.10] origin-left -translate-y-[15%] md:-translate-y-[22%]">
          <Image
            src="/peeking-pets.png"
            alt=""
            fill
            className="object-contain object-left"
            sizes="40vw"
          />
        </div>
      </div>

      <header className="relative z-10 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 md:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="md:pl-0 pl-14">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
                {(loading || statsLoading || tnrLoading) && (
                  <span className="flex items-center gap-1.5 text-sm text-slate-500">
                    <span className="w-4 h-4 border-2 border-slate-300 border-t-apl-blue rounded-full animate-spin" />
                    Loading…
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">
                Animal Protection League &mdash; Appointment Manager
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading || statsLoading || tnrLoading}
              className="self-start md:self-auto flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-600 font-medium transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading || statsLoading || tnrLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </header>

        <div className="relative z-10 p-4 md:p-8 space-y-6">
          {/* Stats */}
          <section aria-label="Statistics">
            <StatsCards
              stats={stats}
              loading={statsLoading}
              onStatusClick={(statusKey) => {
                if (statusKey === 'cancelled') {
                  setStatusFilter('cancelled')
                  setPage(1)
                }
              }}
            />
          </section>

          {/* Filters */}
          <section aria-label="Search and filters" className="rounded-xl bg-slate-100/60 border border-slate-200 px-4 py-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Search & filter</p>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name, email, phone..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue transition-all"
                />
              </div>

              {/* Status filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue transition-all cursor-pointer"
                >
                  {statusFilters.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort order */}
              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue transition-all cursor-pointer"
                >
                  {sortOptions.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-3 flex justify-end text-xs text-slate-400">
              {/* Cancelled are available on the All Appointments page */}
            </div>
          </section>

          {/* Table — all entries (intake + TNR) */}
          <section aria-label="All entries">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">All entries</p>
            {totalMerged === 0 ? (
              <div className="bg-white rounded-xl border-2 border-slate-200 p-8 md:p-10 text-center shadow-sm flex flex-col items-center gap-4">
                <Image
                  src="/tnr-confirmation-cat.png"
                  alt=""
                  width={160}
                  height={160}
                  className="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-cover"
                />
                <div className="space-y-1">
                  <p className="text-base md:text-lg font-semibold text-slate-800">
                    Nothing to see here.
                  </p>
                  <p className="text-sm text-slate-500">
                    No pending intakes or TNR waitlist entries match your filters.
                  </p>
                </div>
              </div>
            ) : (
              <AppointmentTable
                entries={currentPageEntries}
                loading={false}
                total={totalMerged}
                page={pageMerged}
                totalPages={totalPagesMerged}
                onPageChange={setPage}
                onSelectEntry={handleSelectEntry}
                highlightedId={lastViewedId}
              />
          )}
        </section>
        </div>

      {selected && (
        <AppointmentDetail
          appointment={selected}
          onClose={() => {
            setLastViewedId(selected.id)
            setSelected(null)
          }}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onTnrAdded={handleTnrAdded}
          staffName={staffName}
        />
      )}

      {selectedTnrEntry && (
        <TnrWaitlistDetail
          entry={selectedTnrEntry}
          onClose={() => setSelectedTnrEntry(null)}
          onMoved={() => {
            fetchTnrWaitlist()
          }}
        />
      )}
    </div>
  )
}
