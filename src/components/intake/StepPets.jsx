'use client'

import Image from 'next/image'
import Link from 'next/link'
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
                  ? 'bg-apl-primary text-white border-apl-primary'
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
            Pet {i + 1}{pet.pet_name ? ` (${pet.pet_name})` : ''}
          </h3>

          <div className="space-y-6">
            {/* Pet name */}
            <InputField
              label="Pet Name"
              value={pet.pet_name}
              onChange={(v) => updatePet(i, 'pet_name', v)}
              placeholder="Luna"
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
                  className={`w-[72px] h-[72px] md:w-20 md:h-20 rounded-lg border-2 flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                    pet.type === 'dog'
                      ? 'bg-apl-primary text-white border-apl-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Image
                    src="/dog-icon.png"
                    alt=""
                    width={40}
                    height={40}
                    className="object-contain flex-shrink-0"
                  />
                  <span className="text-xs font-medium">Dog</span>
                </button>
                <button
                  type="button"
                  onClick={() => updatePet(i, 'type', 'cat')}
                  className={`w-[72px] h-[72px] md:w-20 md:h-20 rounded-lg border-2 flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                    pet.type === 'cat'
                      ? 'bg-apl-primary text-white border-apl-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Image
                    src="/cat-icon.png"
                    alt=""
                    width={40}
                    height={40}
                    className="object-contain flex-shrink-0"
                  />
                  <span className="text-xs font-medium">Cat</span>
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
                label="Color"
                value={pet.color}
                onChange={(v) => updatePet(i, 'color', v)}
                placeholder={pet.type === 'cat' ? 'Orange tabby' : 'Black'}
              />
              <InputField
                label="Age"
                required
                value={pet.age}
                onChange={(v) => updatePet(i, 'age', v)}
                placeholder="2 years"
                error={errors[`pet_${i}_age`]}
              />
              <div className="sm:col-span-2">
                <label className="form-field-label block mb-1.5 md:mb-2 text-gray-700">
                  Weight <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {pet.weight === 'unsure' ? (
                    <>
                      <span className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">Unsure — we&apos;ll weigh at clinic</span>
                      <button
                        type="button"
                        onClick={() => updatePet(i, 'weight', '')}
                        className="text-sm text-apl-primary hover:underline font-medium"
                      >
                        Enter weight
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={pet.weight}
                        onChange={(e) => updatePet(i, 'weight', e.target.value)}
                        placeholder="25 lbs"
                        className={`flex-1 min-w-[120px] intake-input px-3 md:px-4 py-2 md:py-3 rounded-lg border text-base transition-all ${
                          errors[`pet_${i}_weight`] ? 'border-red-400 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => updatePet(i, 'weight', 'unsure')}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap"
                      >
                        Unsure
                      </button>
                    </>
                  )}
                </div>
                {errors[`pet_${i}_weight`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`pet_${i}_weight`]}</p>
                )}
              </div>
              <InputField
                label="How long have you had this pet?"
                value={pet.how_long_owned}
                onChange={(v) => updatePet(i, 'how_long_owned', v)}
                placeholder="6 months"
              />
            </div>

            {/* House pet vs outdoor/TNR — No = TNR (trap required) */}
            <RadioGroup
              label="Is this a house pet?"
              required
              options={[
                { value: 'indoor', label: 'Yes' },
                { value: 'tnr', label: 'No' },
              ]}
              value={pet.pet_ownership}
              onChange={(v) => updatePet(i, 'pet_ownership', v)}
              error={errors[`pet_${i}_pet_ownership`]}
            />

            {/* TNR: info text when No (outdoor) selected */}
            {pet.pet_ownership === 'tnr' && (
              <div className="mt-2 p-3 rounded-lg border border-gray-200 bg-gray-100 text-xs text-gray-600">
                <p className="font-medium text-gray-700 mb-1.5">TNR — Trap-Neuter-Return (outdoor/community cats)</p>
                <p className="mb-1.5">
                  Outdoor cats behave differently than house pets. For everyone&apos;s safety (yours, our staff, and others at the clinic) and to meet legal requirements, cats must arrive in a humane trap with weight noted. Traps can be rented from us. You must come in person to sign a waiver.
                </p>
                <p className="mb-1.5">TNR includes: ear tip, pain injection, antibiotic injection, HCP, and rabies.</p>
                <p>
                  TNR pricing is different from house-pet pricing. <Link href="/pricing" target="_blank" rel="noopener noreferrer" className="text-apl-primary hover:underline font-medium">See our pricing page</Link> for current rates. This is for your information only.
                </p>
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

            {/* Base price: info text when species + sex selected */}
            {pet.type && pet.sex && (
              <div className="text-xs text-gray-600 bg-gray-50/80 border border-gray-100 rounded-lg px-3 py-2.5">
                <p className="font-medium text-gray-700 mb-1">Price reference</p>
                <p className="text-[11px] text-gray-500 mb-1">Varies by species, sex, weight. Reference only.</p>
                {pet.type === 'dog' && pet.sex === 'male' && (
                  <ul className="list-disc list-inside space-y-0.5 text-xs">
                    <li>1–25 lbs: <strong>$160</strong></li>
                    <li>26–50 lbs: <strong>$180</strong></li>
                    <li>51–75 lbs: <strong>$225</strong></li>
                    <li>76–99 lbs: <strong>$250</strong></li>
                    <li className="text-gray-500 mt-0.5">Includes cone and pain meds.</li>
                  </ul>
                )}
                {pet.type === 'dog' && pet.sex === 'female' && (
                  <ul className="list-disc list-inside space-y-0.5 text-xs">
                    <li>1–25 lbs: <strong>$185</strong></li>
                    <li>26–50 lbs: <strong>$210</strong></li>
                    <li>51–75 lbs: <strong>$275</strong></li>
                    <li>76–99 lbs: <strong>$350</strong></li>
                    <li className="text-gray-500 mt-0.5">Includes cone and pain meds.</li>
                  </ul>
                )}
                {pet.type === 'cat' && pet.sex === 'male' && (
                  <ul className="list-disc list-inside space-y-0.5 text-xs">
                    <li>Neuter: <strong>$75</strong></li>
                    <li className="text-gray-500">Includes exam, pain and antibiotic injection.</li>
                  </ul>
                )}
                {pet.type === 'cat' && pet.sex === 'female' && (
                  <ul className="list-disc list-inside space-y-0.5 text-xs">
                    <li>Spay: <strong>$95</strong></li>
                    <li className="text-gray-500">Includes exam, pain and antibiotic injection.</li>
                  </ul>
                )}
                <p className="text-[11px] text-gray-400 mt-1.5 pt-1.5 border-t border-gray-100">Fees may apply. Not a quote.</p>
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
                  <div className="text-xs text-amber-800 bg-amber-50/70 border border-amber-100 rounded-lg p-2.5 mt-2">
                    <p className="font-medium">Cryptorchid surgery may be required (undescended testicles). Estimated add-ons:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-amber-700 mt-0.5 text-xs">
                      <li>1 undescended testicle: <strong>$50–$200</strong></li>
                      <li>2 undescended testicles: <strong>$100–$400</strong></li>
                    </ul>
                    <p className="text-[11px] text-amber-600 mt-0.5">Reference only; not a quote.</p>
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
                  <div className="text-xs text-amber-800 bg-amber-50/70 border border-amber-100 rounded-lg p-2.5 mt-2">
                    <p className="font-medium">Estimated add-ons (reference only):</p>
                    {pet.type === 'cat' ? (
                      <ul className="list-disc list-inside space-y-0.5 text-amber-700 mt-0.5 text-xs">
                        <li>In heat: <strong>+$25</strong></li>
                        <li>Pregnant: <strong>+$50</strong></li>
                      </ul>
                    ) : (
                      <ul className="list-disc list-inside space-y-0.5 text-amber-700 mt-0.5 text-xs">
                        <li>Heat (0–50 lbs): <strong>+$50</strong></li>
                        <li>Heat (51–99 lbs): <strong>+$100</strong></li>
                        <li>Pregnancy: <strong>+$125</strong></li>
                      </ul>
                    )}
                    <p className="text-[11px] text-amber-600 mt-0.5">Not a quote.</p>
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
