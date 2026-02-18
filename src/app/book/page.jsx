import Image from 'next/image'
import { Suspense } from 'react'
import AppointmentPageClient from './AppointmentPageClient'

/* ─── SAVED FORM CARD DECOR SETTINGS (restore from here if needed) ───
 * Peeking pets: mobile left-[65%] right-[-25%], max-h-[50%] max-w-[45%], -translate-y-[15%]; md: left-[82%] right-[-40%], max-h-[65%] max-w-[55%], -translate-y-[22%]; opacity 0.20.
 */

export const metadata = {
  title: 'APL Form',
  description:
    'Submit an intake form for free and low-cost veterinary surgery and wellness services at the Animal Protection League Clinic in Stockton, CA.',
}

export default function AppointmentPage() {
  return (
    <div className="min-h-screen relative">
      {/* Blurry clinic background (Stanley photo) */}
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

      {/* Form: compact on mobile so it fits; scrolls if needed */}
      <main className="relative max-w-3xl mx-auto px-3 py-6 md:px-4 md:py-12 overflow-x-hidden">
        <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm p-4 md:p-10 min-h-0 min-w-0 bg-white">
          {/* Peeking pets — MOBILE: left/right = position; w/h = image size (e.g. 42vw) so moving strip doesn't shrink it. DESKTOP: unchanged. */}
          <div className="absolute inset-y-0 left-[75%] right-[-25%] md:left-[82%] md:right-[-40%] z-[1] pointer-events-none flex items-center" aria-hidden>
            <div className="relative w-[42vw] h-[36vh] max-h-[55%] md:w-full md:h-full md:max-h-[65%] md:max-w-[55%] opacity-[0.10] origin-left -translate-y-[15%] md:-translate-y-[22%]">
              <Image
                src="/peeking-pets.png"
                alt=""
                fill
                className="object-contain object-left"
                sizes="40vw"
              />
            </div>
          </div>
          <div className="relative z-10 min-w-0 max-w-full">
            <Suspense fallback={<div className="min-h-[200px]" />}>
              <AppointmentPageClient />
            </Suspense>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-400 space-y-1">
          <p>
            Animal Protection League &mdash; 1409 West Oak St., Stockton 95203
          </p>
          <p>Phone: 209-420-4776</p>
          <p>
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
      </main>
    </div>
  )
}
