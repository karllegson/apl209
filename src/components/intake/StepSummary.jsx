'use client'

import { SectionTitle } from './FormWidgets'
import { calculateQuote } from '@/lib/quoteCalculator'
import { Calculator } from 'lucide-react'
import { useLanguage } from './LanguageContext'

const SERVICE_LABELS = {
  en: { spay_neuter: 'Spay & Neuter', vaccines: 'Vaccines only', wellness_other: 'Wellness / Other' },
  es: { spay_neuter: 'Esterilización y castración', vaccines: 'Solo vacunas', wellness_other: 'Bienestar / Otro' },
}

const VACCINE_LABELS = {
  office_visit: 'Office visit',
  canine_bordetella: 'Canine — Bordetella intranasal',
  canine_leptospirosis: 'Canine — Leptospirosis',
  canine_dapp: 'Canine — DAPP',
  canine_rabies: 'Canine — Rabies 1 yr / 3 yr',
  feline_hcp: 'Feline — HCP',
  feline_leukemia: 'Feline — Leukemia',
  feline_felv_fiv_test: 'Feline — FeLV/FIV test',
  feline_rabies: 'Feline — Rabies 1 yr',
}

const WELLNESS_LABELS = {
  microchip: 'Microchipping',
  nail_trim: 'Nail Trim',
  flea_selarid_feline: 'Selarid feline topical flea prevention',
  flea_para_defense_k9: 'Para-Defense K9 topical flea prevention',
  dewormer_k9_6_25: 'K9 dewormer Vibrantal 6–25 lbs',
  dewormer_k9_25_100: 'K9 dewormer Vibrantal 25.1–100 lbs',
  dewormer_feline_praziquantel: 'Feline dewormer Praziquantel injectable',
  dewormer_small_pyrantel: 'K9/feline 5.9 lbs and under dewormer Pyrantel pomoate',
}

function line(label, value) {
  if (value == null || value === '') return null
  return (
    <div key={label} className="flex justify-between gap-4 py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 text-sm shrink-0">{label}</span>
      <span className="text-gray-900 text-sm text-right">{String(value)}</span>
    </div>
  )
}

function boolVal(v, lang) {
  if (v === true) return lang === 'es' ? 'Sí' : 'Yes'
  if (v === false) return lang === 'es' ? 'No' : 'No'
  return v == null || v === '' ? '' : String(v)
}

export default function StepSummary({ form }) {
  const { language } = useLanguage()
  const serviceLabels = SERVICE_LABELS[language] || SERVICE_LABELS.en
  const serviceLabel = form.requested_service ? (serviceLabels[form.requested_service] || form.requested_service) : '—'
  const optionalVaccines = form.optional_vaccines || []
  const optionalWellness = form.optional_wellness_services || []

  const L = (() => {
    const en = { reviewIntro: "Please review everything below. When you're ready, click Submit at the bottom.", contactAddress: 'Contact & address', requestedService: 'Requested service', pet: 'Pet', optionalServices: 'Optional services', vaccines: 'Vaccines', wellness: 'Wellness', estimatedCost: 'Estimated cost (not a bill)', total: 'Total (estimate)', vetNote: 'Vet note', name: 'Name', phone: 'Phone', email: 'Email', address: 'Address', preferredContact: 'Preferred contact', howHeard: 'How did you hear about us?', species: 'Species', breed: 'Breed', color: 'Color', age: 'Age', weight: 'Weight', sex: 'Sex', inHeat: 'In heat', pregnant: 'Pregnant', sickInjured: 'Sick or injured?', medicalConditions: 'Medical conditions', previousSurgeries: 'Previous surgeries?', drugReactions: 'Drug/vaccine reactions?', currentMeds: 'Current medications?', rabiesCurrent: 'Rabies current?', fleasTicks: 'Fleas/ticks?', petTemperament: 'Pet temperament', unknown: 'Unknown', dog: 'Dog', cat: 'Cat', noneSelected: 'None selected', quoteDisclaimer: 'This is an idea of what you might expect based on your selections. Final cost is determined at the clinic. Fees may apply.', deposit: 'Deposit', depositAcknowledged: 'Deposit acknowledged', cardLast4: 'Card (last 4)', expiry: 'Expiry', billingZip: 'Billing ZIP', signature: 'Signature', signed: 'Signed', legalAccepted: 'Legal acknowledgements accepted' }
    const es = { reviewIntro: 'Revise todo lo siguiente. Cuando esté listo, oprima Enviar al final.', contactAddress: 'Contacto y dirección', requestedService: 'Servicio solicitado', pet: 'Mascota', optionalServices: 'Servicios opcionales', vaccines: 'Vacunas', wellness: 'Bienestar', estimatedCost: 'Costo estimado (no es una factura)', total: 'Total (estimado)', vetNote: 'Nota para el veterinario', name: 'Nombre', phone: 'Teléfono', email: 'Correo', address: 'Dirección', preferredContact: 'Contacto preferido', howHeard: '¿Cómo se enteró de nosotros?', species: 'Especie', breed: 'Raza', color: 'Color', age: 'Edad', weight: 'Peso', sex: 'Sexo', inHeat: 'En celo', pregnant: 'Embarazada', sickInjured: '¿Enfermo o lesionado?', medicalConditions: 'Condiciones médicas', previousSurgeries: '¿Cirugías previas?', drugReactions: '¿Reacciones a medicamentos/vacunas?', currentMeds: '¿Medicamentos actuales?', rabiesCurrent: '¿Rabia al día?', fleasTicks: '¿Pulgas/garrapatas?', petTemperament: 'Temperamento', unknown: 'Desconocido', dog: 'Perro', cat: 'Gato', noneSelected: 'Ninguno seleccionado', quoteDisclaimer: 'Esto es una idea de lo que podría esperar según su selección. El costo final se determina en la clínica. Pueden aplicar cargos.', deposit: 'Depósito', depositAcknowledged: 'Depósito aceptado', cardLast4: 'Tarjeta (últimos 4)', expiry: 'Vencimiento', billingZip: 'CP / código postal', signature: 'Firma', signed: 'Firmado', legalAccepted: 'Reconocimientos legales aceptados' }
    return { en, es }[language] || en
  })()

  return (
    <div className="space-y-6">
      <p className="text-gray-600 text-sm">
        {L.reviewIntro}
      </p>

      {/* Owner */}
      <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
        <SectionTitle>{L.contactAddress}</SectionTitle>
        <div className="mt-2 space-y-0">
          {line(L.name, [form.owner_first_name, form.owner_last_name].filter(Boolean).join(' ') || '—')}
          {line(L.phone, form.owner_phone)}
          {line(L.email, form.owner_email)}
          {line(L.address, [form.street_address, form.city, form.state, form.zip_code].filter(Boolean).join(', ') || '—')}
          {line(L.preferredContact, form.preferred_contact)}
          {line(L.howHeard, form.how_heard)}
        </div>
      </div>

      {/* Requested service */}
      <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
        <SectionTitle>{L.requestedService}</SectionTitle>
        <p className="mt-2 text-gray-900 font-medium">{serviceLabel}</p>
      </div>

      {/* Pets */}
      {(form.pets || []).map((pet, i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
          <SectionTitle>{L.pet} {i + 1}{pet.pet_name ? ` (${pet.pet_name})` : ''}</SectionTitle>
          <div className="mt-2 space-y-0">
            {line(L.name, pet.pet_name)}
            {line(L.species, pet.type === 'dog' ? L.dog : pet.type === 'cat' ? L.cat : pet.type)}
            {line(L.breed, pet.breed)}
            {line(L.color, pet.color)}
            {line(L.age, pet.age)}
            {line(L.weight, pet.weight)}
            {line(L.sex, pet.sex)}
            {pet.sex === 'female' && line(L.inHeat, pet.in_heat_or_pregnant ? String(pet.in_heat_or_pregnant) : '—')}
            {pet.sex === 'female' && line(L.pregnant, pet.pregnant ? String(pet.pregnant) : '—')}
            {line(L.sickInjured, boolVal(pet.currently_sick_injured, language))}
            {pet.medical_conditions?.length > 0 && (() => {
              const list = [...(pet.medical_conditions || [])].filter((c) => c !== 'none')
              const text = list.length > 0 ? list.join(', ') + (pet.medical_conditions_other ? ` — ${pet.medical_conditions_other}` : '') : (language === 'es' ? 'Ninguna' : 'None')
              return line(L.medicalConditions, text)
            })()}
            {line(L.previousSurgeries, pet.previous_surgeries === true && pet.previous_surgeries_details ? (language === 'es' ? 'Sí' : 'Yes') + ` — ${pet.previous_surgeries_details}` : boolVal(pet.previous_surgeries, language))}
            {line(L.drugReactions, pet.drug_vaccine_reactions === true && pet.drug_vaccine_reactions_details ? (language === 'es' ? 'Sí' : 'Yes') + ` — ${pet.drug_vaccine_reactions_details}` : boolVal(pet.drug_vaccine_reactions, language))}
            {line(L.currentMeds, pet.current_medications === true && pet.current_medications_details ? (language === 'es' ? 'Sí' : 'Yes') + ` — ${pet.current_medications_details}` : boolVal(pet.current_medications, language))}
            {line(L.rabiesCurrent, pet.rabies_vaccinated === 'yes' ? (language === 'es' ? 'Sí' : 'Yes') : pet.rabies_vaccinated === 'no' ? (language === 'es' ? 'No' : 'No') : pet.rabies_vaccinated === 'unknown' ? L.unknown : '—')}
            {line(L.fleasTicks, boolVal(pet.has_fleas_ticks, language))}
            {line(L.petTemperament, pet.vet_behavior ? String(pet.vet_behavior).replace(/_/g, ' ') : '—')}
          </div>
        </div>
      ))}

      {/* Optional services */}
      <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
        <SectionTitle>{L.optionalServices}</SectionTitle>
        <div className="mt-2 space-y-1">
          {optionalVaccines.length > 0 ? (
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{L.vaccines}</p>
              <ul className="mt-0.5 list-inside list-disc text-sm text-gray-900">
                {optionalVaccines.map((id) => (
                  <li key={id}>{VACCINE_LABELS[id] || id}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {optionalWellness.length > 0 ? (
            <div className={optionalVaccines.length > 0 ? 'mt-2' : ''}>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{L.wellness}</p>
              <ul className="mt-0.5 list-inside list-disc text-sm text-gray-900">
                {optionalWellness.map((id) => (
                  <li key={id}>{WELLNESS_LABELS[id] || id}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {optionalVaccines.length === 0 && optionalWellness.length === 0 && (
            <p className="text-gray-500 text-sm">{L.noneSelected}</p>
          )}
        </div>
      </div>

      {/* Quote estimate */}
      {(() => {
        const { lines, total } = calculateQuote(form)
        if (lines.length === 0) return null
        return (
          <div className="rounded-lg border-2 border-apl-blue/20 bg-apl-blue/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-apl-blue shrink-0 -mt-1" aria-hidden />
              <SectionTitle>{L.estimatedCost}</SectionTitle>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              {L.quoteDisclaimer}
            </p>
            <div className="space-y-1">
              {lines.map((item, i) => (
                <div key={i} className="flex justify-between gap-4 py-1.5 border-b border-gray-200/80 last:border-0 text-sm">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="text-gray-900 font-medium shrink-0">
                    {item.amount != null ? `$${item.amount}` : '—'}
                  </span>
                </div>
              ))}
            </div>
            {total > 0 && (
              <div className="flex justify-between gap-4 mt-3 pt-3 border-t-2 border-apl-blue/20">
                <span className="font-semibold text-gray-800">{L.total}</span>
                <span className="font-bold text-apl-blue-dark">${total}</span>
              </div>
            )}
          </div>
        )
      })()}

      {/* Note for vet */}
      {form.vet_note?.trim() && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
          <SectionTitle>{L.vetNote}</SectionTitle>
          <p className="mt-2 text-gray-900 text-sm whitespace-pre-wrap">{form.vet_note.trim()}</p>
        </div>
      )}

      {/* Deposit */}
      <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
        <SectionTitle>{L.deposit}</SectionTitle>
        <div className="mt-2 space-y-0">
          {line(L.depositAcknowledged, form.deposit_acknowledged ? (language === 'es' ? 'Sí' : 'Yes') : '—')}
          {(form.deposit_card_last4 || (form.deposit_card_number && form.deposit_card_number.replace(/\D/g, '').slice(-4))) && line(L.cardLast4, `•••• ${form.deposit_card_last4 || form.deposit_card_number.replace(/\D/g, '').slice(-4)}`)}
          {form.deposit_card_expiry?.trim() && line(L.expiry, form.deposit_card_expiry)}
          {form.deposit_billing_zip?.trim() && line(L.billingZip, form.deposit_billing_zip)}
        </div>
      </div>

      {/* Signature */}
      <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
        <SectionTitle>{L.signature}</SectionTitle>
        <p className="mt-2 text-gray-900 text-sm">{form.signature ? `${L.signed}: ${form.signature}` : '—'}</p>
        {form.legal_acknowledged && <p className="mt-1 text-gray-500 text-xs">{L.legalAccepted}</p>}
      </div>
    </div>
  )
}
