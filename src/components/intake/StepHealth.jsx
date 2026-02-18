'use client'

import {
  CheckboxGroup,
  YesNoButtons,
} from './FormWidgets'
import { useLanguage } from './LanguageContext'

const MEDICAL_CONDITIONS_VALUES = [
  { value: 'none' },
  { value: 'heart' },
  { value: 'respiratory' },
  { value: 'seizures' },
  { value: 'diabetes' },
  { value: 'other' },
]

const T = {
  en: {
    pet: 'Pet',
    sickInjured: 'Is your pet currently sick or injured?',
    medicalConditions: 'Any known medical conditions?',
    none: 'None',
    heart: 'Heart',
    respiratory: 'Respiratory',
    seizures: 'Seizures',
    diabetes: 'Diabetes',
    other: 'Other',
    describeCondition: 'Please describe the condition...',
    previousSurgeries: 'Any previous surgeries?',
    describe: 'Please describe...',
    drugReactions: 'Any known drug or vaccine reactions?',
    currentMeds: 'Is your pet currently taking medications or supplements?',
    listMeds: 'Please list medications or supplements...',
    yes: 'Yes',
    no: 'No',
  },
  es: {
    pet: 'Mascota',
    sickInjured: '¿Su mascota está actualmente enferma o lesionada?',
    medicalConditions: '¿Condiciones médicas conocidas?',
    none: 'Ninguna',
    heart: 'Cardíaco',
    respiratory: 'Respiratorio',
    seizures: 'Convulsiones',
    diabetes: 'Diabetes',
    other: 'Otro',
    describeCondition: 'Describa la condición...',
    previousSurgeries: '¿Cirugías previas?',
    describe: 'Describa...',
    drugReactions: '¿Reacciones conocidas a medicamentos o vacunas?',
    currentMeds: '¿Su mascota está tomando medicamentos o suplementos?',
    listMeds: 'Indique medicamentos o suplementos...',
    yes: 'Sí',
    no: 'No',
  },
}

export default function StepHealth({ form, errors, updatePet }) {
  const { language } = useLanguage()
  const t = T[language] || T.en
  const medicalConditions = MEDICAL_CONDITIONS_VALUES.map(({ value }) => ({
    value,
    label: t[value] || value,
  }))

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
            <YesNoButtons
              label={t.sickInjured}
              required
              value={pet.currently_sick_injured}
              onChange={(v) => updatePet(i, 'currently_sick_injured', v)}
              error={errors[`pet_${i}_currently_sick_injured`]}
              options={[{ value: true, label: t.yes }, { value: false, label: t.no }]}
            />

            <CheckboxGroup
              label={t.medicalConditions}
              options={medicalConditions}
              values={pet.medical_conditions || []}
              onChange={(v) => {
                if (v.includes('none')) {
                  updatePet(i, 'medical_conditions', ['none'])
                  if (pet.medical_conditions_other) updatePet(i, 'medical_conditions_other', '')
                } else {
                  const next = v.filter((x) => x !== 'none')
                  updatePet(i, 'medical_conditions', next)
                }
              }}
            />

            {pet.medical_conditions?.includes('other') && (
              <input
                type="text"
                value={pet.medical_conditions_other}
                onChange={(e) =>
                  updatePet(i, 'medical_conditions_other', e.target.value)
                }
                placeholder={t.describeCondition}
                className="w-full intake-input px-3 py-2.5 rounded-lg border text-sm transition-all"
                style={{ borderColor: '#CCCCCC' }}
              />
            )}

            <YesNoButtons
              label={t.previousSurgeries}
              value={pet.previous_surgeries}
              onChange={(v) => updatePet(i, 'previous_surgeries', v)}
              options={[{ value: true, label: t.yes }, { value: false, label: t.no }]}
            />
            {pet.previous_surgeries === true && (
              <input
                type="text"
                value={pet.previous_surgeries_details ?? ''}
                onChange={(e) => updatePet(i, 'previous_surgeries_details', e.target.value)}
                placeholder={t.describe}
                className="w-full intake-input px-3 py-2.5 rounded-lg border border-gray-300 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-apl-blue focus:border-apl-blue"
              />
            )}

            <YesNoButtons
              label={t.drugReactions}
              value={pet.drug_vaccine_reactions}
              onChange={(v) => updatePet(i, 'drug_vaccine_reactions', v)}
              options={[{ value: true, label: t.yes }, { value: false, label: t.no }]}
            />
            {pet.drug_vaccine_reactions === true && (
              <input
                type="text"
                value={pet.drug_vaccine_reactions_details ?? ''}
                onChange={(e) => updatePet(i, 'drug_vaccine_reactions_details', e.target.value)}
                placeholder={t.describe}
                className="w-full intake-input px-3 py-2.5 rounded-lg border border-gray-300 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-apl-blue focus:border-apl-blue"
              />
            )}

            <YesNoButtons
              label={t.currentMeds}
              value={pet.current_medications}
              onChange={(v) => updatePet(i, 'current_medications', v)}
              options={[{ value: true, label: t.yes }, { value: false, label: t.no }]}
            />
            {pet.current_medications === true && (
              <input
                type="text"
                value={pet.current_medications_details ?? ''}
                onChange={(e) => updatePet(i, 'current_medications_details', e.target.value)}
                placeholder={t.listMeds}
                className="w-full intake-input px-3 py-2.5 rounded-lg border border-gray-300 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-apl-blue focus:border-apl-blue"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
