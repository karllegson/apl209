import AdminUsersClient from './AdminUsersClient'

export const metadata = {
  title: 'Volunteer Sign-ups — Animal Protection League',
  description: 'Admin roster of laundry volunteer sign-ups at the Animal Protection League.',
}

export default function VolunteerAdminPage() {
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

      <main className="relative w-full max-w-2xl mx-auto px-2.5 py-4 sm:px-4 sm:py-6 md:px-8 md:py-10 overflow-x-hidden">
        <div className="relative bg-white rounded-2xl border border-white/80 shadow-[0_16px_50px_rgba(0,0,0,0.22)] p-4 sm:p-6 md:p-8 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-apl-orange via-apl-primary to-apl-blue-dark" />
          <AdminUsersClient />
        </div>
        <div className="mt-5 text-center text-[11px] sm:text-xs text-slate-400 space-y-1 px-2">
          <p>Animal Protection League &mdash; 1409 West Oak St., Stockton 95203</p>
          <p>
            <a href="tel:+12094944563" className="text-slate-300 hover:text-white">
              209-494-4563
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
