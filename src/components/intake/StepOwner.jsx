'use client'

import { User, Mail, Phone, MapPin } from 'lucide-react'
import { InputField, RadioGroup, SectionTitle } from './FormWidgets'

export default function StepOwner({ form, errors, updateField }) {
  return (
    <div className="space-y-5 md:space-y-6">
      <div className="rounded-lg border border-apl-primary/30 bg-apl-blue/5 px-4 py-3 text-sm text-gray-700">
        <strong className="text-apl-primary">Nonrefundable deposit required.</strong> Low-cost appointments: $50 dogs, $25 pet cats; TNR: $50. You&apos;ll enter payment details on the Review &amp; Sign step before submitting.
      </div>

      {/* Client status */}
      <div>
        <label className="form-section-heading block">
          Client status <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2 md:gap-3">
          <button
            type="button"
            onClick={() => updateField('is_returning_customer', false)}
            className={`flex items-center gap-1.5 md:gap-2 px-4 py-2.5 md:px-6 md:py-3 rounded-lg text-sm md:text-base font-medium transition-all cursor-pointer border ${
              form.is_returning_customer === false
                ? 'bg-apl-primary text-white border-apl-primary'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }`}
          >
            <User className="w-4 h-4 md:w-5 md:h-5" />
            I am a new client
          </button>
          <button
            type="button"
            onClick={() => updateField('is_returning_customer', true)}
            className={`flex items-center gap-1.5 md:gap-2 px-4 py-2.5 md:px-6 md:py-3 rounded-lg text-sm md:text-base font-medium transition-all cursor-pointer border ${
              form.is_returning_customer === true
                ? 'bg-apl-primary text-white border-apl-primary'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }`}
          >
            <User className="w-4 h-4 md:w-5 md:h-5" />
            I am a returning client
          </button>
        </div>
        {errors.is_returning_customer && (
          <p className="text-red-500 text-xs mt-2">
            {errors.is_returning_customer}
          </p>
        )}
      </div>

      {/* Primary Owner */}
      <div>
        <h3 className="form-section-heading">
          Primary Owner
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="First name"
            required
            icon={User}
            value={form.owner_first_name}
            onChange={(v) => updateField('owner_first_name', v)}
            placeholder="John"
            error={errors.owner_first_name}
          />
          <InputField
            label="Last name"
            required
            value={form.owner_last_name}
            onChange={(v) => updateField('owner_last_name', v)}
            placeholder="Doe"
            error={errors.owner_last_name}
          />
          <InputField
            label="Phone"
            required
            type="tel"
            icon={Phone}
            value={form.owner_phone}
            onChange={(v) => updateField('owner_phone', v)}
            placeholder="(209) 555-1234"
            error={errors.owner_phone}
            className="md:col-span-2"
          />
          <InputField
            label="Email"
            required
            type="email"
            icon={Mail}
            value={form.owner_email}
            onChange={(v) => updateField('owner_email', v)}
            placeholder="john@example.com"
            error={errors.owner_email}
            className="md:col-span-2"
          />
        </div>
      </div>


      {/* Full address */}
      <div>
        <h3 className="form-section-heading mb-3">
          Address
        </h3>
        <div className="space-y-4">
          <InputField
            label="Street address"
            required
            icon={MapPin}
            value={form.street_address}
            onChange={(v) => updateField('street_address', v)}
            placeholder="123 Main St., Apt 4"
            error={errors.street_address}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField
              label="City"
              required
              value={form.city}
              onChange={(v) => updateField('city', v)}
              placeholder="Stockton"
              error={errors.city}
            />
            <InputField
              label="State"
              required
              value={form.state}
              onChange={(v) => updateField('state', v)}
              placeholder="CA"
              error={errors.state}
            />
            <InputField
              label="ZIP code"
              required
              value={form.zip_code}
              onChange={(v) => updateField('zip_code', v)}
              placeholder="95203"
              error={errors.zip_code}
            />
          </div>
        </div>
      </div>

      {/* How did you hear about us — optional, after address */}
      <div>
        <InputField
          label="How did you hear about us? (optional)"
          value={form.how_heard}
          onChange={(v) => updateField('how_heard', v)}
          placeholder="e.g. Google, friend, flyer, social media"
          error={errors.how_heard}
        />
      </div>
    </div>
  )
}
