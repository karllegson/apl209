import AppointmentPageClient from './AppointmentPageClient'

export const metadata = {
  title: 'Clinic &amp; Wellness Intake Form — Animal Protection League',
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
      <main className="relative max-w-3xl mx-auto px-3 py-6 md:px-4 md:py-12">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 md:p-10 min-h-0">
          <AppointmentPageClient />
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
