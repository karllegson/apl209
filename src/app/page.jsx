import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Animal Protection League — Clinic &amp; Wellness Center',
  description:
    'Free and low-cost veterinary wellness and surgery services for dogs and cats in San Joaquin County. Request an appointment or view our price list.',
}

export default function HomePage() {
  redirect('/book')
}
