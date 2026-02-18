'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, ChevronUp, FileText, Heart, HelpCircle, Syringe, Wallet } from 'lucide-react'
import { SectionTitle } from './FormWidgets'
import { useLanguage } from './LanguageContext'

const VACCINE_OPTIONS = [
  { id: 'office_visit', label: 'Office visit', price: '$10', animal: null, info: 'Required before any vaccine can be given.' },
  { id: 'canine_bordetella', label: 'Canine — Bordetella intranasal', price: '$20', animal: 'dogs', info: 'Helps protect against kennel cough (Bordetella). Often required for boarding or daycare.' },
  { id: 'canine_leptospirosis', label: 'Canine — Leptospirosis', price: '$25', animal: 'dogs', info: 'Protects against bacteria spread through water and soil. Recommended for dogs who go outdoors.' },
  { id: 'canine_dapp', label: 'Canine — DAPP', price: '$15', animal: 'dogs', info: 'Core vaccine: distemper, adenovirus, parvo, parainfluenza. Often called DHPP or DA2PP.' },
  { id: 'canine_rabies', label: 'Canine — Rabies 1 yr / 3 yr', price: '$20', animal: 'dogs', info: 'Required by law. 1-year or 3-year option depending on vaccine type and local rules.' },
  { id: 'feline_hcp', label: 'Feline — HCP', price: '$15', animal: 'cats', info: 'Core vaccine: feline distemper (panleukopenia), calicivirus, rhinotracheitis. Often called FVRCP.' },
  { id: 'feline_leukemia', label: 'Feline — Leukemia', price: '$25', animal: 'cats', info: 'Recommended for cats who go outdoors or live with FeLV-positive cats.' },
  { id: 'feline_felv_fiv_test', label: 'Feline — FeLV/FIV test', price: '$30', animal: 'cats', info: 'Blood test for feline leukemia virus and feline immunodeficiency virus.' },
  { id: 'feline_rabies', label: 'Feline — Rabies 1 yr', price: '$20', animal: 'cats', info: 'Required by law for cats. 1-year vaccine.' },
]

// Nonrefundable deposits: $50 dogs, $25 pet cats, $50 TNR
const DEPOSIT_DOG = 50
const DEPOSIT_PET_CAT = 25
const DEPOSIT_TNR = 50

const WELLNESS_OPTIONS = [
  { id: 'microchip', label: 'Microchipping', price: '$8', animal: null, info: 'Permanent ID implanted under the skin. Helps reunite lost pets with owners.' },
  { id: 'nail_trim', label: 'Nail Trim', price: '—', animal: null, info: 'Quick nail trim to keep paws healthy and prevent overgrowth.' },
  { id: 'flea_selarid_feline', label: 'Selarid feline topical flea prevention', price: '$15', animal: 'cats', info: 'Topical treatment applied to the skin. Prevents fleas and ticks on cats.' },
  { id: 'flea_para_defense_k9', label: 'Para-Defense K9 topical flea prevention', price: '$15', animal: 'dogs', info: 'Topical treatment applied to the skin. Prevents fleas and ticks on dogs.' },
  { id: 'dewormer_k9_6_25', label: 'K9 dewormer Vibrantal 6–25 lbs', price: '$10', animal: 'dogs', info: 'Deworming for dogs 6–25 lbs. Treats common intestinal parasites.' },
  { id: 'dewormer_k9_25_100', label: 'K9 dewormer Vibrantal 25.1–100 lbs', price: '$20', animal: 'dogs', info: 'Deworming for dogs 25.1–100 lbs. Treats common intestinal parasites.' },
  { id: 'dewormer_feline_praziquantel', label: 'Feline dewormer Praziquantel injectable', price: '$15', animal: 'cats', info: 'Injectable dewormer for cats. Treats tapeworms and other parasites.' },
  { id: 'dewormer_small_pyrantel', label: 'K9/feline 5.9 lbs and under dewormer Pyrantel pomoate', price: '$8', animal: null, info: 'Liquid dewormer for very small dogs and cats (5.9 lbs and under).' },
]

const ALL_INFO_OPTIONS = [...VACCINE_OPTIONS, ...WELLNESS_OPTIONS]

export default function StepSubmit({ form, errors, updateField }) {
  const { language } = useLanguage()
  const isSpanish = language === 'es'
  const [vaccinesOpen, setVaccinesOpen] = useState(false)
  const [wellnessOpen, setWellnessOpen] = useState(false)
  const [openInfoId, setOpenInfoId] = useState(null)
  const selectedVaccines = form.optional_vaccines || []
  const selectedWellness = form.optional_wellness_services || []

  // Close info popup when clicking anywhere outside the trigger button or popup
  useEffect(() => {
    if (openInfoId == null) return
    const closeOnClickOutside = (e) => {
      if (!e.target.closest('[data-info-trigger], [data-info-popup]')) setOpenInfoId(null)
    }
    document.addEventListener('mousedown', closeOnClickOutside)
    return () => document.removeEventListener('mousedown', closeOnClickOutside)
  }, [openInfoId])

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const openInfoOption = openInfoId ? ALL_INFO_OPTIONS.find((o) => o.id === openInfoId) : null

  const pets = form.pets || []
  const isTNR = form.requested_service === 'tnr'
  const dogCount = pets.filter((p) => p.type === 'dog').length
  const catCount = pets.filter((p) => p.type === 'cat').length
  const depositTotal = isTNR
    ? (dogCount + catCount) * DEPOSIT_TNR
    : dogCount * DEPOSIT_DOG + catCount * DEPOSIT_PET_CAT
  const depositLabel = isTNR
    ? `TNR: $${DEPOSIT_TNR} per cat`
    : dogCount > 0 && catCount > 0
      ? `Dogs: $${DEPOSIT_DOG}, Pet cats: $${DEPOSIT_PET_CAT}`
      : dogCount > 0
        ? `$${DEPOSIT_DOG} (dog)`
        : catCount > 0
          ? `$${DEPOSIT_PET_CAT} (pet cat)`
          : `Dogs: $${DEPOSIT_DOG}, Pet cats: $${DEPOSIT_PET_CAT}. TNR: $${DEPOSIT_TNR}.`

  const showDepositWarning = form.requested_service === 'spay_neuter' || form.requested_service === 'tnr'

  const toggleVaccine = (id) => {
    const isRemoving = selectedVaccines.includes(id)
    let next = isRemoving
      ? selectedVaccines.filter((x) => x !== id)
      : [...selectedVaccines, id]
    // Office visit is required when taking any vaccine: auto-include when adding a vaccine, prevent removing if others selected
    if (id === 'office_visit' && isRemoving && next.length > 0) next = selectedVaccines // keep office_visit when other vaccines selected
    if (id !== 'office_visit' && !isRemoving && !next.includes('office_visit')) next = ['office_visit', ...next]
    updateField('optional_vaccines', next)
  }
  const toggleWellness = (id) => {
    const next = selectedWellness.includes(id)
      ? selectedWellness.filter((x) => x !== id)
      : [...selectedWellness, id]
    updateField('optional_wellness_services', next)
  }

  const t = {
    en: {
      sectionTitle: 'Optional Services & Acknowledgements',
      wouldYouLike: 'Would you like any of the following?',
      vaccines: 'Vaccines',
      wellnessOther: 'Wellness & other',
      selected: 'selected',
      officeVisitRequired: 'Office visit required for vaccines.',
      moreInfo: 'More info',
      depositRequired: 'Deposit required',
      deposit: 'Deposit',
      yourDeposit: 'Your deposit',
      depositParagraph: 'We will ask for your deposit when we call to confirm your appointment. We are not collecting payment in this form.',
      depositNote: 'Enter only the last 4 digits of your card below. We will call you during the confirmation call to collect the full card number and security code (CVV) for the deposit.',
      last4: 'Last 4 digits of card',
      expiry: 'Expiry (MM/YY)',
      billingZip: 'Billing ZIP code',
      cvvReady: 'Have your security code (CVV) ready for the confirmation call—we don\'t collect or store it online.',
      depositAck: 'I understand a deposit is required to hold my appointment. I understand that cancelling or rescheduling with less than 48 hours\' notice will result in loss of my deposit, and that my deposit will be applied to the cost of my visit.',
      pleaseConfirm: 'Please confirm',
      bySubmitting: 'By submitting, I confirm:',
      infoAccurate: 'My information is accurate',
      pricingVary: 'Final pricing may vary (e.g. pregnancy, in heat, weight)',
      iAgree: 'I agree to the above',
      signatureLabel: 'Signature (type your full name)',
      signaturePlaceholder: 'Type your full legal name',
      notSchedule: 'This does not schedule an appointment.',
      weContact: 'We\'ll contact you to confirm.',
    },
    es: {
      sectionTitle: 'Servicios opcionales y reconocimientos',
      wouldYouLike: '¿Le gustaría alguno de los siguientes?',
      vaccines: 'Vacunas',
      wellnessOther: 'Bienestar y otro',
      selected: 'seleccionado(s)',
      officeVisitRequired: 'Se requiere visita al consultorio para vacunas.',
      moreInfo: 'Más información',
      depositRequired: 'Depósito requerido',
      deposit: 'Depósito',
      yourDeposit: 'Su depósito',
      depositParagraph: 'Le pediremos el depósito cuando le llamemos para confirmar su cita. No estamos cobrando en este formulario.',
      depositNote: 'Solo capture los últimos 4 dígitos de su tarjeta. En la llamada de confirmación le pediremos el número completo y el CVV para cobrar el depósito.',
      last4: 'Últimos 4 dígitos de la tarjeta',
      expiry: 'Vencimiento (MM/AA)',
      billingZip: 'Código postal de facturación',
      cvvReady: 'Tenga a la mano su código de seguridad (CVV) para la llamada de confirmación; no lo capturamos ni lo guardamos en línea.',
      depositAck: 'Entiendo que necesito dar un depósito para que me reserven la cita. Entiendo que si cancelo o reprogramo con menos de 48 horas de aviso pierdo el depósito, y que ese depósito se me descuenta del costo de la consulta.',
      pleaseConfirm: 'Por favor confirme',
      bySubmitting: 'Al enviar, confirmo:',
      infoAccurate: 'Mi información es correcta',
      pricingVary: 'El precio final puede variar (ej. embarazo, en celo, peso)',
      iAgree: 'Estoy de acuerdo con lo anterior',
      signatureLabel: 'Firma (escriba su nombre completo)',
      signaturePlaceholder: 'Escriba su nombre completo (tal como aparece en su INE)',
      notSchedule: 'Esto no agenda una cita.',
      weContact: 'Le llamaremos para confirmar.',
    },
  }
  const L = t[language] || t.en

  return (
    <div className="space-y-6 min-w-0">
      {/* Mobile: fixed overlay so info isn't clipped inside the dropdown */}
      {typeof document !== 'undefined' &&
        isMobile &&
        openInfoOption &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 sm:hidden"
            data-info-popup
            onClick={() => setOpenInfoId(null)}
            onKeyDown={(e) => e.key === 'Escape' && setOpenInfoId(null)}
            role="dialog"
            aria-modal="true"
            aria-label={openInfoOption.label}
          >
            <div
              className="max-h-[80vh] w-full max-w-sm overflow-auto rounded-xl bg-gray-800 px-4 py-4 text-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-medium text-sm text-gray-200">{openInfoOption.label}</p>
              <p className="mt-2 text-sm leading-relaxed">{openInfoOption.info}</p>
            </div>
          </div>,
          document.body
        )}

      <SectionTitle>{L.sectionTitle}</SectionTitle>

      {/* Optional Services */}
      <div>
        <label className="form-section-heading block mb-3">
          {L.wouldYouLike}
        </label>

        {/* Vaccines dropdown */}
        <div className="rounded-lg border border-gray-300 overflow-hidden mb-3">
          <button
            type="button"
            onClick={() => setVaccinesOpen(!vaccinesOpen)}
            className="w-full flex items-center justify-between gap-2 p-3 md:p-4 bg-white hover:bg-gray-50 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Syringe className="w-5 h-5 text-apl-primary shrink-0" />
              <span className="font-medium text-gray-900">{L.vaccines}</span>
              {selectedVaccines.length > 0 && (
                <span className="text-xs text-apl-primary font-medium">
                  ({selectedVaccines.length} {L.selected})
                </span>
              )}
            </div>
            {vaccinesOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-500 shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500 shrink-0" />
            )}
          </button>
          {vaccinesOpen && (
            <div className="border-t border-gray-200 bg-gray-50/50 p-3 md:p-4 space-y-1">
              {VACCINE_OPTIONS.map(({ id, label, price, animal, info }, index) => (
                <label
                  key={id}
                  className={`flex items-center gap-2 sm:gap-3 p-2.5 rounded-md cursor-pointer min-w-0 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-gray-100/80'} hover:opacity-90`}
                >
                  <input
                    type="checkbox"
                    checked={selectedVaccines.includes(id)}
                    onChange={() => toggleVaccine(id)}
                    className="w-4 h-4 rounded border-gray-300 text-apl-primary focus:ring-apl-blue shrink-0"
                  />
                  <span className="text-sm text-gray-800 flex-1 flex items-center gap-1.5 min-w-0">
                    {label}
                    {animal && <span className="text-xs text-gray-400 font-normal">({animal})</span>}
                    {info && (
                      <span className="relative inline-flex group/info shrink-0">
                        <button
                          type="button"
                          data-info-trigger
                          className="inline-flex text-gray-400 hover:text-apl-primary focus:text-apl-primary cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-apl-primary focus-visible:ring-offset-1 p-0.5 border-0 bg-transparent touch-manipulation"
                          title={info}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setOpenInfoId((prev) => (prev === id ? null : id))
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          aria-label={L.moreInfo}
                          aria-expanded={openInfoId === id}
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                        <span
                          data-info-popup
                          className={`absolute right-0 left-auto sm:left-1/2 sm:right-auto sm:-translate-x-1/2 bottom-full mb-1 z-10 w-[85vw] max-w-[14rem] sm:w-56 px-2.5 py-1.5 text-xs text-white bg-gray-800 rounded shadow-lg cursor-default ${openInfoId === id ? 'block max-sm:hidden' : 'hidden'}`}
                          onClick={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                          role="tooltip"
                        >
                          {info}
                        </span>
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-gray-500 shrink-0">{price}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Wellness & other services dropdown (microchip, flea, dewormers, etc.) */}
        <div className="rounded-lg border border-gray-300 overflow-hidden">
          <button
            type="button"
            onClick={() => setWellnessOpen(!wellnessOpen)}
            className="w-full flex items-center justify-between gap-2 p-3 md:p-4 bg-white hover:bg-gray-50 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-apl-primary shrink-0" />
              <span className="font-medium text-gray-900">{L.wellnessOther}</span>
              {selectedWellness.length > 0 && (
                <span className="text-xs text-apl-primary font-medium">
                  ({selectedWellness.length} {L.selected})
                </span>
              )}
            </div>
            {wellnessOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-500 shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500 shrink-0" />
            )}
          </button>
          {wellnessOpen && (
            <div className="border-t border-gray-200 bg-gray-50/50 p-3 md:p-4 space-y-1">
              <p className="text-xs text-gray-500 mb-2">Microchip, flea prevention, dewormer, nail trim, and more.</p>
              {WELLNESS_OPTIONS.map(({ id, label, price, animal, info }, index) => (
                <label
                  key={id}
                  className={`flex items-center gap-2 sm:gap-3 p-2.5 rounded-md cursor-pointer min-w-0 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-gray-100/80'} hover:opacity-90`}
                >
                  <input
                    type="checkbox"
                    checked={selectedWellness.includes(id)}
                    onChange={() => toggleWellness(id)}
                    className="w-4 h-4 rounded border-gray-300 text-apl-primary focus:ring-apl-blue shrink-0"
                  />
                  <span className="text-sm text-gray-800 flex-1 flex items-center gap-1.5 min-w-0">
                    {label}
                    {animal && <span className="text-xs text-gray-400 font-normal">({animal})</span>}
                    {info && (
                      <span className="relative inline-flex group/info shrink-0">
                        <button
                          type="button"
                          data-info-trigger
                          className="inline-flex text-gray-400 hover:text-apl-primary focus:text-apl-primary cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-apl-primary focus-visible:ring-offset-1 p-0.5 border-0 bg-transparent touch-manipulation"
                          title={info}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setOpenInfoId((prev) => (prev === id ? null : id))
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          aria-label={L.moreInfo}
                          aria-expanded={openInfoId === id}
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                        <span
                          data-info-popup
                          className={`absolute right-0 left-auto sm:left-1/2 sm:right-auto sm:-translate-x-1/2 bottom-full mb-1 z-10 w-[85vw] max-w-[14rem] sm:w-56 px-2.5 py-1.5 text-xs text-white bg-gray-800 rounded shadow-lg cursor-default ${openInfoId === id ? 'block max-sm:hidden' : 'hidden'}`}
                          onClick={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                          role="tooltip"
                        >
                          {info}
                        </span>
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-gray-500 shrink-0">{price}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Deposit warning (spay/neuter only — no card intake) */}
      {showDepositWarning && (
        <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4 md:p-5">
          <div className="flex items-start gap-2 mb-2">
            <Wallet className="w-5 h-5 text-apl-primary shrink-0 mt-[0.1875rem]" aria-hidden />
            <h3 className="form-section-heading text-gray-900 mb-0 leading-tight">{L.depositRequired}</h3>
          </div>
          <p className="text-sm text-gray-600">
            {L.depositParagraph}
          </p>
          <p className="text-xs text-gray-500 mt-2">{depositLabel}</p>
        </div>
      )}

      {/* Legal Acknowledgements */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
        <div className="flex items-start gap-2 mb-4">
          <FileText className="w-5 h-5 text-slate-500 shrink-0 mt-[0.1875rem]" />
          <h3 className="form-section-heading text-gray-800 mb-0 leading-tight">
            {L.pleaseConfirm}
          </h3>
        </div>

        <div className="space-y-2 text-sm text-gray-700 mb-5">
          <p className="text-gray-600">{L.bySubmitting}</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>{L.infoAccurate}</li>
            <li>{L.pricingVary}</li>
          </ul>
        </div>

        <button
          type="button"
          onClick={() =>
            updateField('legal_acknowledged', !form.legal_acknowledged)
          }
          className={`flex items-center gap-3 p-4 rounded-lg border-2 w-full text-left transition-all cursor-pointer ${
            errors.legal_acknowledged
              ? 'border-red-400 bg-red-50'
              : form.legal_acknowledged
                ? 'border-apl-blue bg-apl-blue-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
              form.legal_acknowledged
                ? 'bg-apl-primary border-apl-primary'
                : 'bg-white border-gray-300'
            }`}
          >
            {form.legal_acknowledged && (
              <span className="text-white text-xs font-bold">✓</span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-800">
            {L.iAgree}
          </p>
        </button>
        {errors.legal_acknowledged && (
          <p className="text-red-500 text-xs mt-2">
            {errors.legal_acknowledged}
          </p>
        )}
      </div>

      {/* Signature */}
      <div>
        <label className="form-field-label block mb-2 md:mb-2.5 text-gray-700">
          {L.signatureLabel} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.signature}
          onChange={(e) => updateField('signature', e.target.value)}
          placeholder={L.signaturePlaceholder}
          className={`w-full intake-input px-3 md:px-4 py-2.5 md:py-3.5 rounded-lg border text-base md:text-lg transition-all ${
            errors.signature ? 'border-red-400 bg-red-50' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-apl-blue focus:border-apl-blue`}
        />
        {errors.signature && (
          <p className="text-red-500 text-xs mt-1">{errors.signature}</p>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
        <p className="text-base font-medium text-gray-700">⚠️ {L.notSchedule}</p>
        <p className="text-sm text-gray-500 mt-1">{L.weContact}</p>
      </div>
    </div>
  )
}
