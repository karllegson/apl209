'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Scissors, Syringe, Heart, Loader2, ShieldCheck, PawPrint } from 'lucide-react'
import { useLanguage, LanguageToggle } from './LanguageContext'

export const SERVICE_OPTIONS = [
  { id: 'spay_neuter', labelEn: 'Spay & Neuter', labelEs: 'Esterilización y castración', descEn: 'Surgery for dogs and cats', descEs: 'Cirugía para perros y gatos', icon: Scissors },
  { id: 'vaccines', labelEn: 'Vaccines only', labelEs: 'Solo vacunas', descEn: 'Rabies, DAPP, and other vaccines', descEs: 'Rabia, DAPP y otras vacunas', icon: Syringe },
  { id: 'wellness_other', labelEn: 'Wellness / Other', labelEs: 'Bienestar / Otros', descEn: 'Microchip, flea prevention, dewormer, etc.', descEs: 'Microchip, prevención de pulgas, desparasitante, etc.', icon: Heart },
]

const LOADING_DURATION_MS = 1500

const OTHER_SERVICES_NOTE_EN = "If you want other services (e.g. vaccines, microchip), you'll have a chance to select them in the form."
const OTHER_SERVICES_NOTE_ES = 'Si desea otros servicios (p. ej. vacunas, microchip), podrá seleccionarlos en el formulario.'

export default function SelectService({ onSelect, onBack, onLogoClick }) {
  const { language } = useLanguage()
  const isSpanish = language === 'es'
  const [expandedId, setExpandedId] = useState(null)
  const [creatingForLabel, setCreatingForLabel] = useState(null)

  const getServiceLabel = (serviceId) => {
    if (serviceId === 'tnr') return isSpanish ? 'TNR' : 'TNR'
    const opt = SERVICE_OPTIONS.find((o) => o.id === serviceId)
    if (!opt) return serviceId
    return isSpanish ? opt.labelEs : opt.labelEn
  }

  const goToForm = (serviceId) => {
    setCreatingForLabel(getServiceLabel(serviceId))
    setTimeout(() => {
      onSelect(serviceId)
      setCreatingForLabel(null)
    }, LOADING_DURATION_MS)
  }

  const handleServiceClick = (id) => {
    setExpandedId(id)
  }

  const isTnrExpanded = expandedId === 'tnr'

  const TNR_INFO_EN = (
    <>
      <p className="font-medium text-gray-800 text-sm mb-2">TNR — Trap N Release</p>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">
        Mainly for stray cats—community cats, outdoor cats, or cats you care for but don’t own. We sterilize and return them.
      </p>

      <p className="font-semibold text-gray-800 text-xs uppercase tracking-wide mb-1.5">Why outdoor pets are in this category</p>
      <p className="text-gray-600 text-sm leading-relaxed mb-3">
        Outdoor and community cats have heightened senses—more alert to sounds, smells, and unfamiliar people than house pets. In a clinic that can make them very stressed and reactive. We use a separate category so we can use the right handling (traps, minimal contact, calm environment) and protocols.
      </p>
      <ul className="text-sm text-gray-600 space-y-1 mb-4 list-disc list-inside">
        <li><strong>Safer for the cat</strong> — less risk of escape or injury</li>
        <li><strong>Safer for our vet team</strong> — predictable, controlled handling</li>
      </ul>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">Same care, with procedures designed for their needs.</p>

      <p className="font-semibold text-gray-800 text-xs uppercase tracking-wide mb-1.5">Requirements</p>
      <p className="text-gray-600 text-sm leading-relaxed mb-3">
        Cats must arrive in a <strong>humane trap</strong> with weight noted. Traps can be rented from us. You must come in person to sign a waiver.
      </p>

      <p className="font-semibold text-gray-800 text-xs uppercase tracking-wide mb-1.5">What’s included</p>
      <p className="text-gray-600 text-sm">Ear tip, pain injection, antibiotic injection, FVRCP, and rabies. Pricing differs from house-pet surgery.</p>
    </>
  )
  const TNR_INFO_ES = (
    <>
      <p className="font-medium text-gray-800 text-sm mb-2">TNR — Trap N Release</p>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">
        Principalmente para gatos callejeros—gatos comunitarios, de exterior o que usted cuida pero no son suyos. Los esterilizamos y devolvemos.
      </p>

      <p className="font-semibold text-gray-800 text-xs uppercase tracking-wide mb-1.5">Por qué las mascotas exteriores están en esta categoría</p>
      <p className="text-gray-600 text-sm leading-relaxed mb-3">
        Los gatos de exterior y comunitarios tienen los sentidos más agudos: más alerta a sonidos, olores y personas desconocidas que las mascotas de casa. En la clínica eso puede estresarlos mucho y hacerlos más reactivos. Usamos una categoría aparte para aplicar el manejo adecuado (trampas, poco contacto, ambiente tranquilo) y protocolos específicos.
      </p>
      <ul className="text-sm text-gray-600 space-y-1 mb-4 list-disc list-inside">
        <li><strong>Más seguro para el gato</strong> — menos riesgo de escape o lesión</li>
        <li><strong>Más seguro para nuestro equipo</strong> — manejo predecible y controlado</li>
      </ul>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">Mismo cuidado, con procedimientos pensados para ellos.</p>

      <p className="font-semibold text-gray-800 text-xs uppercase tracking-wide mb-1.5">Requisitos</p>
      <p className="text-gray-600 text-sm leading-relaxed mb-3">
        Los gatos deben llegar en <strong>jaula trampa</strong> con el peso anotado. Puede rentar trampa con nosotros. Debe venir en persona a firmar un formato.
      </p>

      <p className="font-semibold text-gray-800 text-xs uppercase tracking-wide mb-1.5">Qué incluye</p>
      <p className="text-gray-600 text-sm">Corte de oreja, inyección para dolor, antibiótico, FVRCP y rabia. El precio es distinto al de mascota de casa.</p>
    </>
  )

  return (
    <div className="space-y-5 md:space-y-8 relative">
      {/* Loading popup when transitioning to form */}
      {creatingForLabel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-live="polite" aria-busy="true">
          <div className="bg-white rounded-xl shadow-xl px-6 py-5 flex flex-col items-center gap-4 min-w-[200px]">
            <Loader2 className="w-10 h-10 text-apl-primary animate-spin shrink-0" aria-hidden />
            <p className="text-sm font-medium text-gray-800 text-center">
              {isSpanish ? 'Creando formulario para ' : 'Creating form for '}
              <span className="text-apl-primary">{creatingForLabel}</span>
              …
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-apl-blue transition-colors cursor-pointer"
        >
          ← Back
        </button>
        <LanguageToggle />
      </div>

      {onLogoClick ? (
        <button type="button" onClick={onLogoClick} className="flex justify-center mb-2 w-full cursor-pointer">
          <Image src="/logo.png" alt="Animal Protection League" width={140} height={140} className="h-14 md:h-16 w-auto object-contain" />
        </button>
      ) : (
        <Link href="/book" className="flex justify-center mb-2 block">
          <Image src="/logo.png" alt="Animal Protection League" width={140} height={140} className="h-14 md:h-16 w-auto object-contain" />
        </Link>
      )}

      <div className="text-center space-y-2">
        <h1 className="form-page-title text-xl md:text-2xl">
          {isSpanish ? '¿Qué servicio necesita?' : 'What service do you need?'}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {isSpanish ? 'Seleccione uno para continuar con el formulario.' : 'Select one to continue with the intake form.'}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {SERVICE_OPTIONS.map((opt) => {
          const Icon = opt.icon
          const label = isSpanish ? opt.labelEs : opt.labelEn
          const desc = isSpanish ? opt.descEs : opt.descEn
          const isExpanded = expandedId === opt.id
          return (
            <div key={opt.id} className={`rounded-xl border-2 overflow-hidden bg-white shadow-sm ${isExpanded ? 'border-apl-primary' : 'border-gray-200 hover:border-apl-primary'}`}>
              <button
                type="button"
                onClick={() => handleServiceClick(opt.id)}
                className={`w-full text-left flex items-center gap-4 p-4 md:p-5 transition-all cursor-pointer hover:bg-apl-primary/5 ${isExpanded ? 'border-b border-gray-200 bg-apl-primary/5' : ''}`}
              >
                <span className="flex shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-apl-primary/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 md:w-7 md:h-7 text-apl-primary" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900">{label}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                </div>
              </button>
              {isExpanded && (
                <div className="px-3 md:px-4 pb-3 md:pb-4 pt-2.5 bg-gray-100/80 border-t border-gray-200">
                  {opt.id === 'spay_neuter' ? (
                    <div className="flex items-start gap-2 mb-3">
                      <ShieldCheck className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                      <div className="text-xs md:text-sm text-gray-600">
                        {isSpanish ? (
                          <>
                            <p className="font-medium mb-0.5 text-gray-700 text-xs md:text-sm">Requisito de rabia</p>
                            <p className="leading-snug">Su mascota debe tener la vacuna contra la rabia al día (dentro del último año). Debe traer comprobante o certificado de vacunación a la clínica el día de la cita.</p>
                            <p className="mt-1.5 text-gray-500">Si no tiene la vacuna contra la rabia al día, puede recibirla en la clínica. <span className="text-gray-400 text-xs">($20)</span></p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium mb-0.5 text-gray-700 text-xs md:text-sm">Rabies requirement</p>
                            <p className="leading-snug">Your pet must have a current rabies vaccine (within 1 year). You must bring proof or certificate of vaccination to the clinic on the day of the appointment.</p>
                            <p className="mt-1.5 text-gray-500">If you don&apos;t have a current rabies vaccine, you can get it at the clinic. <span className="text-gray-400 text-xs">($20)</span></p>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs md:text-sm text-gray-600 leading-snug mb-3">
                      {isSpanish ? 'Continuará al formulario de admisión con esta opción como servicio principal.' : 'You\'ll continue to the intake form with this as your main service.'}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 leading-snug mb-3">
                    {isSpanish ? OTHER_SERVICES_NOTE_ES : OTHER_SERVICES_NOTE_EN}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedId(null)}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 font-medium text-xs hover:bg-gray-50"
                    >
                      {isSpanish ? 'Cerrar' : 'Close'}
                    </button>
                    <button
                      type="button"
                      onClick={() => goToForm(opt.id)}
                      className="px-4 py-1.5 rounded-lg bg-apl-primary hover:bg-apl-blue-dark text-white font-semibold text-xs"
                    >
                      {isSpanish ? 'Continuar' : 'Proceed'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* TNR / Outdoor — separate category button */}
      <div className={`rounded-xl border-2 overflow-hidden bg-white shadow-sm ${isTnrExpanded ? 'border-apl-primary' : 'border-gray-200 hover:border-apl-primary'}`}>
        <button
          type="button"
          onClick={() => handleServiceClick(isTnrExpanded ? null : 'tnr')}
          className={`w-full text-left flex items-center gap-4 p-4 md:p-5 transition-all cursor-pointer hover:bg-apl-primary/5 ${isTnrExpanded ? 'border-b border-gray-200 bg-apl-primary/5' : ''}`}
        >
          <span className="flex shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-violet-100 flex items-center justify-center">
            <PawPrint className="w-6 h-6 md:w-7 md:h-7 text-violet-700" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900">
              {isSpanish ? '¿No es su mascota?' : 'Not your pet?'}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              {isSpanish ? 'TNR — principalmente gatos callejeros' : 'TNR — mainly for stray cats'}
            </p>
          </div>
        </button>
        {isTnrExpanded && (
          <div className="px-3 md:px-4 pb-3 md:pb-4 pt-2.5 bg-gray-100/80 border-t border-gray-200">
            <div className="flex items-start gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
              <div className="text-xs md:text-sm text-gray-600">
                {isSpanish ? TNR_INFO_ES : TNR_INFO_EN}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setExpandedId(null)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 font-medium text-xs hover:bg-gray-50"
              >
                {isSpanish ? 'Cerrar' : 'Close'}
              </button>
              <button
                type="button"
                onClick={() => goToForm('tnr')}
                className="px-4 py-1.5 rounded-lg bg-apl-primary hover:bg-apl-blue-dark text-white font-semibold text-xs"
              >
                {isSpanish ? 'Continuar' : 'Proceed'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
