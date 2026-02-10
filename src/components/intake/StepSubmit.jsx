'use client'

import { AlertTriangle } from 'lucide-react'
import { SectionTitle } from './FormWidgets'

export default function StepSubmit({ form, errors, updateField }) {
  return (
    <div className="space-y-6">
      <SectionTitle>Optional Services &amp; Acknowledgements</SectionTitle>

      {/* Optional Services */}
      <div>
        <label className="form-section-heading block">
          Would you like any of the following?
        </label>
        <div className="space-y-2">
          {[
            {
              field: 'wants_microchip',
              label: 'Microchip',
              desc: 'Permanent pet identification — $8',
            },
            {
              field: 'wants_nail_trim',
              label: 'Nail Trim',
              desc: 'Quick nail trimming service',
            },
            {
              field: 'wants_flea_treatment',
              label: 'Flea Treatment',
              desc: 'Topical flea prevention (feline or K9) — $15',
            },
          ].map(({ field, label, desc }) => (
            <button
              key={field}
              type="button"
              onClick={() => updateField(field, !form[field])}
              className={`w-full flex items-center gap-3 p-3 md:p-4 rounded-lg border text-left transition-all cursor-pointer ${
                form[field]
                  ? 'bg-gray-50 border-gray-300'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
            >
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                  form[field]
                    ? 'bg-apl-blue border-apl-blue'
                    : 'bg-white border-gray-300'
                }`}
              >
                {form[field] && (
                  <span className="text-white text-xs font-bold">✓</span>
                )}
              </div>
              <div>
                <p className={`text-sm md:text-base font-medium ${form[field] ? 'text-gray-900' : 'text-gray-700'}`}>
                  {label}
                </p>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Legal Acknowledgements */}
      <div className="bg-amber-50 border border-amber-200 rounded-md p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h3 className="form-section-heading text-amber-900">
            Legal &amp; Safety Acknowledgements
          </h3>
        </div>

        <div className="space-y-2 text-sm text-amber-900 mb-5">
          <p>By signing below, I acknowledge and agree to the following:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>I confirm the information provided is accurate and complete</li>
            <li>I understand there are risks associated with surgery and anesthesia</li>
            <li>
              I understand pricing may change due to:
              <ul className="list-disc pl-5 mt-1 space-y-0.5">
                <li>Pregnancy</li>
                <li>Females in heat</li>
                <li>Undescended testicles</li>
                <li>Weight discrepancies</li>
              </ul>
            </li>
            <li>I authorize APL to provide emergency medical care if needed</li>
          </ul>
        </div>

        <button
          type="button"
          onClick={() =>
            updateField('legal_acknowledged', !form.legal_acknowledged)
          }
          className={`flex items-center gap-3 p-4 rounded-md border-2 w-full text-left transition-all cursor-pointer ${
            errors.legal_acknowledged
              ? 'border-red-400 bg-red-50'
              : form.legal_acknowledged
                ? 'border-apl-blue bg-apl-blue-50'
                : 'border-amber-300 bg-white hover:border-amber-400'
          }`}
        >
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
              form.legal_acknowledged
                ? 'bg-apl-blue border-apl-blue'
                : 'bg-white border-gray-300'
            }`}
          >
            {form.legal_acknowledged && (
              <span className="text-white text-xs font-bold">✓</span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-800">
            I agree to the above
          </p>
        </button>
        {errors.legal_acknowledged && (
          <p className="text-red-500 text-xs mt-2">
            {errors.legal_acknowledged}
          </p>
        )}
      </div>

      {/* Signature */}
      <div>
        <label className="form-field-label block mb-2 md:mb-2.5 text-gray-700">
          Signature (type your full name) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.signature}
          onChange={(e) => updateField('signature', e.target.value)}
          placeholder="Type your full legal name"
          className={`w-full intake-input px-3 md:px-4 py-2.5 md:py-3.5 rounded-lg border text-base md:text-lg transition-all ${
            errors.signature ? 'border-red-400 bg-red-50' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-apl-blue focus:border-apl-blue`}
        />
        {errors.signature && (
          <p className="text-red-500 text-xs mt-1">{errors.signature}</p>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
        <p className="text-base font-medium text-gray-700">
          ⚠️ Submitting this form does not schedule an appointment.
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Our team will review your submission and contact you to confirm a date.
        </p>
      </div>
    </div>
  )
}
