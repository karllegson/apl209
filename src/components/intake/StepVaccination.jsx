'use client'

import {
  RadioGroup,
  YesNoButtons,
} from './FormWidgets'

export default function StepVaccination({ form, errors, updatePet }) {
  return (
    <div className="space-y-6">
      {form.pets.map((pet, i) => (
        <div
          key={i}
          className="rounded-md p-5 border border-gray-200 bg-white"
        >
          <h3 className="form-section-heading">
            Pet {i + 1}{pet.pet_name ? ` (${pet.pet_name})` : ''}
          </h3>

          <div className="space-y-4 md:space-y-5">
            <RadioGroup
              label="Is your pet current on their rabies vaccine?"
              required
              options={[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
                { value: 'unknown', label: 'Unknown' },
              ]}
              value={pet.rabies_vaccinated}
              onChange={(v) => updatePet(i, 'rabies_vaccinated', v)}
              error={errors[`pet_${i}_rabies_vaccinated`]}
            />
            {pet.rabies_vaccinated === 'yes' && (
              <p className="text-xs text-gray-600 bg-gray-100 border border-gray-200 rounded-lg px-3 py-2">
                You must bring proof or a certificate of rabies vaccination to the clinic on the day of your appointment.
              </p>
            )}
            {(pet.rabies_vaccinated === 'no' || pet.rabies_vaccinated === 'unknown') && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                A current rabies vaccine is required for spay/neuter surgery. If your pet is not current, you can get the vaccine at the clinic on the day of the appointment ($20). Bring your pet and we will help you get them up to date.
              </p>
            )}

            <YesNoButtons
              label="Has your pet been exposed to parvo, distemper, or panleukopenia in the last 30 days?"
              value={pet.exposed_to_diseases}
              onChange={(v) => updatePet(i, 'exposed_to_diseases', v)}
            />

            <YesNoButtons
              label="Does your pet currently have fleas or ticks?"
              required
              value={pet.has_fleas_ticks}
              onChange={(v) => updatePet(i, 'has_fleas_ticks', v)}
              error={errors[`pet_${i}_has_fleas_ticks`]}
            />

            <RadioGroup
              label="What is your pet's temperament at the vet? (e.g. friendly, nervous, may bite)"
              required
              options={[
                { value: 'friendly', label: 'Friendly' },
                { value: 'nervous', label: 'Nervous' },
                { value: 'aggressive', label: 'Aggressive' },
                { value: 'fearful', label: 'Fearful / may bite' },
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
