'use client'

import { SectionTitle } from './FormWidgets'

const SERVICE_LABELS = {
  spay_neuter: 'Spay & Neuter',
  vaccines: 'Vaccines only',
  wellness_other: 'Wellness / Other',
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

function boolVal(v) {
  if (v === true) return 'Yes'
  if (v === false) return 'No'
  return v == null || v === '' ? '' : String(v)
}

export default function StepSummary({ form }) {
  const serviceLabel = form.requested_service ? (SERVICE_LABELS[form.requested_service] || form.requested_service) : '—'
  const optionalVaccines = form.optional_vaccines || []
  const optionalWellness = form.optional_wellness_services || []

  return (
    <div className="space-y-6">
      <p className="text-gray-600 text-sm">
        Please review everything below. When you’re ready, click Submit at the bottom.
      </p>

      {/* Owner */}
      <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
        <SectionTitle>Contact &amp; address</SectionTitle>
        <div className="mt-2 space-y-0">
          {line('Name', [form.owner_first_name, form.owner_last_name].filter(Boolean).join(' ') || '—')}
          {line('Phone', form.owner_phone)}
          {line('Email', form.owner_email)}
          {line('Address', [form.street_address, form.city, form.state, form.zip_code].filter(Boolean).join(', ') || '—')}
          {line('Preferred contact', form.preferred_contact)}
          {line('How did you hear about us?', form.how_heard)}
        </div>
      </div>

      {/* Requested service */}
      <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
        <SectionTitle>Requested service</SectionTitle>
        <p className="mt-2 text-gray-900 font-medium">{serviceLabel}</p>
      </div>

      {/* Pets */}
      {(form.pets || []).map((pet, i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
          <SectionTitle>Pet {i + 1}{pet.pet_name ? ` (${pet.pet_name})` : ''}</SectionTitle>
          <div className="mt-2 space-y-0">
            {line('Name', pet.pet_name)}
            {line('Species', pet.type === 'dog' ? 'Dog' : pet.type === 'cat' ? 'Cat' : pet.type)}
            {line('Breed', pet.breed)}
            {line('Color', pet.color)}
            {line('Age', pet.age)}
            {line('Weight', pet.weight)}
            {line('Sex', pet.sex)}
            {line('Sick or injured?', boolVal(pet.currently_sick_injured))}
            {pet.medical_conditions?.length > 0 && (() => {
              const list = [...(pet.medical_conditions || [])].filter((c) => c !== 'none')
              const text = list.length > 0 ? list.join(', ') + (pet.medical_conditions_other ? ` — ${pet.medical_conditions_other}` : '') : 'None'
              return line('Medical conditions', text)
            })()}
            {line('Previous surgeries?', pet.previous_surgeries === true && pet.previous_surgeries_details ? `Yes — ${pet.previous_surgeries_details}` : boolVal(pet.previous_surgeries))}
            {line('Drug/vaccine reactions?', pet.drug_vaccine_reactions === true && pet.drug_vaccine_reactions_details ? `Yes — ${pet.drug_vaccine_reactions_details}` : boolVal(pet.drug_vaccine_reactions))}
            {line('Current medications?', pet.current_medications === true && pet.current_medications_details ? `Yes — ${pet.current_medications_details}` : boolVal(pet.current_medications))}
            {line('Rabies current?', pet.rabies_vaccinated === 'yes' ? 'Yes' : pet.rabies_vaccinated === 'no' ? 'No' : pet.rabies_vaccinated === 'unknown' ? 'Unknown' : '—')}
            {line('Fleas/ticks?', boolVal(pet.has_fleas_ticks))}
            {line('Pet temperament', pet.vet_behavior ? String(pet.vet_behavior).replace(/_/g, ' ') : '—')}
          </div>
        </div>
      ))}

      {/* Optional services */}
      <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
        <SectionTitle>Optional services</SectionTitle>
        <div className="mt-2 space-y-1">
          {optionalVaccines.length > 0 ? (
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Vaccines</p>
              <ul className="mt-0.5 list-inside list-disc text-sm text-gray-900">
                {optionalVaccines.map((id) => (
                  <li key={id}>{VACCINE_LABELS[id] || id}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {optionalWellness.length > 0 ? (
            <div className={optionalVaccines.length > 0 ? 'mt-2' : ''}>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Wellness &amp; other</p>
              <ul className="mt-0.5 list-inside list-disc text-sm text-gray-900">
                {optionalWellness.map((id) => (
                  <li key={id}>{WELLNESS_LABELS[id] || id}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {optionalVaccines.length === 0 && optionalWellness.length === 0 && (
            <p className="text-gray-500 text-sm">None selected</p>
          )}
        </div>
      </div>

      {/* Deposit */}
      <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
        <SectionTitle>Deposit</SectionTitle>
        <div className="mt-2 space-y-0">
          {line('Deposit acknowledged', form.deposit_acknowledged ? 'Yes' : '—')}
          {(form.deposit_card_last4 || (form.deposit_card_number && form.deposit_card_number.replace(/\D/g, '').slice(-4))) && line('Card (last 4)', `•••• ${form.deposit_card_last4 || form.deposit_card_number.replace(/\D/g, '').slice(-4)}`)}
          {form.deposit_card_expiry && line('Expiry', form.deposit_card_expiry)}
          {form.deposit_billing_zip && line('Billing ZIP', form.deposit_billing_zip)}
        </div>
      </div>

      {/* Signature */}
      <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
        <SectionTitle>Signature</SectionTitle>
        <p className="mt-2 text-gray-900 text-sm">{form.signature ? `Signed: ${form.signature}` : '—'}</p>
        {form.legal_acknowledged && <p className="mt-1 text-gray-500 text-xs">Legal acknowledgements accepted</p>}
      </div>
    </div>
  )
}
