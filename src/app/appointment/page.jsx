import AppointmentPageClient from './AppointmentPageClient'

export const metadata = {
  title: 'APL Form',
  description:
    'Submit a spay/neuter intake form for the Animal Protection League Clinic in Stockton, CA.',
}

export default function AppointmentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Form: compact on mobile so it fits; scrolls if needed */}
      <main className="max-w-3xl mx-auto px-3 py-6 md:px-4 md:py-12">
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
