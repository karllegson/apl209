'use client'

import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { CheckCircle, Phone, ArrowLeft, MapPin, Globe } from 'lucide-react'
import { LanguageProvider, LanguageToggle, useLanguage } from '@/components/intake/LanguageContext'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const appointmentId = searchParams.get('id')
  const { language } = useLanguage()
  const isSpanish = language === 'es'

  return (
    <div className="min-h-screen relative">
      {/* Same background as book flow */}
      <div
        className="fixed inset-0 -z-10 bg-gray-900"
        style={{
          backgroundImage: 'url(/clinic-waiting-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(14px)',
        }}
      />
      <div className="fixed inset-0 -z-10 bg-black/60" aria-hidden />

      <main className="relative max-w-lg mx-auto px-3 py-8 md:py-12 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-xl shadow-black/10 overflow-hidden">
          {/* Logo (left) + Language toggle (right) */}
          <div className="flex items-center justify-between px-6 md:px-10 pt-6 md:pt-8 pb-2 border-b border-gray-100">
            <Link href="/book" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Animal Protection League"
                width={140}
                height={70}
                className="h-12 md:h-14 w-auto object-contain"
              />
            </Link>
            <LanguageToggle />
          </div>

          {/* Success header */}
          <div className="pt-6 md:pt-8 pb-4 px-6 md:px-10 text-center border-b border-gray-100">
            <div className="flex justify-center mb-4">
              <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-inner">
                <Image
                  src="/confirmation-dog.png"
                  alt=""
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 112px, 144px"
                />
              </div>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <CheckCircle className="w-6 h-6 md:w-7 md:h-7 text-apl-primary shrink-0" />
              {isSpanish ? 'Formulario enviado' : 'Intake form submitted'}
            </h1>
            <p className="text-gray-600 text-sm md:text-base max-w-sm mx-auto">
              {isSpanish
                ? 'Gracias por completar el formulario. Lo revisaremos y nos comunicaremos para confirmar su cita.'
                : "Thank you for completing the form. We'll review it and contact you to confirm your appointment."}
            </p>
          </div>

          <div className="p-6 md:p-10 space-y-5">
            {/* Reference ID */}
            {appointmentId && (
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-center">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  {isSpanish ? 'ID de referencia' : 'Reference ID'}
                </p>
                <p className="text-lg font-mono font-semibold text-gray-800 tracking-wider">
                  {appointmentId.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {isSpanish ? 'Guarde este número por si necesita consultar su envío.' : 'Save this in case you need to reference your submission'}
                </p>
              </div>
            )}

            {/* What happens next */}
            <div className="rounded-xl bg-apl-blue/5 border border-apl-blue/20 p-4 md:p-5">
              <div className="flex items-center gap-2 text-apl-primary mb-3">
                <Phone className="w-4 h-4 shrink-0" />
                <p className="font-semibold text-sm">{isSpanish ? '¿Qué sigue?' : 'What happens next?'}</p>
              </div>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="flex shrink-0 w-5 h-5 rounded-full bg-apl-primary/20 text-apl-primary font-semibold text-xs flex items-center justify-center">1</span>
                  {isSpanish ? 'Nuestro equipo revisa su formulario' : 'Our team reviews your intake form'}
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex shrink-0 w-5 h-5 rounded-full bg-apl-primary/20 text-apl-primary font-semibold text-xs flex items-center justify-center">2</span>
                  {isSpanish ? 'Nos comunicaremos para programar una fecha' : "We'll contact you to schedule a date"}
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex shrink-0 w-5 h-5 rounded-full bg-apl-primary/20 text-apl-primary font-semibold text-xs flex items-center justify-center">3</span>
                  {isSpanish ? 'Traiga a su mascota a nuestra clínica en Stockton el día programado' : 'Bring your pet to our Stockton clinic on the scheduled day'}
                </li>
              </ol>
            </div>

            {/* Disclaimer */}
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 flex gap-2">
              <span className="text-amber-600 shrink-0 mt-0.5">⚠️</span>
              <p className="text-xs text-amber-800 font-medium">
                {isSpanish
                  ? 'Este envío no confirma una cita. Nuestro equipo se comunicará con usted.'
                  : 'This submission does not confirm an appointment. You will be contacted by our team.'}
              </p>
            </div>

            {/* CTA */}
            <Link
              href="/book"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 md:py-3 bg-apl-primary hover:bg-apl-blue-dark text-white font-semibold rounded-xl transition-colors shadow-md hover:shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              {isSpanish ? 'Enviar otro formulario' : 'Submit another form'}
            </Link>
          </div>

          {/* Footer */}
          <div className="px-6 md:px-10 py-5 bg-gray-50/80 border-t border-gray-100 text-center">
            <p className="text-xs font-semibold text-gray-500 mb-2">Animal Protection League</p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3 text-apl-primary" />
                1409 West Oak St., Stockton 95203
              </span>
              <span className="inline-flex items-center gap-1">
                <Phone className="w-3 h-3 text-apl-primary" />
                209-420-4776
              </span>
              <a
                href="https://apl209.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-apl-primary hover:underline"
              >
                <Globe className="w-3 h-3" />
                apl209.org
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <LanguageProvider>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-900/80">
            <div className="w-12 h-12 rounded-full border-2 border-apl-primary border-t-transparent animate-spin" />
          </div>
        }
      >
        <ConfirmationContent />
      </Suspense>
    </LanguageProvider>
  )
}
