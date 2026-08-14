'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { LanguageProvider } from '@/components/intake/LanguageContext'
import VolunteerSignIn from '@/components/volunteer/VolunteerSignIn'
import VolunteerSchedule from '@/components/volunteer/VolunteerSchedule'

function VolunteerApp() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/volunteer/me')
        if (!res.ok) {
          if (!cancelled) setSession(null)
          return
        }
        const data = await res.json()
        if (!cancelled) setSession(data)
      } catch {
        if (!cancelled) setSession(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const cardClass = session
    ? 'relative bg-white rounded-2xl border border-white/80 shadow-[0_16px_50px_rgba(0,0,0,0.22)] p-4 sm:p-6 md:p-8 overflow-hidden'
    : 'relative bg-white rounded-2xl border border-white/80 shadow-[0_16px_50px_rgba(0,0,0,0.22)] p-5 sm:p-6 md:p-8 overflow-hidden'

  return (
    <div className={session ? 'max-w-4xl mx-auto w-full min-w-0 relative' : 'max-w-lg mx-auto w-full relative'}>
      <div className="pointer-events-none absolute -top-8 -left-10 h-28 w-28 rounded-full bg-apl-orange/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -right-8 h-32 w-32 rounded-full bg-apl-primary/45 blur-3xl" />
      <div className={cardClass}>
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-apl-orange via-apl-primary to-apl-blue-dark" />
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-apl-primary" />
          </div>
        ) : !session ? (
          <VolunteerSignIn onSignedIn={setSession} />
        ) : (
          <VolunteerSchedule session={session} onSignOut={() => setSession(null)} />
        )}
      </div>
    </div>
  )
}

export default function VolunteerPageClient() {
  return (
    <LanguageProvider>
      <VolunteerApp />
    </LanguageProvider>
  )
}
