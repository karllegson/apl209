import Image from 'next/image'
import AppointmentPageClient from './AppointmentPageClient'

/* ─── SAVED FORM CARD DECOR SETTINGS (restore from here if needed) ───
 * Peeking pets: desktop only (hidden md:flex), left-[82%] right-[-40%], max-h-[65%] max-w-[55%], opacity-[0.20], object-left, -translate-y-[22%]. Mobile: hidden for full-width aligned form.
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
        <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm p-4 md:p-10 min-h-0 bg-white">
          {/* Peeking pets — desktop only so mobile form is full-width and aligned */}
          <div className="absolute inset-y-0 left-[82%] right-[-40%] z-[1] pointer-events-none flex items-center hidden md:flex" aria-hidden>
            <div className="relative w-full h-full max-h-[65%] max-w-[55%] opacity-[0.20] origin-left -translate-y-[22%]">
              <Image
                src="/peeking-pets.png"
                alt=""
                fill
                className="object-contain object-left"
                sizes="40vw"
              />
            </div>
          </div>
          <div className="relative z-10">
            <AppointmentPageClient />
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
