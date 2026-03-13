'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminPageLoading from '@/components/AdminPageLoading'
import { ArrowLeft } from 'lucide-react'

const TAX_RATE = 0.09

function parseMoneyToCents(value) {
  const cleaned = (value || '').replace(/[$,]/g, '').trim()
  if (cleaned === '') return 0
  const n = Number(cleaned)
  return Number.isFinite(n) ? Math.round(n * 100) : NaN
}

function fmtCents(cents) {
  return (cents / 100).toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

function parseLineItems(text) {
  const parts = (text || '')
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
  const cents = []
  for (const p of parts) {
    const c = parseMoneyToCents(p)
    if (!Number.isFinite(c)) return null
    cents.push(c)
  }
  return cents
}

function taxForLine(cents) {
  return Math.round(cents * TAX_RATE)
}

function totals(lines) {
  let pre = 0
  let tax = 0
  for (const c of lines) {
    pre += c
    tax += taxForLine(c)
  }
  return { pre, total: pre + tax }
}

export default function CovetrusTaxPage() {
  const router = useRouter()
  const [authChecking, setAuthChecking] = useState(true)
  const [staffName, setStaffName] = useState(null)
  const [pharmaText, setPharmaText] = useState('')
  const [clinicText, setClinicText] = useState('')

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

  const canView = staffName === 'Karl Legson'

  useEffect(() => {
    if (!canView && !authChecking && staffName) {
      router.replace('/admin')
    }
  }, [canView, authChecking, staffName, router])

  const pLines = parseLineItems(pharmaText)
  const cLines = parseLineItems(clinicText)
  const valid = pLines !== null && cLines !== null
  const p = valid ? totals(pLines) : { pre: 0, total: 0 }
  const c = valid ? totals(cLines) : { pre: 0, total: 0 }
  const grand = valid ? p.total + c.total : 0

  const clearAll = () => {
    setPharmaText('')
    setClinicText('')
  }

  if (authChecking) {
    return <AdminPageLoading />
  }

  if (!canView) {
    return null
  }

  return (
    <>
      <header className="bg-white border-b border-slate-100 px-4 md:px-8 py-5">
        <div className="md:pl-0 pl-14 flex flex-wrap items-center gap-3">
          <Link
            href="/admin/tools"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Admin Tools
          </Link>
          <h1 className="text-xl font-bold text-slate-800">Covetrus Category Totals (Tax 9%)</h1>
        </div>
      </header>

      <div className="p-4 md:p-8 max-w-[32rem]">
        <p className="text-slate-600 text-sm mb-6">
          Enter <strong>line items pre-tax</strong>. Separate numbers with commas, spaces, or new lines. Tax is
          calculated like receipts: <strong>rounded per item</strong>.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Pharmaceuticals (Tax code 8420)
            </label>
            <textarea
              value={pharmaText}
              onChange={(e) => setPharmaText(e.target.value)}
              placeholder="Example:&#10;692.23&#10;15.40"
              rows={4}
              className="w-full rounded-lg border border-slate-300 bg-[#ffcc80]/30 px-3 py-2.5 text-slate-800 placeholder:text-slate-500 focus:border-apl-primary focus:outline-none focus:ring-1 focus:ring-apl-primary resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Clinic supplies (Tax code 8410)
            </label>
            <textarea
              value={clinicText}
              onChange={(e) => setClinicText(e.target.value)}
              placeholder="Example: 127.40, 23.95, 31.20"
              rows={4}
              className="w-full rounded-lg border border-slate-300 bg-[#e6ff66]/30 px-3 py-2.5 text-slate-800 placeholder:text-slate-500 focus:border-apl-primary focus:outline-none focus:ring-1 focus:ring-apl-primary resize-y"
            />
          </div>
        </div>

        <hr className="my-6 border-slate-200" />

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Pharmaceuticals pre-tax subtotal
            </label>
            <input
              type="text"
              readOnly
              value={valid ? fmtCents(p.pre) : ''}
              className="w-full rounded-lg border border-slate-200 bg-[#ffe8c2] px-3 py-2 font-semibold text-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Clinic supplies pre-tax subtotal
            </label>
            <input
              type="text"
              readOnly
              value={valid ? fmtCents(c.pre) : ''}
              className="w-full rounded-lg border border-slate-200 bg-[#f5ffb8] px-3 py-2 font-semibold text-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Pharmaceuticals total (with tax)
            </label>
            <input
              type="text"
              readOnly
              value={valid ? fmtCents(p.total) : ''}
              className="w-full rounded-lg border border-slate-200 bg-[#ffe8c2] px-3 py-2 font-semibold text-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Clinic supplies total (with tax)
            </label>
            <input
              type="text"
              readOnly
              value={valid ? fmtCents(c.total) : ''}
              className="w-full rounded-lg border border-slate-200 bg-[#f5ffb8] px-3 py-2 font-semibold text-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Grand total</label>
            <input
              type="text"
              readOnly
              value={valid ? fmtCents(grand) : ''}
              className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 font-semibold text-slate-800"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={clearAll}
          className="mt-6 px-4 py-2.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-sm font-medium text-slate-700"
        >
          Clear
        </button>

        <p className="mt-4 text-xs text-slate-500">Fixed tax rate: 9%</p>
      </div>
    </>
  )
}
