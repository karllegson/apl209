'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, FileText, Heart, HelpCircle, Syringe, Wallet } from 'lucide-react'
import { SectionTitle } from './FormWidgets'

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

export default function StepSubmit({ form, errors, updateField }) {
  const [vaccinesOpen, setVaccinesOpen] = useState(false)
  const [wellnessOpen, setWellnessOpen] = useState(false)
  const [openInfoId, setOpenInfoId] = useState(null)
  const selectedVaccines = form.optional_vaccines || []
  const selectedWellness = form.optional_wellness_services || []

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

  const toggleVaccine = (id) => {
    const next = selectedVaccines.includes(id)
      ? selectedVaccines.filter((x) => x !== id)
      : [...selectedVaccines, id]
    updateField('optional_vaccines', next)
  }

  const toggleWellness = (id) => {
    const next = selectedWellness.includes(id)
      ? selectedWellness.filter((x) => x !== id)
      : [...selectedWellness, id]
    updateField('optional_wellness_services', next)
  }

  useEffect(() => {
    if (!openInfoId) return
    const close = () => setOpenInfoId(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [openInfoId])

  return (
    <div className="space-y-6 min-w-0">
      <SectionTitle>Optional Services &amp; Acknowledgements</SectionTitle>

      {/* Optional Services */}
      <div>
        <label className="form-section-heading block mb-3">
          Would you like any of the following?
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
              <span className="font-medium text-gray-900">Vaccines</span>
              {selectedVaccines.length > 0 && (
                <span className="text-xs text-apl-primary font-medium">
                  ({selectedVaccines.length} selected)
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
              <p className="text-xs text-gray-500 mb-2">Office visit required for vaccines.</p>
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
                          className="inline-flex text-gray-400 hover:text-apl-primary focus:text-apl-primary cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-apl-primary focus-visible:ring-offset-1 p-0.5 border-0 bg-transparent touch-manipulation"
                          title={info}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setOpenInfoId((prev) => (prev === id ? null : id))
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          aria-label="More info"
                          aria-expanded={openInfoId === id}
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                        <span
                          className={`absolute right-0 left-auto sm:left-1/2 sm:right-auto sm:-translate-x-1/2 bottom-full mb-1 z-10 w-[85vw] max-w-[14rem] sm:w-56 px-2.5 py-1.5 text-xs text-white bg-gray-800 rounded shadow-lg cursor-default ${openInfoId === id ? 'block' : 'hidden'}`}
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
              <span className="font-medium text-gray-900">Wellness &amp; other</span>
              {selectedWellness.length > 0 && (
                <span className="text-xs text-apl-primary font-medium">
                  ({selectedWellness.length} selected)
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
                          className="inline-flex text-gray-400 hover:text-apl-primary focus:text-apl-primary cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-apl-primary focus-visible:ring-offset-1 p-0.5 border-0 bg-transparent touch-manipulation"
                          title={info}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setOpenInfoId((prev) => (prev === id ? null : id))
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          aria-label="More info"
                          aria-expanded={openInfoId === id}
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                        <span
                          className={`absolute right-0 left-auto sm:left-1/2 sm:right-auto sm:-translate-x-1/2 bottom-full mb-1 z-10 w-[85vw] max-w-[14rem] sm:w-56 px-2.5 py-1.5 text-xs text-white bg-gray-800 rounded shadow-lg cursor-default ${openInfoId === id ? 'block' : 'hidden'}`}
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

      {/* Deposit required */}
      <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4 md:p-5">
        <div className="flex items-start gap-2 mb-2">
          <Wallet className="w-5 h-5 text-apl-primary shrink-0 mt-[0.1875rem]" aria-hidden />
          <h3 className="form-section-heading text-gray-900 mb-0 leading-tight">Deposit required</h3>
        </div>
        <p className="text-sm font-semibold text-gray-800 mb-1">Deposit: {depositLabel}</p>
        {depositTotal > 0 && (
          <p className="text-sm font-medium text-apl-primary mb-1">Your deposit: ${depositTotal}</p>
        )}
        <p className="text-sm text-gray-600 mb-4">
          Nonrefundable deposits: $50 for dogs, $25 for pet cats. This deposit holds your appointment and is applied to the actual cost of your visit when you come in. If you cancel or reschedule with less than 48 hours before your appointment, you will lose your deposit. Your card will not be charged until we confirm your appointment. Enter your card details below. For your security, we only store the last 4 digits.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4">
          <div>
            <label className="form-field-label block mb-1.5 text-gray-700">Card number (full)</label>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="cc-number"
              value={form.deposit_card_number}
              onChange={(e) => updateField('deposit_card_number', e.target.value.replace(/\D/g, '').slice(0, 19))}
              placeholder="Full card number (no spaces)"
              className={`w-full intake-input px-3 py-2.5 rounded-lg border text-sm transition-all ${
                errors.deposit_card_number ? 'border-red-400 bg-red-50' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-apl-blue focus:border-apl-blue`}
            />
            {errors.deposit_card_number && <p className="text-red-500 text-xs mt-1">{errors.deposit_card_number}</p>}
          </div>
          <div>
            <label className="form-field-label block mb-1.5 text-gray-700">Expiry (MM/YY)</label>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="cc-exp"
              value={form.deposit_card_expiry}
              onChange={(e) => updateField('deposit_card_expiry', e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="MMYY"
              className={`w-full intake-input px-3 py-2.5 rounded-lg border text-sm transition-all ${
                errors.deposit_card_expiry ? 'border-red-400 bg-red-50' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-apl-blue focus:border-apl-blue`}
            />
            {errors.deposit_card_expiry && <p className="text-red-500 text-xs mt-1">{errors.deposit_card_expiry}</p>}
          </div>
          <div>
            <label className="form-field-label block mb-1.5 text-gray-700">CVV</label>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="off"
              value={form.deposit_cvv}
              onChange={(e) => updateField('deposit_cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="3 or 4 digits"
              className="w-full intake-input px-3 py-2.5 rounded-lg border border-gray-300 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-apl-blue focus:border-apl-blue"
            />
          </div>
          <div>
            <label className="form-field-label block mb-1.5 text-gray-700">Billing ZIP code</label>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="postal-code"
              value={form.deposit_billing_zip}
              onChange={(e) => updateField('deposit_billing_zip', e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="ZIP"
              className={`w-full intake-input px-3 py-2.5 rounded-lg border text-sm transition-all ${
                errors.deposit_billing_zip ? 'border-red-400 bg-red-50' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-apl-blue focus:border-apl-blue`}
            />
            {errors.deposit_billing_zip && <p className="text-red-500 text-xs mt-1">{errors.deposit_billing_zip}</p>}
          </div>
        </div>
        <button
          type="button"
          onClick={() => updateField('deposit_acknowledged', !form.deposit_acknowledged)}
          className={`flex items-center gap-3 p-3 rounded-md border-2 w-full text-left transition-all cursor-pointer ${
            errors.deposit_acknowledged ? 'border-red-400 bg-red-50' : form.deposit_acknowledged ? 'border-apl-blue bg-apl-blue-50' : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
            form.deposit_acknowledged ? 'bg-apl-primary border-apl-primary' : 'bg-white border-gray-300'
          }`}>
            {form.deposit_acknowledged && <span className="text-white text-xs font-bold">✓</span>}
          </div>
          <p className="text-sm font-semibold text-gray-800">I understand a deposit is required to hold my appointment. I understand that cancelling or rescheduling with less than 48 hours&apos; notice will result in loss of my deposit, and that my deposit will be applied to the cost of my visit.</p>
        </button>
        {errors.deposit_acknowledged && <p className="text-red-500 text-xs mt-2">{errors.deposit_acknowledged}</p>}
      </div>

      {/* Legal Acknowledgements */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
        <div className="flex items-start gap-2 mb-4">
          <FileText className="w-5 h-5 text-slate-500 shrink-0 mt-[0.1875rem]" />
          <h3 className="form-section-heading text-gray-800 mb-0 leading-tight">
            Please confirm
          </h3>
        </div>

        <div className="space-y-2 text-sm text-gray-700 mb-5">
          <p className="text-gray-600">By submitting, I confirm:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>My information is accurate and complete</li>
            <li>I understand that surgery and anesthesia carry normal risks, and I&apos;ve had a chance to ask questions</li>
            <li>Final pricing may vary (e.g. pregnancy, in heat, weight)</li>
            <li>APL may provide emergency care if needed during the visit</li>
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
            I agree to the above
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
          Signature (type your full name) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.signature}
          onChange={(e) => updateField('signature', e.target.value)}
          placeholder="Type your full legal name"
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
        <p className="text-base font-medium text-gray-700">⚠️ This does not schedule an appointment.</p>
        <p className="text-sm text-gray-500 mt-1">We&apos;ll contact you to confirm.</p>
      </div>
    </div>
  )
}
