/**
 * Estimate quote for APL clinic based on form data.
 * Not a bill — for customer reference only. Fees may apply.
 */

function parseWeight(weight) {
  if (weight == null || typeof weight !== 'string') return null
  const s = weight.trim().toLowerCase()
  if (s === 'unsure' || s === '') return null
  const num = parseFloat(s.replace(/[^\d.]/g, ''), 10)
  return Number.isFinite(num) ? num : null
}

function dogWeightBand(lbs) {
  if (lbs == null) return null
  if (lbs <= 25) return { base: 185, label: '1–25 lbs' }
  if (lbs <= 50) return { base: 210, label: '26–50 lbs' }
  if (lbs <= 75) return { base: 275, label: '51–75 lbs' }
  if (lbs <= 99) return { base: 350, label: '76–99 lbs' }
  return { base: 350, label: '76–99 lbs' }
}

function maleDogWeightBand(lbs) {
  if (lbs == null) return null
  if (lbs <= 25) return { base: 160, label: '1–25 lbs' }
  if (lbs <= 50) return { base: 180, label: '26–50 lbs' }
  if (lbs <= 75) return { base: 225, label: '51–75 lbs' }
  if (lbs <= 99) return { base: 250, label: '76–99 lbs' }
  return { base: 250, label: '76–99 lbs' }
}

const VACCINE_PRICES = {
  office_visit: 10,
  canine_bordetella: 20,
  canine_leptospirosis: 25,
  canine_dapp: 15,
  canine_rabies: 20,
  feline_hcp: 15,
  feline_leukemia: 25,
  feline_felv_fiv_test: 30,
  feline_rabies: 20,
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

const WELLNESS_PRICES = {
  microchip: 8,
  nail_trim: 0,
  flea_selarid_feline: 15,
  flea_para_defense_k9: 15,
  dewormer_k9_6_25: 10,
  dewormer_k9_25_100: 20,
  dewormer_feline_praziquantel: 15,
  dewormer_small_pyrantel: 8,
}

const WELLNESS_LABELS = {
  microchip: 'Microchipping',
  nail_trim: 'Nail trim',
  flea_selarid_feline: 'Selarid feline flea prevention',
  flea_para_defense_k9: 'Para-Defense K9 flea prevention',
  dewormer_k9_6_25: 'K9 dewormer 6–25 lbs',
  dewormer_k9_25_100: 'K9 dewormer 25.1–100 lbs',
  dewormer_feline_praziquantel: 'Feline dewormer Praziquantel',
  dewormer_small_pyrantel: 'Dewormer 5.9 lbs and under',
}

export function calculateQuote(form) {
  const lines = []
  let total = 0
  const requested = form?.requested_service || ''
  const pets = Array.isArray(form?.pets) ? form.pets : []
  const optionalVaccines = Array.isArray(form?.optional_vaccines) ? form.optional_vaccines : []
  const optionalWellness = Array.isArray(form?.optional_wellness_services) ? form.optional_wellness_services : []

  // ——— Spay & Neuter ———
  if (requested === 'spay_neuter' && pets.length > 0) {
    pets.forEach((pet, i) => {
      const name = pet.pet_name ? ` (${pet.pet_name})` : ''
      const isTNR = pet.pet_ownership === 'tnr'
      const isDog = pet.type === 'dog'
      const isCat = pet.type === 'cat'
      const sex = (pet.sex || '').toLowerCase()
      const inHeat = (pet.in_heat_or_pregnant || '').toLowerCase()
      const pregnant = (pet.pregnant || '').toLowerCase()
      const weight = parseWeight(pet.weight)

      if (isTNR && isCat) {
        let tnrTotal = 85
        lines.push({ label: `Pet ${i + 1}${name} — TNR (base)`, amount: 85 })
        if (pregnant === 'yes' || pregnant === 'unsure') {
          lines.push({ label: `Pet ${i + 1} — TNR pregnant add-on`, amount: 25 })
          tnrTotal += 25
        } else if (inHeat === 'yes' || inHeat === 'unsure') {
          lines.push({ label: `Pet ${i + 1} — TNR in heat add-on`, amount: 25 })
          tnrTotal += 25
        }
        total += tnrTotal
        return
      }

      if (isDog && sex === 'female') {
        const band = dogWeightBand(weight)
        if (band) {
          lines.push({ label: `Pet ${i + 1}${name} — Female dog spay ${band.label}`, amount: band.base })
          total += band.base
          if (pregnant === 'yes' || pregnant === 'unsure') {
            lines.push({ label: `Pet ${i + 1} — Pregnancy add-on`, amount: 125 })
            total += 125
          } else if (inHeat === 'yes' || inHeat === 'unsure') {
            const addOn = weight !== null && weight <= 50 ? 50 : 100
            lines.push({ label: `Pet ${i + 1} — In heat add-on`, amount: addOn })
            total += addOn
          }
        } else {
          lines.push({ label: `Pet ${i + 1}${name} — Female dog spay (weight needed for quote)`, amount: null })
        }
      } else if (isDog && sex === 'male') {
        const band = maleDogWeightBand(weight)
        if (band) {
          lines.push({ label: `Pet ${i + 1}${name} — Male dog neuter ${band.label}`, amount: band.base })
          total += band.base
        } else {
          lines.push({ label: `Pet ${i + 1}${name} — Male dog neuter (weight needed for quote)`, amount: null })
        }
      } else if (isCat && sex === 'male') {
        lines.push({ label: `Pet ${i + 1}${name} — Cat neuter`, amount: 75 })
        total += 75
      } else if (isCat && sex === 'female') {
        lines.push({ label: `Pet ${i + 1}${name} — Cat spay`, amount: 95 })
        total += 95
        if (pregnant === 'yes' || pregnant === 'unsure') {
          lines.push({ label: `Pet ${i + 1} — Pregnancy add-on`, amount: 50 })
          total += 50
        } else if (inHeat === 'yes' || inHeat === 'unsure') {
          lines.push({ label: `Pet ${i + 1} — In heat add-on`, amount: 25 })
          total += 25
        }
      } else {
        lines.push({ label: `Pet ${i + 1}${name} — Spay/neuter (select species & sex for quote)`, amount: null })
      }
    })
  }

  // ——— Vaccines only ———
  if (requested === 'vaccines') {
    optionalVaccines.forEach((id) => {
      const price = VACCINE_PRICES[id]
      if (price != null) {
        lines.push({ label: VACCINE_LABELS[id] || id.replace(/_/g, ' '), amount: price })
        total += price
      }
    })
  }

  // ——— Wellness / Other ———
  if (requested === 'wellness_other') {
    optionalWellness.forEach((id) => {
      const price = WELLNESS_PRICES[id]
      const label = WELLNESS_LABELS[id] || id.replace(/_/g, ' ')
      if (price != null && price > 0) {
        lines.push({ label, amount: price })
        total += price
      } else if (price === 0 && id === 'nail_trim') {
        lines.push({ label: 'Nail trim (ask clinic)', amount: null })
      }
    })
  }

  // Add-on wellness when main service is spay/neuter (optional vaccines + wellness from form)
  if (requested === 'spay_neuter') {
    if (optionalVaccines.length > 0) {
      optionalVaccines.forEach((id) => {
        const price = VACCINE_PRICES[id]
        if (price != null) {
          lines.push({ label: `Vaccine: ${VACCINE_LABELS[id] || id.replace(/_/g, ' ')}`, amount: price })
          total += price
        }
      })
    }
    optionalWellness.forEach((id) => {
      const price = WELLNESS_PRICES[id]
      const label = WELLNESS_LABELS[id] || id.replace(/_/g, ' ')
      if (price != null && price > 0) {
        lines.push({ label, amount: price })
        total += price
      } else if (price === 0 && id === 'nail_trim') {
        lines.push({ label: 'Nail trim (ask clinic)', amount: null })
      }
    })
  }

  return { lines, total }
}
