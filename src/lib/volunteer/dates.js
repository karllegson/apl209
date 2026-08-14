/** Local calendar YYYY-MM-DD (Stockton / browser local). */
export function toDateStr(date) {
  const d = date instanceof Date ? date : new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDateStr(yyyyMmDd) {
  const [y, m, d] = String(yyyyMmDd).split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayStr() {
  return toDateStr(new Date())
}

export function isWeekday(date) {
  const d = date instanceof Date ? date : parseDateStr(date)
  const day = d.getDay()
  return day >= 1 && day <= 5
}

export function isPastDate(yyyyMmDd) {
  return yyyyMmDd < todayStr()
}

export function formatTimeDisplay(time) {
  if (!time) return ''
  const [hRaw, mRaw] = String(time).split(':')
  const h = Number(hRaw)
  const m = Number(mRaw)
  if (Number.isNaN(h) || Number.isNaN(m)) return String(time)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

export function normalizeTime(value) {
  if (!value || typeof value !== 'string') return ''
  const match = value.trim().match(/^(\d{1,2}):(\d{2})/)
  if (!match) return ''
  const h = Number(match[1])
  const m = Number(match[2])
  if (h < 0 || h > 23 || m < 0 || m > 59) return ''
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
