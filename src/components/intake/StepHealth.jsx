'use client'

import {
  CheckboxGroup,
  YesNoButtons,
} from './FormWidgets'

const medicalConditions = [
  { value: 'heart', label: 'Heart' },
  { value: 'respiratory', label: 'Respiratory' },
  { value: 'seizures', label: 'Seizures' },
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'other', label: 'Other' },
]

export default function StepHealth({ form, errors, updatePet }) {
  return (
    <div className="space-y-6">
      {form.pets.map((pet, i) => (
        <div
          key={i}
          className="rounded-md p-5 border border-gray-200 bg-white"
        >
          <h3 className="form-section-heading">
            {pet.pet_name || `Pet ${i + 1}`}
          </h3>

          <div className="space-y-4 md:space-y-5">
            <YesNoButtons
              label="Is your pet currently sick or injured?"
              required
              value={pet.currently_sick_injured}
              onChange={(v) => updatePet(i, 'currently_sick_injured', v)}
              error={errors[`pet_${i}_currently_sick_injured`]}
            />

            <CheckboxGroup
              label="Any known medical conditions?"
              options={medicalConditions}
              values={pet.medical_conditions || []}
              onChange={(v) => updatePet(i, 'medical_conditions', v)}
            />

            {pet.medical_conditions.includes('other') && (
              <input
                type="text"
                value={pet.medical_conditions_other}
                onChange={(e) =>
                  updatePet(i, 'medical_conditions_other', e.target.value)
                }
                placeholder="Please describe the condition..."
                className="w-full intake-input px-3 py-2.5 rounded-lg border text-sm transition-all"
                style={{ borderColor: '#CCCCCC' }}
              />
            )}

            <YesNoButtons
              label="Any previous surgeries?"
              value={pet.previous_surgeries}
              onChange={(v) => updatePet(i, 'previous_surgeries', v)}
            />

            <YesNoButtons
              label="Any known drug or vaccine reactions?"
              value={pet.drug_vaccine_reactions}
              onChange={(v) => updatePet(i, 'drug_vaccine_reactions', v)}
            />

            <YesNoButtons
              label="Is your pet currently taking medications or supplements?"
              value={pet.current_medications}
              onChange={(v) => updatePet(i, 'current_medications', v)}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
