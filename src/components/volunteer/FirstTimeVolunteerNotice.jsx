'use client'

import { Phone } from 'lucide-react'
import { LAUNDRY_COORDINATOR } from '@/lib/volunteer/clinic'

export default function FirstTimeVolunteerPopup({ isSpanish, onContinue }) {
  const hours = isSpanish ? LAUNDRY_COORDINATOR.hoursDisplay.es : LAUNDRY_COORDINATOR.hoursDisplay.en

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-apl-blue-50 border border-apl-primary/25 px-3.5 py-3.5 space-y-2">
        <p className="text-sm font-semibold text-gray-900">{isSpanish ? '¿Primera vez?' : 'First time?'}</p>
        <p className="text-xs text-gray-600 leading-relaxed">
          {isSpanish
            ? 'Llámame o mándame mensaje antes de tu primer día — te acompaño para mostrarte todo.'
            : 'Call or text me before your first day — I’ll meet you to show you everything.'}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <a
            href={`tel:${LAUNDRY_COORDINATOR.tel}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-apl-primary/20 px-3 py-2 text-sm font-semibold text-apl-primary hover:border-apl-primary/40 transition-colors"
          >
            <Phone className="w-4 h-4" />
            {LAUNDRY_COORDINATOR.phoneDisplay}
          </a>
          <span className="text-[11px] text-gray-500">
            {isSpanish ? 'Disponible' : 'Available'} · {hours}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onContinue}
        className="w-full min-h-[44px] py-2.5 bg-apl-primary text-white font-medium rounded-xl hover:bg-apl-blue-dark cursor-pointer text-sm touch-manipulation"
      >
        {isSpanish ? 'Entendido' : 'Got it'}
      </button>
    </div>
  )
}
