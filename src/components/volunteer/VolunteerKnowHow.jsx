'use client'

import { useState } from 'react'
import { Check, ChevronDown, Copy, MapPin, Phone, Shirt } from 'lucide-react'
import { CLINIC } from '@/lib/volunteer/clinic'

const TIPS = {
  en: [
    {
      title: 'Ask the front desk',
      body: 'Laundry is in the back by recovery. Check in at reception first so someone can walk you back.',
    },
    {
      title: 'Mornings work best',
      body: 'Morning around 10 works best since it’s not hot. Come when you can — just say when you’ll arrive.',
    },
    {
      title: 'If you can’t make it',
      body: 'Cancel here as soon as you know. If it’s under 24 hours, call the clinic so they aren’t waiting.',
    },
  ],
  es: [
    {
      title: 'Pregunta en recepción',
      body: 'La lavandería queda atrás, junto a recuperación. Pasa primero por recepción para que te lleven.',
    },
    {
      title: 'Mejor por la mañana',
      body: 'La mañana alrededor de las 10 funciona mejor porque no hace tanto calor. Ven cuando puedas — solo indica a qué hora llegas.',
    },
    {
      title: 'Si no puedes ir',
      body: 'Cancela aquí en cuanto lo sepas. Si faltan menos de 24 horas, llama a la clínica para que no te esperen.',
    },
  ],
}

export default function VolunteerKnowHow({ isSpanish, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const [copied, setCopied] = useState(false)
  const tips = isSpanish ? TIPS.es : TIPS.en

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(CLINIC.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* ignore */
    }
  }

  return (
    <section className="rounded-2xl border border-apl-primary/15 bg-gradient-to-br from-apl-blue-50/80 via-white to-amber-50/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-3.5 py-3 text-left cursor-pointer touch-manipulation"
        aria-expanded={open}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-apl-primary text-white shadow-sm">
          <Shirt className="w-4 h-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-gray-900">
            {isSpanish ? 'Antes de venir' : 'Before you come'}
          </span>
          <span className="block text-xs text-gray-500">
            {isSpanish ? 'Dónde ir y qué esperar' : 'Where to go and what to expect'}
          </span>
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-3.5 pb-3.5 space-y-3 animate-fade-in">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tips.map((tip) => (
              <li key={tip.title} className="rounded-xl bg-white/80 border border-white px-3 py-2.5">
                <p className="text-xs font-semibold text-gray-900">{tip.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{tip.body}</p>
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-3 gap-2">
            <a
              href={`tel:${CLINIC.tel}`}
              className="flex flex-col items-center gap-1 rounded-xl bg-white border border-gray-100 px-2 py-2.5 text-center hover:border-apl-primary/40 transition-colors"
            >
              <Phone className="w-4 h-4 text-apl-primary" />
              <span className="text-[11px] font-semibold text-gray-800">{isSpanish ? 'Llamar' : 'Call'}</span>
              <span className="text-[10px] text-gray-400 leading-tight">{CLINIC.phoneDisplay}</span>
            </a>
            <a
              href={CLINIC.maps}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 rounded-xl bg-white border border-gray-100 px-2 py-2.5 text-center hover:border-apl-primary/40 transition-colors"
            >
              <MapPin className="w-4 h-4 text-apl-orange" />
              <span className="text-[11px] font-semibold text-gray-800">
                {isSpanish ? 'Cómo llegar' : 'Directions'}
              </span>
              <span className="text-[10px] text-gray-400 leading-tight">West Oak St.</span>
            </a>
            <button
              type="button"
              onClick={copyAddress}
              className="flex flex-col items-center gap-1 rounded-xl bg-white border border-gray-100 px-2 py-2.5 text-center hover:border-apl-primary/40 transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-500" />
              )}
              <span className="text-[11px] font-semibold text-gray-800">
                {copied ? (isSpanish ? 'Copiado' : 'Copied') : isSpanish ? 'Dirección' : 'Address'}
              </span>
              <span className="text-[10px] text-gray-400 leading-tight">1409 W Oak</span>
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
