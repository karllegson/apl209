'use client'

import { User, Mail, Phone, MapPin } from 'lucide-react'
import { InputField, RadioGroup, SectionTitle } from './FormWidgets'

export default function StepOwner({ form, errors, updateField }) {
  return (
    <div className="space-y-5 md:space-y-6">
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
            label="Name"
            required
            icon={User}
            value={form.owner_name}
            onChange={(v) => updateField('owner_name', v)}
            placeholder="John Doe"
            error={errors.owner_name}
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


      {/* Location */}
      <div>
        <InputField
          label="City"
          required
          icon={MapPin}
          value={form.city}
          onChange={(v) => updateField('city', v)}
          placeholder="Stockton"
          error={errors.city}
        />
        <p className="text-xs text-gray-500 mt-1.5 ml-1">
          We are located in Stockton, CA
        </p>
      </div>
    </div>
  )
}
