/* eslint-disable react/jsx-key */
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { trackClick } from '@/lib/trackClick'
import IntakeForm from '@/components/intake/IntakeForm'
import AppointmentHome from '@/components/intake/AppointmentHome'
import AppointmentIntro from '@/components/intake/AppointmentIntro'
import ResumeDraftList from '@/components/intake/ResumeDraftList'
import SelectService from '@/components/intake/SelectService'
import { LanguageProvider } from '@/components/intake/LanguageContext'

function AppointmentFlow() {
  const [showIntro, setShowIntro] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showResumeList, setShowResumeList] = useState(false)
  const [showSelectService, setShowSelectService] = useState(false)
  const [resumeDrafts, setResumeDrafts] = useState([])
  const [initialForm, setInitialForm] = useState(null)
  const [initialStep, setInitialStep] = useState(1)

  const handleRequestAppointment = () => {
    setShowIntro(false)
  }

  const handleStartNew = () => {
    setInitialForm(null)
    setInitialStep(1)
    setShowSelectService(true)
  }

  const handleServiceSelect = (serviceId) => {
    setInitialForm({ requested_service: serviceId })
    setInitialStep(1)
    setShowSelectService(false)
    setShowForm(true)
  }

  const handleShowResumeList = (drafts) => {
    setResumeDrafts(drafts || [])
    setShowResumeList(true)
  }

  const handleResumeSelect = (draft) => {
    setInitialForm(draft.formData ?? null)
    setInitialStep(typeof draft.step === 'number' && draft.step >= 1 && draft.step <= 5 ? draft.step : 1)
    setShowResumeList(false)
    setShowForm(true)
  }

  const handleBackToHome = () => {
    setShowForm(false)
    setShowSelectService(true)
  }

  const handleBackToStart = () => {
    setShowForm(false)
    setShowResumeList(false)
    setShowSelectService(false)
    setShowIntro(true)
  }

  if (showIntro) {
    return <AppointmentIntro onRequestAppointment={handleRequestAppointment} />
  }

  if (showResumeList) {
    return (
      <ResumeDraftList
        drafts={resumeDrafts}
        onSelect={handleResumeSelect}
        onBack={handleBackToStart}
      />
    )
  }

  if (showSelectService) {
    return (
      <SelectService
        onSelect={handleServiceSelect}
        onBack={handleBackToStart}
        onLogoClick={handleBackToStart}
      />
    )
  }

  if (!showForm) {
    return (
      <AppointmentHome
        onStartNew={handleStartNew}
        onShowResumeList={handleShowResumeList}
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

const GOOGLE_BUSINESS_TRACKED = 'apl_google_business_tracked'

export default function AppointmentPageClient() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const source = searchParams.get('utm_source')
    if (source === 'google_business' && typeof window !== 'undefined' && !sessionStorage.getItem(GOOGLE_BUSINESS_TRACKED)) {
      trackClick('google-business', 'utm')
      sessionStorage.setItem(GOOGLE_BUSINESS_TRACKED, '1')
    }
  }, [searchParams])

  return (
    <LanguageProvider>
      <AppointmentFlow />
    </LanguageProvider>
  )
}
