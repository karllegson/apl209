'use client'

import { useState } from 'react'
import { FileText, RotateCcw } from 'lucide-react'

export default function AppointmentHome({ onStartNew, onResume, onBack }) {
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
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-apl-blue transition-colors cursor-pointer"
        >
          ← Back
        </button>
      )}
      <h1 className="form-page-title text-xl md:text-2xl text-center">
        Spay & Neuter Intake
      </h1>
      <p className="text-gray-600 text-center text-sm md:text-base">
        Start a new intake form or continue where you left off.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <button
          type="button"
          onClick={onStartNew}
          className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-apl-blue hover:bg-apl-blue-50 transition-all cursor-pointer text-left w-full"
        >
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-apl-blue text-white">
            <FileText className="w-6 h-6" />
          </span>
          <span className="font-semibold text-gray-900">Start new form</span>
          <span className="text-sm text-gray-500">
            Begin the spay & neuter intake from the beginning.
          </span>
        </button>

        <div className="flex flex-col items-center text-center p-6 rounded-xl border-2 border-gray-200 bg-gray-50/50">
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 text-gray-600 mb-3">
            <RotateCcw className="w-6 h-6" />
          </span>
          <span className="form-section-heading block border-0 p-0 m-0 mb-2">
            Resume
          </span>
          <p className="text-sm text-gray-500 mb-4">
            Enter the email or phone number you used to save your progress.
          </p>
          <form onSubmit={handleResume} className="space-y-2 w-full">
            <input
              type="text"
              inputMode="email"
              placeholder="Email or phone"
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
              className="w-full py-2.5 px-4 flex items-center justify-center bg-apl-blue text-white font-medium rounded-lg hover:bg-apl-blue-dark disabled:opacity-50 cursor-pointer text-sm"
            >
              {isLoading ? 'Loading...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
