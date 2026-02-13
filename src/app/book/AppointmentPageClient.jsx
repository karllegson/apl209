/* eslint-disable react/jsx-key */
'use client'

import { useState } from 'react'
import IntakeForm from '@/components/intake/IntakeForm'
import AppointmentHome from '@/components/intake/AppointmentHome'
import AppointmentIntro from '@/components/intake/AppointmentIntro'
import { LanguageProvider } from '@/components/intake/LanguageContext'

function AppointmentFlow() {
  const [showIntro, setShowIntro] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [initialForm, setInitialForm] = useState(null)
  const [initialStep, setInitialStep] = useState(1)

  const handleRequestAppointment = () => {
    setShowIntro(false)
  }

  const handleStartNew = () => {
    setInitialForm(null)
    setInitialStep(1)
    setShowForm(true)
  }

  const handleResume = (formData, step) => {
    setInitialForm(formData ?? null)
    setInitialStep(typeof step === 'number' && step >= 1 && step <= 5 ? step : 1)
    setShowForm(true)
  }

  const handleBackToHome = () => {
    setShowForm(false)
  }

  const handleBackToStart = () => {
    setShowForm(false)
    setShowIntro(true)
  }

  if (showIntro) {
    return <AppointmentIntro onRequestAppointment={handleRequestAppointment} />
  }

  if (!showForm) {
  return (
    <AppointmentHome
        onStartNew={handleStartNew}
        onResume={handleResume}
        onBack={handleBackToStart}
        onLogoClick={handleBackToStart}
      />
    )
  }

  return (
    <IntakeForm
      initialForm={initialForm}
      initialStep={initialStep}
      onBackToHome={handleBackToHome}
      onLogoClick={handleBackToStart}
    />
  )
}

export default function AppointmentPageClient() {
  return (
    <LanguageProvider>
      <AppointmentFlow />
    </LanguageProvider>
  )
}
