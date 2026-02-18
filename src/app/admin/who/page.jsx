'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { User, Loader2 } from 'lucide-react'

const STAFF_NAMES = [
  'Karl Legson',
  'Jolene Medeiros',
  'Jaime Goodpasture',
  'April Self',
  'Samantha Holman',
  'Janette Osorio',
  'Libby Torres',
]

export default function AdminWhoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    fetch('/api/admin/me', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          router.replace('/admin')
          return
        }
        return res.json()
      })
      .then((data) => {
        if (data?.staffName) router.replace('/admin/dashboard')
      })
      .catch(() => router.replace('/admin'))
      .finally(() => setChecking(false))
  }, [router])

  const handleSelect = async (name) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to sign in')
      }
      router.push('/admin/dashboard')
      router.refresh()
    } catch (err) {
      setLoading(false)
      alert(err.message || 'Something went wrong')
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <div
        className="fixed inset-0 -z-10 bg-gray-900"
        style={{
          backgroundImage: 'url(/admin-login-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(3px)',
        }}
      />
      <div className="fixed inset-0 -z-10 bg-black/60" aria-hidden />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 overflow-hidden">
            <Image
              src="/logo.png"
              alt="APL"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          <h1 className="text-xl font-bold text-white">Who are you?</h1>
          <p className="text-sm text-slate-400 mt-1">
            Choose your name to sign in
          </p>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700 space-y-2">
          {STAFF_NAMES.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => handleSelect(name)}
              disabled={loading}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 text-white font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              <User className="w-5 h-5 text-slate-400 shrink-0" />
              {name}
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Animal Protection League &mdash; Admin Portal
        </p>
      </div>
    </div>
  )
}
