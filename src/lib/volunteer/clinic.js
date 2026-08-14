export const CLINIC = {
  name: 'Animal Protection League',
  address: '1409 West Oak St., Stockton, CA 95203',
  phoneDisplay: '209-494-4563',
  tel: '+12094944563',
  maps: 'https://maps.google.com/?q=1409+West+Oak+St,+Stockton,+CA+95203',
}

export const LAST_MINUTE_HOURS = 24

function pad2(n) {
  return String(n).padStart(2, '0')
}

function stampLocal(dt) {
  return `${dt.getFullYear()}${pad2(dt.getMonth() + 1)}${pad2(dt.getDate())}T${pad2(dt.getHours())}${pad2(dt.getMinutes())}00`
}

export function downloadShiftIcs({ date, time, hours = 3, isSpanish = false }) {
  const [y, m, d] = String(date).split('-').map(Number)
  const [hh, mm] = String(time || '08:00').split(':').map(Number)
  const start = new Date(y, m - 1, d, hh || 8, mm || 0)
  const end = new Date(start.getTime() + Math.max(1, Number(hours) || 3) * 60 * 60 * 1000)
  const title = isSpanish ? 'Voluntario de lavandería APL' : 'APL laundry volunteer'
  const desc = isSpanish
    ? `Pregunta en recepción. La lavandería queda atrás, junto a recuperación.\\n${CLINIC.phoneDisplay}`
    : `Ask the front desk. Laundry is in the back by recovery.\\n${CLINIC.phoneDisplay}`
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//APL209//Laundry Volunteer//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `DTSTART:${stampLocal(start)}`,
    `DTEND:${stampLocal(end)}`,
    `SUMMARY:${title}`,
    `LOCATION:${CLINIC.address}`,
    `DESCRIPTION:${desc}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `apl-laundry-${date}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function hoursUntilDate(yyyyMmDd, time = '08:00') {
  const [y, m, d] = String(yyyyMmDd).split('-').map(Number)
  const [hh, mm] = String(time).split(':').map(Number)
  const when = new Date(y, m - 1, d, hh || 8, mm || 0)
  return (when.getTime() - Date.now()) / (1000 * 60 * 60)
}

export function isSameCalendarDay(yyyyMmDd) {
  const today = new Date()
  const [y, m, d] = String(yyyyMmDd).split('-').map(Number)
  return today.getFullYear() === y && today.getMonth() + 1 === m && today.getDate() === d
}
