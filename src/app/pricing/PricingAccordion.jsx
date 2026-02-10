'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

function PriceTable({ note, rows }) {
  return (
    <div className="border-t border-gray-200">
      {note && (
        <p className="px-4 py-2 text-sm text-gray-600 bg-gray-50 md:px-5">{note}</p>
      )}
      <table className="w-full text-left text-sm md:text-base">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/80">
            <th className="px-4 py-3 font-semibold text-gray-700 md:px-5">Service</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700 md:px-5 w-28 md:w-32">Price</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
            >
              <td className="px-4 py-3 text-gray-800 md:px-5">{row.service}</td>
              <td className="px-4 py-3 text-right font-medium text-gray-900 md:px-5 whitespace-nowrap">
                {row.price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* APL color scheme: blue and orange only */
const BOX_VARIANTS = {
  blue: 'border-l-apl-blue bg-white hover:bg-apl-blue-50/60 border-l-4',
  'blue-light': 'border-l-apl-blue-light bg-apl-blue-50/50 hover:bg-apl-blue-50 border-l-4',
  'blue-dark': 'border-l-apl-blue-dark bg-apl-blue-100/40 hover:bg-apl-blue-100/70 border-l-4',
  orange: 'border-l-apl-orange bg-[#fef8eb] hover:bg-[#fdf2d9] border-l-4',
  'orange-dark': 'border-l-apl-orange-dark bg-[#fef8eb]/80 hover:bg-[#fdf2d9] border-l-4',
  gray: 'border-l-gray-400 bg-gray-50 hover:bg-gray-100 border-l-4',
}

export function PricingSection({ id, title, note, rows, variant = 'gray', open, onToggle }) {
  const isOpen = open === id
  const variantClass = BOX_VARIANTS[variant] || BOX_VARIANTS.gray
  return (
    <div className={`overflow-hidden rounded-xl border border-gray-200 shadow-sm mb-3 ${variantClass}`}>
      <button
        type="button"
        onClick={() => onToggle(isOpen ? null : id)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 md:px-5 md:py-4 text-left transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-gray-900">{title}</span>
        <span className="shrink-0 text-gray-500">
          {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </span>
      </button>
      {isOpen && rows && (
        <div className="animate-fade-in">
          <PriceTable note={note} rows={rows} />
        </div>
      )}
    </div>
  )
}

export default function PricingAccordion({ sections, defaultOpenId = null }) {
  const [openId, setOpenId] = useState(defaultOpenId)
  return (
    <div className="space-y-0">
      {sections.map((section) => (
        <PricingSection
          key={section.id}
          {...section}
          variant={section.variant}
          open={openId}
          onToggle={setOpenId}
        />
      ))}
    </div>
  )
}
