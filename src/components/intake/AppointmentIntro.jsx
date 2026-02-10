'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

/**
 * First screen on /book: logo, services clarification, and "Request an Appointment" button.
 * Only this screen shows "Go back to homepage"; later screens show normal "Back".
 */
export default function AppointmentIntro({ onRequestAppointment }) {
  return (
    <div className="space-y-8">
      <Link
        href="https://apl209.org"
        className="inline-flex items-center gap-2 text-sm md:text-base text-gray-600 hover:text-apl-blue mb-2 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Go back to homepage
      </Link>

      <div className="flex justify-center">
        <Image
          src="/logo.png"
          alt="Animal Protection League — The Pawsitive Fix"
          width={240}
          height={120}
          className="w-40 md:w-52 h-auto object-contain"
        />
      </div>

      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Animal Protection League
        </h1>
        <p className="text-apl-blue font-semibold text-lg md:text-xl mb-3">
          Spay & Neuter Clinic — Stockton, CA
        </p>
        <p className="text-gray-600 text-sm md:text-base mb-6">
          We provide low-cost spay and neuter services for cats and dogs.
          We are located in Stockton, CA.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            type="button"
            onClick={onRequestAppointment}
            className="w-full sm:w-auto px-8 py-4 bg-apl-blue hover:bg-apl-blue-dark text-white font-semibold rounded-lg transition-colors text-base md:text-lg shadow-sm cursor-pointer"
          >
            Request an Appointment
          </button>
          <Link
            href="/pricing"
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-apl-blue hover:text-apl-blue hover:bg-apl-blue-50 transition-colors text-sm md:text-base"
          >
            View price list
          </Link>
        </div>
      </div>

      {/* Services clarification */}
      <section className="text-left bg-gray-50 rounded-xl border border-gray-200 p-4 md:p-5">
        <h2 className="form-section-heading border-0 p-0 mb-2">
          What we offer
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          We <strong>only offer spay and neuter</strong> surgery. We do not provide
          general veterinary care, vaccinations (except as part of surgery),
          emergency services, or other procedures. If you&apos;re looking for
          spay or neuter for your cat or dog, you&apos;re in the right place.
        </p>
        <p className="text-gray-600 text-sm leading-relaxed mt-3">
          <strong>Don&apos;t own the pet?</strong> (e.g. outdoor or community cat) We offer{' '}
          <strong>Trap and Release (TNR)</strong>. The animal must be brought in a trap —
          you can rent one from us for $5. Outdoor animals behave differently, so we
          require traps for everyone&apos;s safety.
        </p>
      </section>
    </div>
  )
}
