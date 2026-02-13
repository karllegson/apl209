import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Phone, Mail, MapPin } from 'lucide-react'
import PricingAccordion from './PricingAccordion'

export const metadata = {
  title: 'Price List — Animal Protection League Clinic',
  description:
    'Free and low-cost pricing for surgery, vaccines, and other wellness services at APL Clinic in Stockton, CA.',
}

const PRICING_SECTIONS = [
  {
    id: 'female-dog',
    variant: 'blue',
    title: 'Female Dog Spay',
    note: 'Includes cone and pain medications.',
    rows: [
      { service: '1–25 lbs', price: '$185' },
      { service: '26–50 lbs', price: '$210' },
      { service: '51–75 lbs', price: '$275' },
      { service: '76–99 lbs', price: '$350' },
      { service: 'Heat 0–50 lbs', price: 'Additional $50' },
      { service: 'Heat 51–99 lbs', price: 'Additional $100' },
      { service: 'Pregnancy', price: 'Additional $125' },
      { service: 'Obese charge 1–50 lbs', price: 'Additional $50' },
      { service: 'Obese charge 51–99 lbs', price: 'Additional $100' },
    ],
  },
  {
    id: 'male-dog',
    variant: 'blue',
    title: 'Male Dog Neuter',
    note: 'Includes cone and pain medications.',
    rows: [
      { service: '1–25 lbs', price: '$160' },
      { service: '26–50 lbs', price: '$180' },
      { service: '51–75 lbs', price: '$225' },
      { service: '76–99 lbs', price: '$250' },
      { service: 'Undescended testicle (1)', price: 'Additional $50–$200' },
      { service: 'Undescended testicles (2)', price: 'Additional $100–$400' },
      { service: 'Obese charge 1–50 lbs', price: 'Additional $50' },
      { service: 'Obese charge 51–99 lbs', price: 'Additional $100' },
    ],
  },
  {
    id: 'cats',
    variant: 'orange',
    title: 'Cats',
    note: 'Includes exam, pain injection and antibiotic injection.',
    rows: [
      { service: 'Pet cat neuter', price: '$75' },
      { service: 'Pet cat spay', price: '$95' },
      { service: 'Pet cat spay — in heat', price: 'Additional $25' },
      { service: 'Pet cat spay — pregnant', price: 'Additional $50' },
    ],
  },
  {
    id: 'tnr',
    variant: 'orange',
    title: 'Trap-Neuter-Return (TNR)',
    note: 'Must be in trap with weight noted. Includes ear tip, pain injection, antibiotic injection, HCP and rabies.',
    rows: [
      { service: 'TNR (base)', price: '$85' },
      { service: 'No weight on trap', price: '$25' },
      { service: 'TNR pregnant', price: 'Additional $25' },
    ],
  },
  {
    id: 'vaccines',
    variant: 'blue-light',
    title: 'Vaccines',
    note: 'Office visit required for vaccines.',
    rows: [
      { service: 'Office visit', price: '$10' },
      { service: 'Canine — Bordetella intranasal', price: '$20' },
      { service: 'Canine — Leptospirosis', price: '$25' },
      { service: 'Canine — DAPP', price: '$15' },
      { service: 'Canine — Rabies 1 yr / 3 yr', price: '$20' },
      { service: 'Feline — HCP', price: '$15' },
      { service: 'Feline — Leukemia', price: '$25' },
      { service: 'Feline — FeLV/FIV test', price: '$30' },
      { service: 'Feline — Rabies 1 yr', price: '$20' },
    ],
  },
  {
    id: 'other',
    variant: 'gray',
    title: 'Other Services',
    rows: [
      { service: 'Microchipping', price: '$8' },
      { service: 'Selarid feline topical flea prevention', price: '$15' },
      { service: 'Para-Defense K9 topical flea prevention', price: '$15' },
      { service: 'K9 dewormer Vibrantal 6–25 lbs', price: '$10' },
      { service: 'K9 dewormer Vibrantal 25.1–100 lbs', price: '$20' },
      { service: 'Feline dewormer Praziquantel injectable', price: '$15' },
      { service: 'K9/feline 5.9 lbs and under dewormer Pyrantel pomoate', price: '$8' },
      { service: 'Medical waste fee', price: '$4.50' },
    ],
  },
]

export default function PricingPage() {
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

      <main className="relative max-w-3xl mx-auto px-3 py-6 md:px-4 md:py-12">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 md:p-8">
          <Link
            href="/book"
            className="inline-flex items-center gap-2 text-sm md:text-base text-gray-600 hover:text-apl-blue mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="Animal Protection League"
              width={220}
              height={110}
              className="w-36 md:w-52 h-auto object-contain"
            />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              Low-Cost Price List
            </h1>
            <p className="text-apl-blue-light font-medium">
              Evaluations for free services available
            </p>
            <p className="mt-1 text-sm text-gray-500">Fees may apply. Not a quote.</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 mb-8 shadow-sm">
          <div className="flex flex-col gap-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0 text-apl-blue" />
              <span>1409 West Oak St., Stockton 95203</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 shrink-0 text-apl-blue" />
              <a href="tel:+12094204776" className="text-apl-blue hover:underline">(209) 420-4776</a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 shrink-0 text-apl-blue" />
              <a href="mailto:aplclinic@apl209.org" className="text-apl-blue hover:underline">aplclinic@apl209.org</a>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-600">By appointment only. Donation-based.</p>
          <p className="mt-2 text-sm text-gray-600">Free evaluations 9–11 a.m. Tue–Thu, or call.</p>
        </div>

        <div className="mb-8">
          <p className="text-sm text-gray-600 mb-3">Click to expand.</p>
          <PricingAccordion sections={PRICING_SECTIONS} />
        </div>

        <section className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm mb-8">
          <h2 className="font-semibold text-gray-900 mb-3">More information</h2>
          <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
            <li>Rabies proof or vaccination required at alter surgery.</li>
            <li>Deposits: $50 dogs, $25 cats, $50 TNR (nonrefundable).</li>
            <li>3% credit card fee.</li>
            <li>No-show or &lt;48 hr reschedule: deposit forfeited.</li>
          </ul>
        </section>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/book"
              className="inline-flex justify-center px-6 py-3 bg-apl-primary hover:bg-apl-blue-dark text-white font-semibold rounded-lg transition-colors"
            >
              Request an Appointment
            </Link>
            <Link
              href="/book"
              className="inline-flex justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to home
            </Link>
          </div>

          <footer className="mt-10 text-center text-xs text-slate-400 space-y-1">
            <p>Animal Protection League — 1409 West Oak St., Stockton 95203</p>
            <p>Phone: (209) 420-4776</p>
            <p>
              <a href="https://apl209.org" target="_blank" rel="noopener noreferrer" className="text-apl-blue hover:underline">
                apl209.org
              </a>
            </p>
          </footer>
        </div>
      </main>
    </div>
  )
}