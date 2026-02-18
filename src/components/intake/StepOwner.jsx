'use client'

import { User, Mail, Phone, MapPin } from 'lucide-react'
import { InputField, RadioGroup, SectionTitle } from './FormWidgets'
import { useLanguage } from './LanguageContext'

const T = {
  en: {
    depositBold: 'Deposit required for spay/neuter.',
    depositRest: ' We\'ll ask for it when we call to confirm. We\'re not collecting payment in this form.',
    clientStatus: 'Client status',
    newClient: 'I am a new client',
    returningClient: 'I am a returning client',
    primaryOwner: 'Primary Owner',
    firstName: 'First name',
    lastName: 'Last name',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    streetAddress: 'Street address',
    city: 'City',
    state: 'State',
    zipCode: 'ZIP code',
    preferredContact: 'Preferred contact method',
    howHeard: 'How did you hear about us?',
  },
  es: {
    depositBold: 'Se requiere depósito para esterilización/castración.',
    depositRest: ' Se lo pediremos cuando le llamemos para confirmar. No cobramos en este formulario.',
    clientStatus: 'Estado del cliente',
    newClient: 'Soy un cliente nuevo',
    returningClient: 'Soy un cliente recurrente',
    primaryOwner: 'Titular principal',
    firstName: 'Nombre',
    lastName: 'Apellido',
    phone: 'Teléfono',
    email: 'Correo electrónico',
    address: 'Dirección',
    streetAddress: 'Dirección',
    city: 'Ciudad',
    state: 'Estado',
    zipCode: 'Código postal',
    preferredContact: 'Método de contacto preferido',
    howHeard: '¿Cómo se enteró de nosotros?',
  },
}

export default function StepOwner({ form, errors, updateField }) {
  const { language } = useLanguage()
  const t = T[language] || T.en
  const showDepositNotice = form.requested_service === 'spay_neuter' || form.requested_service === 'tnr'

  return (
    <div className="space-y-5 md:space-y-6">
      {showDepositNotice && (
        <div className="rounded-lg border border-apl-primary/30 bg-apl-blue/5 px-4 py-3 text-sm text-gray-700">
          <strong className="text-apl-primary">{t.depositBold}</strong>{t.depositRest}
        </div>
      )}

      {/* Client status */}
      <div>
        <label className="form-section-heading block">
          {t.clientStatus} <span className="text-red-500">*</span>
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
            {t.newClient}
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
            {t.returningClient}
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
          {t.primaryOwner}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label={t.firstName}
            required
            icon={User}
            value={form.owner_first_name}
            onChange={(v) => updateField('owner_first_name', v)}
            placeholder="John"
            error={errors.owner_first_name}
          />
          <InputField
            label={t.lastName}
            required
            value={form.owner_last_name}
            onChange={(v) => updateField('owner_last_name', v)}
            placeholder="Doe"
            error={errors.owner_last_name}
          />
          <InputField
            label={t.phone}
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
            label={t.email}
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
          {t.address}
        </h3>
        <div className="space-y-4">
          <InputField
            label={t.streetAddress}
            required
            icon={MapPin}
            value={form.street_address}
            onChange={(v) => updateField('street_address', v)}
            placeholder="123 Main St., Apt 4"
            error={errors.street_address}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField
              label={t.city}
              required
              value={form.city}
              onChange={(v) => updateField('city', v)}
              placeholder="Stockton"
              error={errors.city}
            />
            <InputField
              label={t.state}
              required
              value={form.state}
              onChange={(v) => updateField('state', v)}
              placeholder="CA"
              error={errors.state}
            />
            <InputField
              label={t.zipCode}
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
          label={language === 'es' ? `${t.howHeard} (opcional)` : `${t.howHeard} (optional)`}
          value={form.how_heard}
          onChange={(v) => updateField('how_heard', v)}
          placeholder="e.g. Google, friend, flyer, social media"
          error={errors.how_heard}
        />
      </div>
    </div>
  )
}
