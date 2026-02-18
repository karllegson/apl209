'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function StandbyRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/admin/attempted')
  }, [router])
  return (
    <div className="flex min-h-screen bg-slate-50 items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-300 border-t-apl-blue rounded-full animate-spin" />
    </div>
  )
}
