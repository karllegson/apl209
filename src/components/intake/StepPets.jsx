'use client'

import { Dog, Cat } from 'lucide-react'
import { InputField, RadioGroup, SectionTitle } from './FormWidgets'

export default function StepPets({
  form,
  errors,
  updatePet,
  handleNumPetsChange,
}) {
  return (
    <div className="space-y-5 md:space-y-6">
      {/* Number of pets: 1, 2, or 3 */}
      <div>
        <label className="form-section-heading block mb-2">
          Number of pets <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2 md:gap-3">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleNumPetsChange(n)}
              className={`w-14 h-14 md:w-16 md:h-16 rounded-lg text-lg md:text-xl font-semibold transition-all cursor-pointer border ${
                form.num_pets === n
                  ? 'bg-apl-blue text-white border-apl-blue'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Per-pet sections */}
      {form.pets.map((pet, i) => (
        <div
          key={i}
          className="rounded-md p-4 md:p-5 border border-gray-200 bg-white"
        >
          <h3 className="form-section-heading">
            Pet #{i + 1}
            {pet.pet_name ? ` — ${pet.pet_name}` : ''}
          </h3>

          <div className="space-y-5">
            {/* Pet name */}
            <InputField
              label="Pet Name"
              value={pet.pet_name}
              onChange={(v) => updatePet(i, 'pet_name', v)}
              placeholder="Buddy"
            />

            {/* Select species */}
            <div>
              <label className="form-field-label block mb-2 md:mb-3 text-gray-700">
                Select species <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 md:gap-3">
                <button
                  type="button"
                  onClick={() => updatePet(i, 'type', 'dog')}
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-lg border-2 flex flex-col items-center justify-center gap-1 md:gap-1.5 transition-all cursor-pointer ${
                    pet.type === 'dog'
                      ? 'bg-apl-blue text-white border-apl-blue'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Dog className="w-6 h-6 md:w-7 md:h-7" />
                  <span className="text-xs md:text-sm font-medium">Dog</span>
                </button>
                <button
                  type="button"
                  onClick={() => updatePet(i, 'type', 'cat')}
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-lg border-2 flex flex-col items-center justify-center gap-1 md:gap-1.5 transition-all cursor-pointer ${
                    pet.type === 'cat'
                      ? 'bg-apl-blue text-white border-apl-blue'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Cat className="w-6 h-6 md:w-7 md:h-7" />
                  <span className="text-xs md:text-sm font-medium">Cat</span>
                </button>
              </div>
              {errors[`pet_${i}_type`] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[`pet_${i}_type`]}
                </p>
              )}
            </div>

            {/* Basic info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Breed"
                required
                value={pet.breed}
                onChange={(v) => updatePet(i, 'breed', v)}
                placeholder={pet.type === 'cat' ? 'Domestic Shorthair' : 'Labrador'}
                error={errors[`pet_${i}_breed`]}
              />
              <InputField
                label="Age"
                required
                value={pet.age}
                onChange={(v) => updatePet(i, 'age', v)}
                placeholder="2 years"
                error={errors[`pet_${i}_age`]}
              />
              <InputField
                label="Weight"
                required
                value={pet.weight}
                onChange={(v) => updatePet(i, 'weight', v)}
                placeholder="25 lbs"
                error={errors[`pet_${i}_weight`]}
              />
              <InputField
                label="How long owned?"
                value={pet.how_long_owned}
                onChange={(v) => updatePet(i, 'how_long_owned', v)}
                placeholder="6 months"
              />
            </div>

            {/* Indoor vs outdoor — outdoor is always TNR (trap required) */}
            <RadioGroup
              label="Indoor or outdoor?"
              required
              options={[
                { value: 'indoor', label: 'Indoor pet' },
                { value: 'tnr', label: 'Outdoor or community (TNR — trap required)' },
              ]}
              value={pet.pet_ownership}
              onChange={(v) => updatePet(i, 'pet_ownership', v)}
              error={errors[`pet_${i}_pet_ownership`]}
            />

            {/* TNR: only when they select outdoor */}
            {pet.pet_ownership === 'tnr' && (
              <div className="text-sm text-gray-700 bg-apl-blue-50 border border-apl-blue-200 rounded-lg p-3 space-y-1">
                <p className="font-medium text-gray-900">Outdoor or community animal (TNR)</p>
                <p>
                  The animal must be brought in a trap (you can rent one from us for <strong>$5</strong>).
                  Outdoor animals behave differently, so we require traps for everyone&apos;s safety.
                </p>
                <p className="text-gray-800 font-medium mt-2">TNR pricing:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-0.5">
                  <li>TNR (base): <strong>$85</strong></li>
                  <li>No weight on trap: <strong>$25</strong></li>
                  <li>TNR pregnant: additional <strong>$25</strong></li>
                </ul>
              </div>
            )}

            {/* Sex */}
            <RadioGroup
              label="Sex"
              required
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ]}
              value={pet.sex}
              onChange={(v) => updatePet(i, 'sex', v)}
              error={errors[`pet_${i}_sex`]}
            />

            {/* Base price reference */}
            {pet.type && pet.sex && (
              <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-3">
                <p className="font-medium text-gray-900 mb-1.5">Base price</p>
                {pet.type === 'dog' && pet.sex === 'male' && (
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>1–25 lbs: <strong>$160</strong></li>
                    <li>26–50 lbs: <strong>$180</strong></li>
                    <li>51–75 lbs: <strong>$225</strong></li>
                    <li>76–99 lbs: <strong>$250</strong></li>
                    <li className="text-gray-600 mt-1">Includes cone and pain meds.</li>
                  </ul>
                )}
                {pet.type === 'dog' && pet.sex === 'female' && (
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>1–25 lbs: <strong>$185</strong></li>
                    <li>26–50 lbs: <strong>$210</strong></li>
                    <li>51–75 lbs: <strong>$275</strong></li>
                    <li>76–99 lbs: <strong>$350</strong></li>
                    <li className="text-gray-600 mt-1">Includes cone and pain meds.</li>
                  </ul>
                )}
                {pet.type === 'cat' && pet.sex === 'male' && (
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Neuter: <strong>$75</strong></li>
                    <li className="text-gray-600">Includes exam, pain and antibiotic injection.</li>
                  </ul>
                )}
                {pet.type === 'cat' && pet.sex === 'female' && (
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Spay: <strong>$95</strong></li>
                    <li className="text-gray-600">Includes exam, pain and antibiotic injection.</li>
                  </ul>
                )}
              </div>
            )}

            {/* Male-specific */}
            {pet.sex === 'male' && (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
                <RadioGroup
                  label="Are both testicles descended?"
                  required
                  options={[
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' },
                    { value: 'unsure', label: 'Unsure' },
                  ]}
                  value={pet.testicles_descended}
                  onChange={(v) => updatePet(i, 'testicles_descended', v)}
                  error={errors[`pet_${i}_testicles_descended`]}
                />
                {(pet.testicles_descended === 'no' || pet.testicles_descended === 'unsure') && (
                  <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
                    <p className="font-medium">⚠️ Cryptorchid surgery may be required.</p>
                    <p>Undescended testicles require a more involved procedure.</p>
                    <p className="font-medium text-amber-800 mt-1.5">Additional pricing:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                      <li>1 undescended testicle: <strong>$50–$200</strong></li>
                      <li>2 undescended testicles: <strong>$100–$400</strong></li>
                      <li>Umbilical hernia repair: <strong>+$20</strong></li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Female-specific */}
            {pet.sex === 'female' && (
              <div className="rounded-lg p-4 space-y-3" style={{ backgroundColor: '#F8F8F8', borderColor: '#E0E0E0', borderWidth: '1px' }}>
                <RadioGroup
                  label="Is your pet currently in heat or pregnant?"
                  required
                  options={[
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' },
                    { value: 'unsure', label: 'Unsure' },
                  ]}
                  value={pet.in_heat_or_pregnant}
                  onChange={(v) => updatePet(i, 'in_heat_or_pregnant', v)}
                  error={errors[`pet_${i}_in_heat_or_pregnant`]}
                />
                <InputField
                  label="Last heat cycle or pregnancy date (if known)"
                  type="date"
                  value={pet.last_heat_pregnancy_date}
                  onChange={(v) =>
                    updatePet(i, 'last_heat_pregnancy_date', v)
                  }
                />
                {(pet.in_heat_or_pregnant === 'yes' ||
                  pet.in_heat_or_pregnant === 'unsure') && (
                  <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
                    <p className="font-medium">Additional fees may apply:</p>
                    {pet.type === 'cat' ? (
                      <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                        <li>In heat: <strong>+$25</strong></li>
                        <li>Pregnant: <strong>+$50</strong></li>
                      </ul>
                    ) : (
                      <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                        <li>Heat (0–50 lbs): <strong>+$50</strong></li>
                        <li>Heat (51–99 lbs): <strong>+$100</strong></li>
                        <li>Pregnancy: <strong>+$125</strong></li>
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
