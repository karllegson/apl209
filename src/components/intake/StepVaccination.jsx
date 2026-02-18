'use client'

import {
  RadioGroup,
  YesNoButtons,
} from './FormWidgets'
import { useLanguage } from './LanguageContext'

const T = {
  en: {
    pet: 'Pet',
    rabiesCurrent: 'Is your pet current on their rabies vaccine?',
    yes: 'Yes',
    no: 'No',
    unknown: 'Unknown',
    rabiesProof: 'You must bring proof or a certificate of rabies vaccination to the clinic on the day of your appointment.',
    rabiesRequired: 'A current rabies vaccine is required for spay/neuter surgery. If your pet is not current, you can get the vaccine at the clinic on the day of the appointment ($20). Bring your pet and we will help you get them up to date.',
    exposed: 'Has your pet been exposed to parvo, distemper, or panleukopenia in the last 30 days?',
    fleasTicks: 'Does your pet currently have fleas or ticks?',
    temperament: "What's your pet's temperament? (e.g. friendly, nervous, may bite)",
    friendly: 'Friendly',
    nervous: 'Nervous',
    aggressive: 'Aggressive',
    fearful: 'Fearful / may bite',
  },
  es: {
    pet: 'Mascota',
    rabiesCurrent: '¿Su mascota tiene la vacuna contra la rabia al día?',
    yes: 'Sí',
    no: 'No',
    unknown: 'Desconocido',
    rabiesProof: 'Tiene que traer comprobante o certificado de vacuna contra la rabia el día de su cita.',
    rabiesRequired: 'La vacuna contra la rabia al día es obligatoria para la cirugía de esterilización o castración. Si no está al día, se la podemos aplicar aquí el día de la cita ($20). Traiga a su mascota y la ponemos al día.',
    exposed: '¿Su mascota ha estado expuesta a parvo, moquillo o panleucopenia en los últimos 30 días?',
    fleasTicks: '¿Su mascota tiene actualmente pulgas o garrapatas?',
    temperament: '¿Cuál es el temperamento de su mascota? (ej. amigable, nerviosa, puede morder)',
    friendly: 'Amigable',
    nervous: 'Nerviosa',
    aggressive: 'Agresiva',
    fearful: 'Miedosa / puede morder',
  },
}

export default function StepVaccination({ form, errors, updatePet }) {
  const { language } = useLanguage()
  const t = T[language] || T.en

  return (
    <div className="space-y-6">
      {form.pets.map((pet, i) => (
        <div
          key={i}
          className="rounded-md p-5 border border-gray-200 bg-white"
        >
          <h3 className="form-section-heading">
            {t.pet} {i + 1}{pet.pet_name ? ` (${pet.pet_name})` : ''}
          </h3>

          <div className="space-y-4 md:space-y-5">
            <RadioGroup
              label={t.rabiesCurrent}
              required
              options={[
                { value: 'yes', label: t.yes },
                { value: 'no', label: t.no },
                { value: 'unknown', label: t.unknown },
              ]}
              value={pet.rabies_vaccinated}
              onChange={(v) => updatePet(i, 'rabies_vaccinated', v)}
              error={errors[`pet_${i}_rabies_vaccinated`]}
            />
            {pet.rabies_vaccinated === 'yes' && (
              <p className="text-xs text-gray-600 bg-gray-100 border border-gray-200 rounded-lg px-3 py-2">
                {t.rabiesProof}
              </p>
            )}
            {(pet.rabies_vaccinated === 'no' || pet.rabies_vaccinated === 'unknown') && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {t.rabiesRequired}
              </p>
            )}

            <YesNoButtons
              label={t.exposed}
              value={pet.exposed_to_diseases}
              onChange={(v) => updatePet(i, 'exposed_to_diseases', v)}
              options={[{ value: true, label: t.yes }, { value: false, label: t.no }]}
            />

            <YesNoButtons
              label={t.fleasTicks}
              required
              value={pet.has_fleas_ticks}
              onChange={(v) => updatePet(i, 'has_fleas_ticks', v)}
              error={errors[`pet_${i}_has_fleas_ticks`]}
              options={[{ value: true, label: t.yes }, { value: false, label: t.no }]}
            />

            <RadioGroup
              label={t.temperament}
              required
              options={[
                { value: 'friendly', label: t.friendly },
                { value: 'nervous', label: t.nervous },
                { value: 'aggressive', label: t.aggressive },
                { value: 'fearful', label: t.fearful },
              ]}
              value={pet.vet_behavior}
              onChange={(v) => updatePet(i, 'vet_behavior', v)}
              error={errors[`pet_${i}_vet_behavior`]}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
