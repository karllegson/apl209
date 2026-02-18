 'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Loader2, Save } from 'lucide-react'
import StepOwner from './StepOwner'
import StepPets from './StepPets'
import StepHealth from './StepHealth'
import StepVaccination from './StepVaccination'
import StepSubmit from './StepSubmit'
import StepSummary from './StepSummary'
import { useLanguage, LanguageToggle } from './LanguageContext'

function createEmptyPet() {
  return {
    pet_name: '',
    type: '',
    breed: '',
    color: '',
    age: '',
    weight: '',
    sex: '',
    pet_ownership: '',
    how_long_owned: '',
    testicles_descended: '',
    in_heat_or_pregnant: '',
    last_heat_pregnancy_date: '',
    currently_sick_injured: null,
    medical_conditions: [],
    medical_conditions_other: '',
    previous_surgeries: null,
    previous_surgeries_details: '',
    drug_vaccine_reactions: null,
    drug_vaccine_reactions_details: '',
    current_medications: null,
    current_medications_details: '',
    rabies_vaccinated: '',
    rabies_within_1_3_years: '',
    exposed_to_diseases: null,
    has_fleas_ticks: null,
    vet_behavior: '',
  }
}

const defaultForm = {
  requested_service: '',
  is_returning_customer: null,
  owner_first_name: '',
  owner_last_name: '',
  owner_phone: '',
  owner_email: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  preferred_contact: '',
  street_address: '',
  city: '',
  state: '',
  zip_code: '',
  how_heard: '',
  num_pets: 1,
  pets: [createEmptyPet()],
  wants_microchip: false,
  wants_nail_trim: false,
  wants_flea_treatment: false,
  optional_vaccines: [],
  optional_wellness_services: [],
  deposit_acknowledged: false,
  deposit_card_number: '',
  deposit_card_expiry: '',
  deposit_cvv: '',
  deposit_billing_zip: '',
  legal_acknowledged: false,
  signature: '',
}

function mergeForm(initial) {
  if (!initial || typeof initial !== 'object') return defaultForm
  const merged = { ...defaultForm, ...initial }
  if (initial.owner_name && !initial.owner_first_name && !initial.owner_last_name) {
    const parts = String(initial.owner_name).trim().split(/\s+/)
    merged.owner_first_name = parts[0] || ''
    merged.owner_last_name = parts.slice(1).join(' ') || ''
  }
  if (Array.isArray(initial.pets) && initial.pets.length > 0) {
    merged.pets = initial.pets.map((p) => ({ ...createEmptyPet(), ...p }))
    merged.num_pets = Math.max(1, merged.pets.length)
  }
  // Backfill optional_wellness_services from legacy booleans when resuming a draft
  if (!Array.isArray(merged.optional_wellness_services) || merged.optional_wellness_services.length === 0) {
    const fromLegacy = []
    if (merged.wants_microchip) fromLegacy.push('microchip')
    if (merged.wants_nail_trim) fromLegacy.push('nail_trim')
    if (merged.wants_flea_treatment) fromLegacy.push('flea_selarid_feline') // or flea_para_defense_k9; pick one for display
    if (fromLegacy.length) merged.optional_wellness_services = fromLegacy
  }
  return merged
}

export default function IntakeForm({ initialForm, initialStep = 1, onBackToHome, onLogoClick }) {
  const router = useRouter()
  const { language } = useLanguage()
  const isSpanish = language === 'es'

  const [form, setForm] = useState(() => mergeForm(initialForm))
  const isShortFlow = form.requested_service === 'vaccines' || form.requested_service === 'wellness_other'
  const maxStep = isShortFlow ? 4 : 6
  const STEPS = isShortFlow
    ? (isSpanish ? ['Preferencias', 'Mascota', 'Revisión', 'Resumen'] : ['Preferences', 'Pet Info', 'Review', 'Summary'])
    : (isSpanish ? ['Preferencias', 'Mascota', 'Historial médico', 'Vacunación', 'Revisión', 'Resumen'] : ['Preferences', 'Pet Info', 'Medical History', 'Vaccination', 'Review', 'Summary'])
  const [step, setStep] = useState(() => {
    const s = initialStep >= 1 && initialStep <= 6 ? initialStep : 1
    const short = initialForm?.requested_service === 'vaccines' || initialForm?.requested_service === 'wellness_other'
    return short && s > 4 ? 4 : Math.min(s, short ? 4 : 6)
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState(null)

  useEffect(() => {
    if (isShortFlow && step > 4) setStep(4)
  }, [isShortFlow, step])

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }))
  }

  const updatePet = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      pets: prev.pets.map((pet, i) =>
        i === index ? { ...pet, [field]: value } : pet
      ),
    }))
    const errorKey = `pet_${index}_${field}`
    if (errors[errorKey]) setErrors((prev) => ({ ...prev, [errorKey]: null }))
  }

  const handleNumPetsChange = (num) => {
    const currentPets = [...form.pets]
    while (currentPets.length < num) currentPets.push(createEmptyPet())
    while (currentPets.length > num) currentPets.pop()
    setForm((prev) => ({ ...prev, num_pets: num, pets: currentPets }))
  }

  /* ── validation ── */
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

  const validateStep = (stepNum) => {
    if (devMode) return true

    const e = {}

    if (stepNum === 1) {
      if (form.is_returning_customer === null)
        e.is_returning_customer = 'Please select'
      if (!form.owner_first_name?.trim()) e.owner_first_name = 'Required'
      if (!form.owner_last_name?.trim()) e.owner_last_name = 'Required'
      if (!form.owner_phone.trim()) e.owner_phone = 'Required'
      if (!form.owner_email.trim()) e.owner_email = 'Required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.owner_email))
        e.owner_email = 'Invalid email'
      if (!form.street_address?.trim()) e.street_address = 'Required'
      if (!form.city.trim()) e.city = 'Required'
      if (!form.state?.trim()) e.state = 'Required'
      if (!form.zip_code?.trim()) e.zip_code = 'Required'
    }

    if (stepNum === 2) {
      const short = form.requested_service === 'vaccines' || form.requested_service === 'wellness_other'
      form.pets.forEach((pet, i) => {
        if (!pet.type) e[`pet_${i}_type`] = 'Select dog or cat'
        if (!pet.breed.trim()) e[`pet_${i}_breed`] = 'Required'
        if (!pet.age.trim()) e[`pet_${i}_age`] = 'Required'
        if (short) return
        const weightOk = pet.weight === 'unsure' || (pet.weight && String(pet.weight).trim())
        if (!weightOk) e[`pet_${i}_weight`] = 'Required'
        if (!pet.pet_ownership) e[`pet_${i}_pet_ownership`] = 'Required'
        if (!pet.sex) e[`pet_${i}_sex`] = 'Required'
        if (pet.sex === 'male' && !pet.testicles_descended)
          e[`pet_${i}_testicles_descended`] = 'Required'
        if (pet.sex === 'female' && !pet.in_heat_or_pregnant)
          e[`pet_${i}_in_heat_or_pregnant`] = 'Required'
      })
    }

    if (stepNum === 3 && !isShortFlow) {
      form.pets.forEach((pet, i) => {
        if (pet.currently_sick_injured === null)
          e[`pet_${i}_currently_sick_injured`] = 'Required'
      })
    }

    if (stepNum === 4 && !isShortFlow) {
      form.pets.forEach((pet, i) => {
        if (!pet.rabies_vaccinated)
          e[`pet_${i}_rabies_vaccinated`] = 'Required'
        if (pet.has_fleas_ticks === null)
          e[`pet_${i}_has_fleas_ticks`] = 'Required'
        if (!pet.vet_behavior) e[`pet_${i}_vet_behavior`] = 'Required'
      })
    }

    const submitStepNum = isShortFlow ? 3 : 5
    if (stepNum === submitStepNum) {
      if (!form.deposit_acknowledged)
        e.deposit_acknowledged = 'You must acknowledge the deposit requirement'
      const cardDigits = (form.deposit_card_number || '').replace(/\D/g, '')
      if (cardDigits.length < 13 || cardDigits.length > 19) e.deposit_card_number = 'Enter your full card number (13–19 digits)'
      if (!(form.deposit_card_expiry || '').trim()) e.deposit_card_expiry = 'Expiry is required'
      if (!(form.deposit_billing_zip || '').trim()) e.deposit_billing_zip = 'Billing ZIP is required'
      if (!form.legal_acknowledged)
        e.legal_acknowledged = 'You must accept to continue'
      if (!form.signature.trim()) e.signature = 'Signature is required'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, maxStep))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    if (!validateStep(isShortFlow ? 3 : 5)) return
    setIsSubmitting(true)
    try {
      const { deposit_card_number, deposit_cvv, ...rest } = form
      const payload = {
        ...rest,
        owner_name: [form.owner_first_name, form.owner_last_name].map((s) => s?.trim()).filter(Boolean).join(' ') || '',
        deposit_card_last4: (deposit_card_number || '').replace(/\D/g, '').slice(-4) || null,
      }
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Submission failed. Please try again.')
      }
      const data = await res.json()
      router.push(`/book/confirmation?id=${data.appointment.id}`)
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSave = async () => {
    const email = form.owner_email?.trim()
    const phone = form.owner_phone?.trim()
    if (!email && !phone) {
      setErrors({ save: 'Enter your email and phone on step 1 so we can save your progress.' })
      return
    }
    setErrors((e) => ({ ...e, save: null }))
    setIsSaving(true)
    setSaveMessage(null)
    try {
      const draftForm = { ...form, deposit_card_number: '', deposit_cvv: '' }
      const res = await fetch('/api/intake-drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, formData: draftForm }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setSaveMessage('Progress saved. Use the same email or phone on the first page to resume later.')
    } catch (err) {
      setErrors((e) => ({ ...e, save: err.message }))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <div className="flex flex-row items-center justify-between mb-5 md:mb-6">
        {onLogoClick ? (
          <button type="button" onClick={onLogoClick} className="inline-flex items-center gap-2 text-xs md:text-sm text-gray-500 hover:text-apl-blue transition-colors">
            <Image src="/logo.png" alt="Animal Protection League" width={32} height={32} className="h-8 w-auto object-contain" />
            <span className="hidden sm:inline font-semibold">Animal Protection League</span>
          </button>
        ) : (
          <Link href="/book" className="inline-flex items-center gap-2 text-xs md:text-sm text-gray-500 hover:text-apl-blue transition-colors">
            <Image src="/logo.png" alt="Animal Protection League" width={32} height={32} className="h-8 w-auto object-contain" />
            <span className="hidden sm:inline font-semibold">Animal Protection League</span>
          </Link>
        )}
        <LanguageToggle />
      </div>

      {/* ── Progress Bar ── */}
      <div className={`relative grid gap-0 mb-6 md:mb-10 px-1 md:px-2 ${isShortFlow ? 'grid-cols-4' : 'grid-cols-6'}`}>
        <div className={`absolute top-4 left-8 right-8 h-[2px] bg-gray-200 ${isShortFlow ? 'col-span-4' : 'col-span-6'}`} />
        <div 
          className="absolute top-4 left-8 h-[2px] bg-apl-primary transition-all duration-300"
          style={{ 
            width: `${((step - 1) / Math.max(1, STEPS.length - 1)) * 100}%`,
            maxWidth: 'calc(100% - 64px)',
          }}
        />

        {STEPS.map((label, i) => {
          const stepNum = i + 1
          const isActive = step >= stepNum
          const isCurrent = step === stepNum
          return (
            <button
              key={stepNum}
              type="button"
              onClick={() => setStep(stepNum)}
              className="relative z-10 flex flex-col items-center cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-apl-blue focus-visible:ring-offset-2 rounded-lg min-w-0"
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={`Go to step ${stepNum}: ${label}`}
            >
              <div
                className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  isActive ? 'bg-apl-primary text-white' : 'bg-white text-gray-400 border-2 border-gray-300 group-hover:border-apl-blue group-hover:text-apl-blue'
                }`}
              >
                {stepNum}
              </div>
              <span className={`text-xs font-medium mt-2 hidden sm:block text-center min-w-0 px-0.5 truncate ${isActive ? 'text-gray-900' : 'text-gray-400'} group-hover:text-gray-700`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Form Title */}
      <h2 className="form-page-title mb-6 md:mb-8">
        {step === 1 && 'Appointment Preferences'}
        {step === 2 && 'Pet Information'}
        {step === 3 && (isShortFlow ? 'Review & Sign' : 'Medical History')}
        {step === 4 && (isShortFlow ? 'Review your submission' : 'Vaccination & Behavior')}
        {step === 5 && !isShortFlow && 'Review & Sign'}
        {step === 6 && !isShortFlow && 'Review your submission'}
      </h2>

      {/* ── Step Content ── */}
      <div key={step} className="animate-fade-in min-w-0">
        {step === 1 && (
          <StepOwner form={form} errors={errors} updateField={updateField} />
        )}
        {step === 2 && (
          <StepPets
            form={form}
            errors={errors}
            updatePet={updatePet}
            handleNumPetsChange={handleNumPetsChange}
            shortFlow={isShortFlow}
          />
        )}
        {step === 3 && !isShortFlow && (
          <StepHealth form={form} errors={errors} updatePet={updatePet} />
        )}
        {step === 3 && isShortFlow && (
          <StepSubmit form={form} errors={errors} updateField={updateField} />
        )}
        {step === 4 && !isShortFlow && (
          <StepVaccination form={form} errors={errors} updatePet={updatePet} />
        )}
        {step === 4 && isShortFlow && <StepSummary form={form} />}
        {step === 5 && !isShortFlow && (
          <StepSubmit form={form} errors={errors} updateField={updateField} />
        )}
        {step === 6 && !isShortFlow && <StepSummary form={form} />}
      </div>

      {/* Error */}
      {errors.submit && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {errors.submit}
        </div>
      )}
      {errors.save && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          {errors.save}
        </div>
      )}
      {saveMessage && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
          {saveMessage}
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-gray-200">
        {/* Mobile: stacked, primary first; Desktop: one row, balanced */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
          {/* Order on mobile: primary (Next/Submit) first, then Previous, then Save */}
          <div className="flex flex-col gap-3 md:order-2 md:flex-1 md:flex-row md:justify-end md:gap-3">
            {step < maxStep ? (
              <button
                type="button"
                onClick={handleNext}
                className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 md:px-6 md:py-3 bg-apl-primary hover:bg-apl-blue-dark text-white font-semibold rounded-lg md:rounded-xl shadow-sm hover:shadow transition-all cursor-pointer text-sm md:text-base order-1 md:order-none"
              >
                Next
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 md:px-6 md:py-3 bg-apl-primary hover:bg-apl-blue-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg md:rounded-xl shadow-sm hover:shadow transition-all cursor-pointer text-sm md:text-base order-1 md:order-none"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Form'}
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3 md:order-1">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl border-2 border-apl-primary/70 text-apl-primary font-medium bg-white hover:bg-apl-primary/5 hover:border-apl-primary transition-all cursor-pointer text-sm md:text-base order-2 md:order-none"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                Previous
              </button>
            ) : onBackToHome ? (
              <button
                type="button"
                onClick={onBackToHome}
                className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl border-2 border-apl-primary/70 text-apl-primary font-medium bg-white hover:bg-apl-primary/5 hover:border-apl-primary transition-all cursor-pointer text-sm md:text-base order-2 md:order-none"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                Back
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl bg-gray-100 border border-gray-400 text-gray-800 font-semibold hover:bg-gray-200 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer text-sm md:text-base order-3 md:order-none shadow-xs"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              ) : (
                <Save className="w-4 h-4 shrink-0" />
              )}
              Save & continue later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
