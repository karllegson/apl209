 'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FileText, RotateCcw } from 'lucide-react'
import { useLanguage, LanguageToggle } from './LanguageContext'

export default function AppointmentHome({ onStartNew, onResume, onBack }) {
  const { language } = useLanguage()
  const isSpanish = language === 'es'
  const [resumeValue, setResumeValue] = useState('')
  const [resumeError, setResumeError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v?.trim())
  const isPhone = (v) => /^[\d\s\-\(\)]+$/.test(v?.trim()) && v?.replace(/\D/g, '').length >= 10

  const handleResume = async (e) => {
    e.preventDefault()
    const v = resumeValue.trim()
    if (!v) {
      setResumeError('Enter your email or phone number')
      return
    }
    if (!isEmail(v) && !isPhone(v)) {
      setResumeError('Enter a valid email or phone number')
      return
    }
    setResumeError('')
    setIsLoading(true)
    try {
      const params = isEmail(v) ? { email: v } : { phone: v }
      const res = await fetch(
        `/api/intake-drafts?${new URLSearchParams(params)}`
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      if (!data.draft) {
        setResumeError('No saved progress found for this email or phone.')
        return
      }
      onResume(data.draft.formData, data.draft.step)
    } catch (err) {
      setResumeError(err.message || 'Something went wrong. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-gray-600 hover:text-apl-blue transition-colors cursor-pointer"
          >
            ← Back
          </button>
        )}
        <LanguageToggle />
      </div>

      <div className="flex justify-center mb-4">
        <Image
          src="/logo.png"
          alt="Animal Protection League"
          width={140}
          height={140}
          className="h-16 w-auto object-contain"
        />
      </div>

      <div className="text-center space-y-2">
        <h1 className="form-page-title text-xl md:text-2xl">
          {isSpanish ? 'Formulario de ingreso a la clínica' : 'Clinic & Wellness Intake'}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {isSpanish
            ? 'Empiece un nuevo formulario o continúe donde lo dejó.'
            : 'Start a new intake form or continue where you left off.'}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:gap-5">
        <button
          type="button"
          onClick={onStartNew}
          className="flex items-center justify-between gap-4 p-4 md:p-5 rounded-2xl border-2 border-apl-primary/70 bg-white/95 shadow-sm hover:border-apl-primary hover:bg-apl-primary/5 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all cursor-pointer w-full"
        >
          <div className="flex items-center gap-4">
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-apl-primary to-apl-blue-dark text-white shadow-md">
              <FileText className="w-6 h-6" />
            </span>
            <div className="text-left">
              <p className="font-semibold text-gray-900">
                {isSpanish ? 'Empezar nuevo formulario' : 'Start new form'}
              </p>
              <p className="text-sm text-gray-500">
                {isSpanish
                  ? 'Comience un nuevo ingreso a la clínica desde el principio.'
                  : 'Start a new clinic intake from the beginning.'}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-apl-primary text-white text-sm font-semibold shadow-sm">
            {isSpanish ? 'Comenzar' : 'Begin'}
          </span>
        </button>

        <div className="flex flex-col gap-3 p-4 md:p-5 rounded-2xl border-2 border-apl-primary/20 bg-gray-50/90 shadow-sm hover:border-apl-primary/60 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-gray-600 border border-gray-300 shadow-xs">
              <RotateCcw className="w-5 h-5" />
            </span>
            <div className="text-left">
              <p className="font-semibold text-gray-900">
                {isSpanish ? 'Reanudar formulario' : 'Resume saved form'}
              </p>
              <p className="text-sm text-gray-500">
                {isSpanish
                  ? 'Use el mismo correo electrónico o teléfono que utilizó para guardar su progreso.'
                  : 'Use the same email or phone you used when you saved your progress.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleResume} className="mt-2 space-y-2 w-full">
            <input
              type="text"
              inputMode="email"
              placeholder={isSpanish ? 'Correo electrónico o teléfono' : 'Email or phone'}
              value={resumeValue}
              onChange={(e) => {
                setResumeValue(e.target.value)
                setResumeError('')
              }}
              className="w-full intake-input px-3 py-2.5 rounded-lg border border-gray-300 text-base"
            />
              {resumeError && (
                <p className="text-red-500 text-sm">{resumeError}</p>
              )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 flex items-center justify-center bg-apl-primary text-white font-medium rounded-lg hover:bg-apl-blue-dark disabled:opacity-50 cursor-pointer text-sm"
            >
              {isLoading
                ? isSpanish ? 'Cargando...' : 'Loading...'
                : isSpanish ? 'Continuar' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
