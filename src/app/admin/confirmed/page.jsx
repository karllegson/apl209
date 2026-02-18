'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import AppointmentTable from '@/components/AppointmentTable'
import AppointmentDetail from '@/components/AppointmentDetail'
import { Search, RefreshCw, Download } from 'lucide-react'

export default function ConfirmedPage() {
  const router = useRouter()
  const [authChecking, setAuthChecking] = useState(true)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selected, setSelected] = useState(null)
  const [lastViewedId, setLastViewedId] = useState(null)
  const [staffName, setStaffName] = useState(null)

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

  useEffect(() => {
    if (!lastViewedId) return
    const timer = setTimeout(() => setLastViewedId(null), 5000)
    return () => clearTimeout(timer)
  }, [lastViewedId])

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        status: 'confirmed',
      })
      if (search.trim()) params.set('search', search.trim())
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)

      const res = await fetch(`/api/appointments?${params}`)
      if (res.ok) {
        const data = await res.json()
        setAppointments(data.appointments)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      }
    } catch (err) {
      console.error('Failed to fetch confirmed appointments:', err)
    } finally {
      setLoading(false)
    }
  }, [page, search, dateFrom, dateTo])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleUpdate = (updatedAppointment) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === updatedAppointment.id ? updatedAppointment : apt
      )
    )
    setSelected(updatedAppointment)
  }

  const handleDelete = (deletedId) => {
    setAppointments((prev) => prev.filter((apt) => apt.id !== deletedId))
    setTotal((prev) => prev - 1)
  }

  if (authChecking) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-apl-blue rounded-full animate-spin" />
      </div>
    )
  }

  const handleExportCSV = () => {
    if (!appointments.length) return

    const headers = [
      'Owner Name',
      'Email',
      'Phone',
      'City',
      'Requested Service',
      'Status',
      'Created',
    ]

    const rows = appointments.map((apt) => [
      [apt.owner_first_name, apt.owner_last_name].filter(Boolean).join(' ') || apt.owner_name || '',
      apt.owner_email,
      apt.owner_phone,
      apt.city || '',
      apt.requested_service || '',
      apt.status,
      apt.created_at,
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `apl-confirmed-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 min-h-screen md:pl-64">
        <header className="bg-white border-b border-slate-100 px-4 md:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="md:pl-0 pl-14">
              <h1 className="text-xl font-bold text-slate-800">
                Confirmed
              </h1>
              <p className="text-sm text-slate-500">
                Successfully called &amp; booked — transfer to your booking app. {total} confirmed.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                disabled={!appointments.length}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-sm text-slate-600 font-medium transition-colors disabled:opacity-40 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={fetchAppointments}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-600 font-medium transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name, email, phone..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value)
                    setPage(1)
                  }}
                  className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue transition-all"
                  placeholder="From"
                />
                <span className="text-slate-400 text-sm">to</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value)
                    setPage(1)
                  }}
                  className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-apl-blue/30 focus:border-apl-blue transition-all"
                  placeholder="To"
                />
              </div>
            </div>
          </div>

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
        </div>
      </main>

      {selected && (
        <AppointmentDetail
          appointment={selected}
          onClose={() => {
            setLastViewedId(selected.id)
            setSelected(null)
          }}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          staffName={staffName}
        />
      )}
    </div>
  )
}
