'use client'

import { useState, useEffect, useCallback } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import StatsCards from '@/components/StatsCards'
import AppointmentTable from '@/components/AppointmentTable'
import AppointmentDetail from '@/components/AppointmentDetail'
import { Search, Filter, RefreshCw } from 'lucide-react'

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no-show', label: 'No Show' },
]

export default function AdminDashboardPage() {
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

  useEffect(() => {
    if (!lastViewedId) return
    const timer = setTimeout(() => setLastViewedId(null), 5000)
    return () => clearTimeout(timer)
  }, [lastViewedId])

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const res = await fetch('/api/stats')
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

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
      })
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (search.trim()) params.set('search', search.trim())

      const res = await fetch(`/api/appointments?${params}`)
      if (res.ok) {
        const data = await res.json()
        setAppointments(data.appointments)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, search])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

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
  }

  const handleUpdate = (updatedAppointment) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === updatedAppointment.id ? updatedAppointment : apt
      )
    )
    setSelected(updatedAppointment)
    fetchStats()
  }

  const handleDelete = (deletedId) => {
    setAppointments((prev) => prev.filter((apt) => apt.id !== deletedId))
    setTotal((prev) => prev - 1)
    fetchStats()
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 px-4 md:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="md:pl-0 pl-14">
              <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
              <p className="text-sm text-slate-500">
                Animal Protection League &mdash; Appointment Manager
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="self-start md:self-auto flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-600 font-medium transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-6">
          {/* Stats */}
          <section aria-label="Statistics">
            <StatsCards stats={stats} loading={statsLoading} />
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
          </div>
          </section>

          {/* Table */}
          <section aria-label="Appointments">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recent submissions</p>
          <AppointmentTable
            appointments={appointments}
            loading={loading}
            total={total}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onSelect={setSelected}
            highlightedId={lastViewedId}
          />
          </section>
        </div>
      </main>

      {/* Detail Panel */}
      {selected && (
        <AppointmentDetail
          appointment={selected}
          onClose={() => {
            setLastViewedId(selected.id)
            setSelected(null)
          }}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
