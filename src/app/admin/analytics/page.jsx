'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MousePointerClick, RefreshCw, Lock } from 'lucide-react'

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

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-apl-blue rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <header className="bg-white border-b border-slate-100 px-4 md:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="md:pl-0 pl-14">
              <h1 className="text-xl font-bold text-slate-800">Analytics</h1>
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
                className="self-start md:self-auto flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-600 font-medium transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            )}
          </div>
        </header>

        <div className="p-4 md:p-8">
          {!canViewAnalytics ? (
            <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-8 text-center max-w-md mx-auto">
              <Lock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-700 mb-2">Access restricted</h2>
              <p className="text-sm text-slate-600">
                Analytics are only available to Karl Legson.
              </p>
            </div>
          ) : loading ? (
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
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-slate-500" />
                Link / button clicks
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Pricing — Request appointment</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{linkClicks['pricing-request-appointment'] ?? 0}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Pricing — Back to home</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{linkClicks['pricing-back-to-home'] ?? 0}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Google Business profile</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{linkClicks['google-business'] ?? 0}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600">No data available.</p>
          )}
        </div>
    </>
  )
}
