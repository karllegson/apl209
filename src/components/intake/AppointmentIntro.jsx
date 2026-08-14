'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MapPin } from 'lucide-react'
import { useLanguage, LanguageToggle } from './LanguageContext'

/**
 * First screen on /book: logo, services clarification, and "Request an Appointment" button.
 * Only this screen shows "Go back to homepage"; later screens show normal "Back".
 */
export default function AppointmentIntro({ onRequestAppointment }) {
  const { language, setLanguage } = useLanguage()
  const isSpanish = language === 'es'

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-2">
        <Link
          href="https://apl209.org"
          className="inline-flex items-center gap-2 text-sm md:text-base text-gray-600 hover:text-apl-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {isSpanish ? 'Volver a la página principal' : 'Go back to homepage'}
        </Link>
        <LanguageToggle />
      </div>

      <Link href="/book" className="flex justify-center mb-4 cursor-pointer block">
        <Image
          src="/logo.png"
          alt="Animal Protection League — The Pawsitive Fix"
          width={240}
          height={120}
          className="w-40 md:w-52 h-auto object-contain"
        />
      </Link>

      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {isSpanish ? 'Animal Protection League' : 'Animal Protection League'}
        </h1>
        <p className="text-apl-blue-light font-semibold text-lg md:text-xl mb-3">
          {isSpanish
            ? 'Clínica y Centro de Bienestar de Bajo Costo — Stockton, CA'
            : 'Free/Low-Cost Clinic & Wellness Center — Stockton, CA'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-2 mt-4">
          <button
            type="button"
            onClick={onRequestAppointment}
            className="w-full sm:w-auto px-8 py-4 bg-apl-primary hover:bg-apl-blue-dark text-white font-semibold rounded-lg transition-colors text-base md:text-lg shadow-sm cursor-pointer"
          >
            {isSpanish ? 'Solicitar una cita' : 'Request an Appointment'}
          </button>
          <Link
            href="/pricing"
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-apl-blue hover:text-apl-blue hover:bg-apl-blue-50 transition-colors text-sm md:text-base"
          >
            {isSpanish ? 'Ver lista de precios' : 'View price list'}
          </Link>
        </div>
      </div>

      {/* Services overview */}
      <section className="text-left bg-gray-50 rounded-xl border border-gray-200 p-4 md:p-5">
        <h2 className="form-section-heading border-0 p-0 mb-2">
          {isSpanish ? 'Servicios de la clínica' : 'Our clinic services'}
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          {isSpanish
            ? 'Nuestro equipo ofrece cirugías de esterilización y castración, vacunas básicas, microchip, prevención de pulgas, desparasitantes, estudios de laboratorio básicos y más para mantener a las mascotas sanas y con sus familias.'
            : 'Our team provides spay and neuter surgery, core vaccines, microchipping, flea prevention, dewormer, basic lab work and more to keep pets healthy and with their families.'}
        </p>
        <p className="text-gray-600 text-sm leading-relaxed mt-3">
          {isSpanish
            ? 'Al completar este formulario usted está solicitando una cita. Nuestro equipo revisará su información y se comunicará con usted para programar y confirmar la fecha y la hora.'
            : 'Filling out this form requests an appointment. Our team will review your information and contact you to schedule and confirm a date and time.'}
        </p>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
              1409 West Oak St., Stockton, CA 95203
            </span>
            <span className="text-gray-300">·</span>
            <a href="tel:+12094204776" className="hover:text-apl-blue hover:underline">(209) 420-4776</a>
            <span className="text-gray-300">·</span>
            <a href="mailto:aplclinic@apl209.org" className="hover:text-apl-blue hover:underline">aplclinic@apl209.org</a>
            <span className="text-gray-300">·</span>
            <Link href="/volunteer" className="text-apl-blue underline underline-offset-2 hover:text-apl-blue-dark cursor-pointer">
              {isSpanish ? 'Voluntariado' : 'Volunteer'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
