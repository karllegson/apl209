 'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Loader2, Save } from 'lucide-react'
import StepOwner from './StepOwner'
import StepPets from './StepPets'
import StepHealth from './StepHealth'
import StepVaccination from './StepVaccination'
import StepSubmit from './StepSubmit'
import { useLanguage, LanguageToggle } from './LanguageContext'

function createEmptyPet() {
  return {
    pet_name: '',
    type: '',
    breed: '',
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
    drug_vaccine_reactions: null,
    current_medications: null,
    rabies_vaccinated: '',
    rabies_within_1_3_years: '',
    exposed_to_diseases: null,
    has_fleas_ticks: null,
    vet_behavior: '',
  }
}

const defaultForm = {
  is_returning_customer: null,
  owner_name: '',
  owner_phone: '',
  owner_email: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  preferred_contact: '',
  city: '',
  zip_code: '',
  how_heard: '',
  num_pets: 1,
  pets: [createEmptyPet()],
  wants_microchip: false,
  wants_nail_trim: false,
  wants_flea_treatment: false,
  legal_acknowledged: false,
  signature: '',
}

function mergeForm(initial) {
  if (!initial || typeof initial !== 'object') return defaultForm
  const merged = { ...defaultForm, ...initial }
  if (Array.isArray(initial.pets) && initial.pets.length > 0) {
    merged.pets = initial.pets.map((p) => ({ ...createEmptyPet(), ...p }))
    merged.num_pets = Math.max(1, merged.pets.length)
  }
  return merged
}

export default function IntakeForm({ initialForm, initialStep = 1, onBackToHome }) {
  const router = useRouter()
  const { language } = useLanguage()
  const isSpanish = language === 'es'

  const STEPS = isSpanish
    ? ['Preferencias', 'Información de la mascota', 'Historial médico', 'Vacunación', 'Revisión']
    : ['Preferences', 'Pet Info', 'Medical History', 'Vaccination', 'Review']
  const [step, setStep] = useState(initialStep >= 1 && initialStep <= 5 ? initialStep : 1)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState(null)

  const [form, setForm] = useState(() => mergeForm(initialForm))

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
      if (!form.owner_name.trim()) e.owner_name = 'Required'
      if (!form.owner_phone.trim()) e.owner_phone = 'Required'
      if (!form.owner_email.trim()) e.owner_email = 'Required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.owner_email))
        e.owner_email = 'Invalid email'
      if (!form.city.trim()) e.city = 'Required'
    }

    if (stepNum === 2) {
      form.pets.forEach((pet, i) => {
        if (!pet.type) e[`pet_${i}_type`] = 'Select dog or cat'
        if (!pet.breed.trim()) e[`pet_${i}_breed`] = 'Required'
        if (!pet.age.trim()) e[`pet_${i}_age`] = 'Required'
        if (!pet.weight.trim()) e[`pet_${i}_weight`] = 'Required'
        if (!pet.pet_ownership) e[`pet_${i}_pet_ownership`] = 'Required'
        if (!pet.sex) e[`pet_${i}_sex`] = 'Required'
        if (pet.sex === 'male' && !pet.testicles_descended)
          e[`pet_${i}_testicles_descended`] = 'Required'
        if (pet.sex === 'female' && !pet.in_heat_or_pregnant)
          e[`pet_${i}_in_heat_or_pregnant`] = 'Required'
      })
    }

    if (stepNum === 3) {
      form.pets.forEach((pet, i) => {
        if (pet.currently_sick_injured === null)
          e[`pet_${i}_currently_sick_injured`] = 'Required'
      })
    }

    if (stepNum === 4) {
      form.pets.forEach((pet, i) => {
        if (!pet.rabies_vaccinated)
          e[`pet_${i}_rabies_vaccinated`] = 'Required'
        if (pet.has_fleas_ticks === null)
          e[`pet_${i}_has_fleas_ticks`] = 'Required'
        if (!pet.vet_behavior) e[`pet_${i}_vet_behavior`] = 'Required'
      })
    }

    if (stepNum === 5) {
      if (!form.legal_acknowledged)
        e.legal_acknowledged = 'You must accept to continue'
      if (!form.signature.trim()) e.signature = 'Signature is required'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 5))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    if (!validateStep(5)) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
      const res = await fetch('/api/intake-drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, formData: form }),
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-5 md:mb-6">
        <Link
          href="https://apl209.org"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs md:text-sm text-gray-500 hover:text-apl-blue transition-colors"
        >
          <Image
            src="/logo.png"
            alt="Animal Protection League"
            width={32}
            height={32}
            className="h-8 w-auto object-contain"
          />
          <span className="hidden sm:inline font-semibold">
            Animal Protection League
          </span>
        </Link>
        <LanguageToggle />
      </div>

      {/* ── Progress Bar ── */}
      <div className="relative flex items-center justify-between mb-6 md:mb-10 px-1 md:px-2">
        <div className="absolute top-4 left-8 right-8 h-[2px] bg-gray-200" />
        <div 
          className="absolute top-4 left-8 h-[2px] bg-apl-primary transition-all duration-300"
          style={{ 
            width: `${((step - 1) / (STEPS.length - 1)) * 100}%`,
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
              className="relative z-10 flex flex-col items-center cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-apl-blue focus-visible:ring-offset-2 rounded-lg"
              style={{ flex: 1 }}
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={`Go to step ${stepNum}: ${label}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  isActive ? 'bg-apl-primary text-white' : 'bg-white text-gray-400 border-2 border-gray-300 group-hover:border-apl-blue group-hover:text-apl-blue'
                }`}
              >
                {stepNum}
              </div>
              <span className={`text-xs font-medium mt-2 hidden sm:block ${isActive ? 'text-gray-900' : 'text-gray-400'} group-hover:text-gray-700`}>
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
        {step === 3 && 'Medical History'}
        {step === 4 && 'Vaccination & Behavior'}
        {step === 5 && 'Review & Sign'}
      </h2>

      {/* ── Step Content ── */}
      <div key={step} className="animate-fade-in">
        {step === 1 && (
          <StepOwner form={form} errors={errors} updateField={updateField} />
        )}
        {step === 2 && (
          <StepPets
            form={form}
            errors={errors}
            updatePet={updatePet}
            handleNumPetsChange={handleNumPetsChange}
          />
        )}
        {step === 3 && (
          <StepHealth form={form} errors={errors} updatePet={updatePet} />
        )}
        {step === 4 && (
          <StepVaccination form={form} errors={errors} updatePet={updatePet} />
        )}
        {step === 5 && (
          <StepSubmit form={form} errors={errors} updateField={updateField} />
        )}
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
            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 md:py-3 bg-apl-primary hover:bg-apl-blue-dark text-white font-semibold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer text-base order-1 md:order-none"
              >
                Next
                <ChevronRight className="w-5 h-5 shrink-0" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 md:py-3 bg-apl-primary hover:bg-apl-blue-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer text-base order-1 md:order-none"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Form'}
                <ChevronRight className="w-5 h-5 shrink-0" />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3 md:order-1">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 md:py-2.5 rounded-xl bg-gray-100 border border-gray-400 text-gray-800 font-medium hover:bg-gray-200 hover:border-gray-500 transition-all cursor-pointer text-base order-2 md:order-none"
              >
                <ChevronLeft className="w-5 h-5 shrink-0" />
                Previous
              </button>
            ) : onBackToHome ? (
              <button
                type="button"
                onClick={onBackToHome}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 md:py-2.5 rounded-xl bg-gray-100 border border-gray-400 text-gray-800 font-medium hover:bg-gray-200 hover:border-gray-500 transition-all cursor-pointer text-base order-2 md:order-none"
              >
                <ChevronLeft className="w-5 h-5 shrink-0" />
                Back
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 md:py-2.5 rounded-xl border-2 border-apl-primary/70 text-apl-primary font-semibold bg-white hover:bg-apl-primary/5 hover:border-apl-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer text-sm md:text-base order-3 md:order-none shadow-xs"
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
