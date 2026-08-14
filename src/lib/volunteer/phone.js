export function normalizePhone(input) {
  if (!input || typeof input !== 'string') return ''
  let digits = input.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.slice(1)
  }
  return digits
}

export function isValidPhone(input) {
  return normalizePhone(input).length === 10
}

export function isValidEmail(input) {
  if (!input || typeof input !== 'string') return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim())
}

/** One field that may be email or phone. */
export function parseContact(value) {
  const v = typeof value === 'string' ? value.trim() : ''
  if (!v) return { email: '', phone: '' }
  if (v.includes('@')) return { email: v.toLowerCase(), phone: '' }
  return { email: '', phone: v }
}

export function formatPhoneDisplay(normalized) {
  const digits = normalizePhone(normalized)
  if (digits.length !== 10) return normalized || ''
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}
