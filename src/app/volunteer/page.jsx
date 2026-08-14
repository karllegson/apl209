import VolunteerPageClient from './VolunteerPageClient'

export const metadata = {
  title: 'Laundry Volunteers — Animal Protection League',
  description:
    'Sign up for a weekday laundry shift at the Animal Protection League Clinic in Stockton.',
}

export default function VolunteerPage() {
  return (
    <div className="min-h-screen relative">
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

      <main className="relative w-full mx-auto px-2.5 py-4 sm:px-4 sm:py-6 md:px-8 md:py-10 overflow-x-hidden">
        <VolunteerPageClient />

        <div className="mt-5 sm:mt-6 text-center text-[11px] sm:text-xs text-slate-400 space-y-1 px-2">
          <p>Animal Protection League &mdash; 1409 West Oak St., Stockton 95203</p>
          <p>
            Phone:{' '}
            <a href="tel:+12094944563" className="text-slate-300 hover:text-white">
              209-494-4563
            </a>
          </p>
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
