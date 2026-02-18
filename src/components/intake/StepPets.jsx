'use client'

import Image from 'next/image'
import Link from 'next/link'
import { InputField, RadioGroup, SectionTitle } from './FormWidgets'
import { useLanguage } from './LanguageContext'

const T = {
  en: {
    numberOfPets: 'Number of pets',
    pet: 'Pet',
    petName: 'Pet Name',
    selectSpecies: 'Select species',
    dog: 'Dog',
    cat: 'Cat',
    breed: 'Breed',
    color: 'Color',
    age: 'Age',
    weight: 'Weight',
    sex: 'Sex',
    inHeat: 'Is your pet currently in heat?',
    pregnant: 'Is your pet pregnant?',
    lastHeatDate: 'Last heat cycle date (if known)',
    pregnancyDate: 'Pregnancy date (if known)',
    vetNote: 'Note for our vet team',
    vetNoteHelp: 'Anything you want us to know about your pet(s) or this visit? Optional.',
    vetNotePlaceholder: 'e.g. nervous at the vet, takes medication with food, prefers morning appointments...',
    yes: 'Yes',
    no: 'No',
    unsure: 'Unsure',
    male: 'Male',
    female: 'Female',
    testiclesDescended: 'Are both testicles descended?',
    ownedByYou: 'Do you own this pet?',
    ownedYes: 'Yes',
    ownedNo: 'No (TNR)',
    howLongOwned: 'How long have you had this pet?',
    addOnsRef: 'Estimated add-ons (reference only):',
    notAQuote: 'Not a quote.',
    seePricing: 'See our pricing page',
    tnrInfo: 'TNR includes: ear tip, pain injection, antibiotic injection, HCP, and rabies.',
    tnrPricing: 'TNR pricing is different from house-pet pricing.',
    forInfoOnly: 'This is for your information only.',
    forCurrentRates: 'for current rates.',
    variesBy: 'Varies by species, sex, weight. Reference only.',
    feesApply: 'Fees may apply. Not a quote.',
    cryptorchid: 'Cryptorchid surgery may be required (undescended testicles). Estimated add-ons:',
    housePet: 'Is this a house pet?',
    tnrTitle: 'TNR — Trap-Neuter-Return (outdoor/community cats)',
    tnrSafety: 'Outdoor cats behave differently than house pets. For everyone\'s safety (yours, our staff, and others at the clinic) and to meet legal requirements, cats must arrive in a humane trap with weight noted. Traps can be rented from us. You must come in person to sign a waiver.',
    enterWeight: 'Enter weight',
    unsureWeighAtClinic: "Unsure — we'll weigh at clinic",
    priceReference: 'Price reference',
    referenceOnlyNotQuote: 'Reference only; not a quote.',
  },
  es: {
    numberOfPets: 'Número de mascotas',
    pet: 'Mascota',
    petName: 'Nombre de la mascota',
    selectSpecies: 'Seleccione la especie',
    dog: 'Perro',
    cat: 'Gato',
    breed: 'Raza',
    color: 'Color',
    age: 'Edad',
    weight: 'Peso',
    sex: 'Sexo',
    inHeat: '¿Su mascota está actualmente en celo?',
    pregnant: '¿Su mascota está embarazada?',
    lastHeatDate: 'Última fecha de celo (si se conoce)',
    pregnancyDate: 'Fecha de embarazo (si se conoce)',
    vetNote: 'Nota para nuestro equipo veterinario',
    vetNoteHelp: '¿Algo que quiera que sepamos sobre su(s) mascota(s) o esta visita? Opcional.',
    vetNotePlaceholder: 'ej. nervioso en el veterinario, toma medicación con comida, prefiere citas por la mañana...',
    yes: 'Sí',
    no: 'No',
    unsure: 'No estoy seguro/a',
    male: 'Macho',
    female: 'Hembra',
    testiclesDescended: '¿Tiene ambos testículos descendidos?',
    ownedByYou: '¿Esta mascota es suya?',
    ownedYes: 'Sí',
    ownedNo: 'No (TNR)',
    howLongOwned: '¿Cuánto tiempo ha tenido esta mascota?',
    addOnsRef: 'Adicionales estimados (solo referencia):',
    notAQuote: 'No es una cotización.',
    seePricing: 'Ver lista de precios',
    tnrInfo: 'TNR incluye: corte de oreja, inyección para dolor, antibiótico, HCP y rabia.',
    tnrPricing: 'El precio TNR es distinto al de mascota de casa.',
    forInfoOnly: 'Solo para su información.',
    forCurrentRates: 'para tarifas actuales.',
    variesBy: 'Varía según especie, sexo y peso. Solo referencia.',
    feesApply: 'Pueden aplicar cargos. No es una cotización.',
    cryptorchid: 'Puede ser necesaria cirugía por criptorquidia (testículos no descendidos). Adicionales estimados:',
    housePet: '¿Es una mascota de casa?',
    tnrTitle: 'TNR — Capturar-Esterilizar-Devolver (gatos callejeros/comunitarios)',
    tnrSafety: 'Los gatos callejeros se comportan distinto a las mascotas de casa. Para la seguridad de todos (usted, el personal y los demás en la clínica) y por requisito legal, los gatos tienen que llegar en jaula trampa con el peso anotado. Con nosotros puede rentar trampa. Tiene que venir en persona a firmar un formato.',
    enterWeight: 'Ingresar peso',
    unsureWeighAtClinic: 'No estoy seguro — lo pesamos en la clínica',
    priceReference: 'Referencia de precios',
    referenceOnlyNotQuote: 'Solo referencia; no es una cotización.',
  },
}

export default function StepPets({
  form,
  errors,
  updatePet,
  updateField,
  handleNumPetsChange,
  shortFlow = false,
}) {
  const { language } = useLanguage()
  const isSpanish = language === 'es'
  const t = T[language] || T.en

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Number of pets: 1, 2, or 3 */}
      <div>
        <label className="form-section-heading block mb-2">
          {t.numberOfPets} <span className="text-red-500">*</span>
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
            {t.pet} {i + 1}{pet.pet_name ? ` (${pet.pet_name})` : ''}
          </h3>

          <div className="space-y-6">
            {/* Pet name */}
            <InputField
              label={t.petName}
              value={pet.pet_name}
              onChange={(v) => updatePet(i, 'pet_name', v)}
              placeholder="Luna"
            />

            {/* Select species */}
            <div>
              <label className="form-field-label block mb-2 md:mb-3 text-gray-700">
                {t.selectSpecies} <span className="text-red-500">*</span>
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
                  <span className="text-xs font-medium">{t.dog}</span>
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
                  <span className="text-xs font-medium">{t.cat}</span>
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
                label={t.breed}
                required
                value={pet.breed}
                onChange={(v) => updatePet(i, 'breed', v)}
                placeholder={pet.type === 'cat' ? 'Domestic Shorthair' : 'Labrador'}
                error={errors[`pet_${i}_breed`]}
              />
              <InputField
                label={t.color}
                value={pet.color}
                onChange={(v) => updatePet(i, 'color', v)}
                placeholder={pet.type === 'cat' ? 'Orange tabby' : 'Black'}
              />
              <InputField
                label={t.age}
                required
                value={pet.age}
                onChange={(v) => updatePet(i, 'age', v)}
                placeholder="2 years"
                error={errors[`pet_${i}_age`]}
              />
              {!shortFlow && (
              <>
              <div className="sm:col-span-2">
                <label className="form-field-label block mb-1.5 md:mb-2 text-gray-700">
                  {t.weight} <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {pet.weight === 'unsure' ? (
                    <>
                      <span className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">{t.unsureWeighAtClinic}</span>
                      <button
                        type="button"
                        onClick={() => updatePet(i, 'weight', '')}
                        className="text-sm text-apl-primary hover:underline font-medium"
                      >
                        {t.enterWeight}
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
                        {t.unsure}
                      </button>
                    </>
                  )}
                </div>
                {errors[`pet_${i}_weight`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`pet_${i}_weight`]}</p>
                )}
              </div>
              <InputField
                label={t.howLongOwned}
                value={pet.how_long_owned}
                onChange={(v) => updatePet(i, 'how_long_owned', v)}
                placeholder="6 months"
              />
              </>
              )}
            </div>

            {!shortFlow && (
            <>
            {/* House pet vs outdoor/TNR — No = TNR (trap required) */}
            <RadioGroup
              label={t.housePet}
              required
              options={[
                { value: 'indoor', label: t.yes },
                { value: 'tnr', label: t.no },
              ]}
              value={pet.pet_ownership}
              onChange={(v) => updatePet(i, 'pet_ownership', v)}
              error={errors[`pet_${i}_pet_ownership`]}
            />

            {/* TNR: info text when No (outdoor) selected */}
            {pet.pet_ownership === 'tnr' && (
              <div className="mt-2 p-3 rounded-lg border border-gray-200 bg-gray-100 text-xs text-gray-600">
                <p className="font-medium text-gray-700 mb-1.5">{t.tnrTitle}</p>
                <p className="mb-1.5">
                  {t.tnrSafety}
                </p>
                <p className="mb-1.5">{t.tnrInfo}</p>
                <p>
                  {t.tnrPricing} <Link href="/pricing" target="_blank" rel="noopener noreferrer" className="text-apl-primary hover:underline font-medium">{t.seePricing}</Link> {t.forCurrentRates} {t.forInfoOnly}
                </p>
              </div>
            )}

            {/* Sex */}
            <RadioGroup
              label={t.sex}
              required
              options={[
                { value: 'male', label: t.male },
                { value: 'female', label: t.female },
              ]}
              value={pet.sex}
              onChange={(v) => updatePet(i, 'sex', v)}
              error={errors[`pet_${i}_sex`]}
            />

            {/* Base price: info text when species + sex selected */}
            {pet.type && pet.sex && (
              <div className="text-xs text-gray-600 bg-gray-50/80 border border-gray-100 rounded-lg px-3 py-2.5">
                <p className="font-medium text-gray-700 mb-1">{t.priceReference}</p>
                <p className="text-[11px] text-gray-500 mb-1">{t.variesBy}</p>
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
                <p className="text-[11px] text-gray-400 mt-1.5 pt-1.5 border-t border-gray-100">{t.feesApply}</p>
              </div>
            )}

            {/* Male-specific */}
            {pet.sex === 'male' && (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
                <RadioGroup
                  label={t.testiclesDescended}
                  required
                  options={[
                    { value: 'yes', label: t.yes },
                    { value: 'no', label: t.no },
                    { value: 'unsure', label: t.unsure },
                  ]}
                  value={pet.testicles_descended}
                  onChange={(v) => updatePet(i, 'testicles_descended', v)}
                  error={errors[`pet_${i}_testicles_descended`]}
                />
                {(pet.testicles_descended === 'no' || pet.testicles_descended === 'unsure') && (
                  <div className="text-xs text-amber-800 bg-amber-50/70 border border-amber-100 rounded-lg p-2.5 mt-2">
                    <p className="font-medium">{t.cryptorchid}</p>
                    <ul className="list-disc list-inside space-y-0.5 text-amber-700 mt-0.5 text-xs">
                      <li>1 undescended testicle: <strong>$50–$200</strong></li>
                      <li>2 undescended testicles: <strong>$100–$400</strong></li>
                    </ul>
                    <p className="text-[11px] text-amber-600 mt-0.5">{t.referenceOnlyNotQuote}</p>
                  </div>
                )}
              </div>
            )}

            {/* Female-specific */}
            {pet.sex === 'female' && (
              <div className="rounded-lg p-4 space-y-3" style={{ backgroundColor: '#F8F8F8', borderColor: '#E0E0E0', borderWidth: '1px' }}>
                <RadioGroup
                  label={t.inHeat}
                  required
                  options={[
                    { value: 'yes', label: t.yes },
                    { value: 'no', label: t.no },
                    { value: 'unsure', label: t.unsure },
                  ]}
                  value={pet.in_heat_or_pregnant}
                  onChange={(v) => updatePet(i, 'in_heat_or_pregnant', v)}
                  error={errors[`pet_${i}_in_heat_or_pregnant`]}
                />
                <RadioGroup
                  label={t.pregnant}
                  required
                  options={[
                    { value: 'yes', label: t.yes },
                    { value: 'no', label: t.no },
                    { value: 'unsure', label: t.unsure },
                  ]}
                  value={pet.pregnant}
                  onChange={(v) => updatePet(i, 'pregnant', v)}
                  error={errors[`pet_${i}_pregnant`]}
                />
                <InputField
                  label={t.lastHeatDate}
                  type="date"
                  value={pet.last_heat_date ?? pet.last_heat_pregnancy_date ?? ''}
                  onChange={(v) => updatePet(i, 'last_heat_date', v)}
                />
                <InputField
                  label={t.pregnancyDate}
                  type="date"
                  value={pet.pregnancy_date ?? ''}
                  onChange={(v) => updatePet(i, 'pregnancy_date', v)}
                />
                {(pet.in_heat_or_pregnant === 'yes' || pet.in_heat_or_pregnant === 'unsure' || pet.pregnant === 'yes' || pet.pregnant === 'unsure') && (
                  <div className="text-xs text-amber-800 bg-amber-50/70 border border-amber-100 rounded-lg p-2.5 mt-2">
                    <p className="font-medium">{t.addOnsRef}</p>
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
                    <p className="text-[11px] text-amber-600 mt-0.5">{t.notAQuote}</p>
                  </div>
                )}
              </div>
            )}
            </>
            )}
          </div>
        </div>
      ))}

      {/* Note for vet team */}
      <div className="rounded-md p-4 md:p-5 border border-gray-200 bg-white">
        <label className="form-section-heading block mb-2" htmlFor="vet_note">
          {t.vetNote}
        </label>
        <p className="text-sm text-gray-500 mb-2">
          {t.vetNoteHelp}
        </p>
        <textarea
          id="vet_note"
          value={form.vet_note ?? ''}
          onChange={(e) => updateField?.('vet_note', e.target.value)}
          placeholder={t.vetNotePlaceholder}
          rows={4}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-apl-primary/30 focus:border-apl-primary resize-y min-h-[80px]"
        />
      </div>
    </div>
  )
}
