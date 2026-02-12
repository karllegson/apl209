'use client'

import { useSearchParams } from 'next/navigation'
import { CheckCircle, Phone, ArrowLeft, PawPrint } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const appointmentId = searchParams.get('id')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 max-w-lg w-full text-center animate-fade-in">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-apl-blue" />
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Intake Form Submitted!
        </h1>

        <p className="text-slate-500 mb-6">
          Thank you for completing the intake form. We will review your submission and reach out to confirm
          your appointment.
        </p>

        {appointmentId && (
          <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
            <p className="text-xs text-slate-400 mb-1">Reference ID</p>
            <p className="text-sm font-mono text-slate-600 break-all">
              {appointmentId}
            </p>
          </div>
        )}

        <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
          <div className="flex items-center justify-center gap-2 text-apl-blue mb-2">
            <Phone className="w-4 h-4" />
            <p className="font-semibold text-sm">What happens next?</p>
          </div>
          <ul className="text-sm text-blue-700 space-y-1.5 text-left max-w-xs mx-auto">
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">1.</span>
              Our team reviews your intake form
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">2.</span>
              We&apos;ll contact you to schedule a date
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">3.</span>
              Bring your pet to our Stockton Clinic on the scheduled day
            </li>
          </ul>
        </div>

        <div className="bg-amber-50 rounded-xl p-3 mb-8 border border-amber-100">
          <p className="text-xs text-amber-700 font-medium">
            ⚠️ This submission does not confirm an appointment. You will be
            contacted by our team.
          </p>
        </div>

        <Link
          href="/book"
          className="inline-flex items-center gap-2 px-6 py-3 bg-apl-primary hover:bg-apl-blue-dark text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Submit Another Form
        </Link>

        <p className="text-xs text-slate-400 mt-6">
          Animal Protection League &mdash; 1409 West Oak St., Stockton 95203
          <br />
          209-420-4776 &middot;{' '}
          <a
            href="https://apl209.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-apl-blue hover:underline"
          >
            apl209.org
          </a>
        </p>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center">
          <PawPrint className="w-8 h-8 text-apl-blue animate-pulse" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  )
}
