 'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FileText, RotateCcw } from 'lucide-react'
import { useLanguage, LanguageToggle } from './LanguageContext'

export default function AppointmentHome({ onStartNew, onShowResumeList, onBack, onLogoClick }) {
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
      setResumeError(isSpanish ? 'Ingresa tu correo o teléfono' : 'Enter your email or phone number')
      return
    }
    if (!isEmail(v) && !isPhone(v)) {
      setResumeError(isSpanish ? 'Ingresa un correo o teléfono válido' : 'Enter a valid email or phone number')
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
      if (!data.drafts?.length) {
        setResumeError(isSpanish ? 'No se encontró progreso guardado para este correo o teléfono.' : 'No saved progress found for this email or phone.')
        return
      }
      onShowResumeList(data.drafts)
    } catch (err) {
      setResumeError(err.message || (isSpanish ? 'Algo salió mal. Intenta de nuevo.' : 'Something went wrong. Try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-5 md:space-y-8">
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

      {onLogoClick ? (
        <button type="button" onClick={onLogoClick} className="flex justify-center mb-4 w-full cursor-pointer">
          <Image src="/logo.png" alt="Animal Protection League" width={140} height={140} className="h-16 w-auto object-contain" />
        </button>
      ) : (
        <Link href="/book" className="flex justify-center mb-4 block">
          <Image src="/logo.png" alt="Animal Protection League" width={140} height={140} className="h-16 w-auto object-contain" />
        </Link>
      )}

      <div className="text-center space-y-2">
        <h1 className="form-page-title text-xl md:text-2xl">
          {isSpanish ? 'Formulario de ingreso a la clínica' : 'Clinic & Wellness Intake'}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {isSpanish ? 'Nuevo formulario o continuar guardado.' : 'New form or continue saved.'}
        </p>
      </div>

      <div className="flex flex-col gap-3 md:gap-5">
        <button
          type="button"
          onClick={onStartNew}
          className="flex items-center justify-between gap-3 p-3 md:gap-4 md:p-5 rounded-xl md:rounded-2xl border-2 border-apl-primary/70 bg-white/95 shadow-sm hover:border-apl-primary hover:bg-apl-primary/5 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all cursor-pointer w-full"
        >
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <span className="flex shrink-0 items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-tr from-apl-primary to-apl-blue-dark text-white shadow-md">
              <FileText className="w-5 h-5 md:w-6 md:h-6" />
            </span>
            <div className="text-left min-w-0">
              <p className="font-semibold text-gray-900 text-sm md:text-base">
                {isSpanish ? 'Empezar nuevo formulario' : 'Start new form'}
              </p>
              <p className="text-xs md:text-sm text-gray-500">
                {isSpanish ? 'Empezar desde el principio.' : 'Start from the beginning.'}
              </p>
            </div>
          </div>
          <span className="shrink-0 inline-flex items-center justify-center px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl bg-apl-primary text-white text-xs md:text-sm font-semibold shadow-sm">
            {isSpanish ? 'Comenzar' : 'Begin'}
          </span>
        </button>

        <div className="flex flex-col gap-2 p-3 md:gap-3 md:p-5 rounded-xl md:rounded-2xl border-2 border-apl-primary/20 bg-gray-50/90 shadow-sm hover:border-apl-primary/60 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all cursor-pointer">
          <div className="flex items-center gap-2 md:gap-3">
            <span className="flex shrink-0 items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-white text-gray-600 border border-gray-300 shadow-xs">
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
            </span>
            <div className="text-left min-w-0">
              <p className="font-semibold text-gray-900 text-sm md:text-base">
                {isSpanish ? 'Reanudar formulario' : 'Resume saved form'}
              </p>
              <p className="text-xs md:text-sm text-gray-500">
                {isSpanish ? 'Correo o teléfono con el que guardó.' : 'Email or phone you used to save.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleResume} className="mt-1 md:mt-2 space-y-1.5 md:space-y-2 w-full">
            <input
              type="text"
              inputMode="email"
              placeholder={isSpanish ? 'Correo electrónico o teléfono' : 'Email or phone'}
              value={resumeValue}
              onChange={(e) => {
                setResumeValue(e.target.value)
                setResumeError('')
              }}
              className="w-full intake-input px-3 py-2 md:py-2.5 rounded-lg border border-gray-300 text-sm md:text-base"
            />
              {resumeError && (
                <p className="text-red-500 text-sm">{resumeError}</p>
              )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-3 md:py-2.5 md:px-4 flex items-center justify-center bg-apl-primary text-white font-medium rounded-lg hover:bg-apl-blue-dark disabled:opacity-50 cursor-pointer text-sm"
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
