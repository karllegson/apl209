import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Animal Protection League — Spay & Neuter Clinic',
  description:
    'Low-cost spay and neuter services in Stockton, CA. Request an appointment or view our price list.',
}

export default function HomePage() {
  redirect('/book')
}
