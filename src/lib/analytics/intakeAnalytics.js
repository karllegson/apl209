const HOW_HEARD_CATEGORIES = [
  {
    id: 'google',
    label: 'Google / search',
    patterns: [/google/i, /\bgmb\b/i, /search engine/i, /online search/i, /web search/i, /searched/i],
  },
  {
    id: 'social',
    label: 'Social media',
    patterns: [/facebook/i, /\bfb\b/i, /instagram/i, /\binsta\b/i, /tiktok/i, /social media/i, /twitter/i, /nextdoor/i, /youtube/i, /snapchat/i],
  },
  {
    id: 'friend',
    label: 'Friend / referral',
    patterns: [/friend/i, /family/i, /neighbor/i, /neighbour/i, /referr/i, /word of mouth/i, /someone told/i, /recommended/i, /recommendation/i, /coworker/i, /co-worker/i],
  },
  {
    id: 'vet',
    label: 'Vet / clinic',
    patterns: [/vet\b/i, /veterinar/i, /clinic/i, /hospital/i, /banfield/i, /petsmart/i, /petco/i, /doctor/i],
  },
  {
    id: 'flyer',
    label: 'Flyer / print',
    patterns: [/flyer/i, /postcard/i, /newspaper/i, /magazine/i, /billboard/i, /sign\b/i, /poster/i, /print/i, /mailer/i, /brochure/i],
  },
  {
    id: 'website',
    label: 'Website / online',
    patterns: [/website/i, /web site/i, /online/i, /\.com/i, /animal protection/i, /\bapl\b/i],
  },
]

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function normalizeText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ')
}

export function categorizeHowHeard(rawValue) {
  const text = normalizeText(rawValue)
  if (!text) return { id: 'not_answered', label: 'Not answered' }

  for (const category of HOW_HEARD_CATEGORIES) {
    if (category.patterns.some((pattern) => pattern.test(text))) {
      return { id: category.id, label: category.label }
    }
  }

  return { id: 'other', label: 'Other' }
}

function getPacificParts(isoString) {
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return null

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: 'numeric',
    hour12: false,
    weekday: 'short',
  })

  const parts = formatter.formatToParts(date)
  const hour = Number(parts.find((part) => part.type === 'hour')?.value)
  const weekday = parts.find((part) => part.type === 'weekday')?.value

  if (Number.isNaN(hour) || !weekday) return null

  const dayIndex = DAY_LABELS.indexOf(weekday)
  return { hour, dayIndex: dayIndex >= 0 ? dayIndex : 0 }
}

function incrementMap(map, key, amount = 1) {
  map.set(key, (map.get(key) || 0) + amount)
}

function mapToSortedList(map, limit = 10) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }))
}

export function buildIntakeAnalytics(appointments = []) {
  const statusCounts = {
    total: appointments.length,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    attempted: 0,
    noShow: 0,
    tnr: 0,
  }

  const howHeardCategories = new Map()
  const howHeardExamples = new Map()
  const howHeardRaw = new Map()
  const hourCounts = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }))
  const dayCounts = DAY_LABELS.map((label, day) => ({ day, label, count: 0 }))
  const cityCounts = new Map()
  const zipCounts = new Map()
  const stateCounts = new Map()

  for (const appointment of appointments) {
    const status = appointment.status || 'pending'
    if (status === 'no-show') statusCounts.noShow += 1
    else if (Object.prototype.hasOwnProperty.call(statusCounts, status)) statusCounts[status] += 1

    const howHeardText = normalizeText(appointment.how_heard)
    if (howHeardText) incrementMap(howHeardRaw, howHeardText)

    const category = categorizeHowHeard(howHeardText)
    incrementMap(howHeardCategories, category.label)
    if (howHeardText) {
      const examples = howHeardExamples.get(category.label) || []
      if (examples.length < 3 && !examples.includes(howHeardText)) {
        examples.push(howHeardText)
        howHeardExamples.set(category.label, examples)
      }
    }

    const parts = getPacificParts(appointment.created_at)
    if (parts) {
      hourCounts[parts.hour].count += 1
      dayCounts[parts.dayIndex].count += 1
    }

    const city = normalizeText(appointment.city)
    const zip = normalizeText(appointment.zip_code)
    const state = normalizeText(appointment.state)

    if (city) incrementMap(cityCounts, city)
    if (zip) incrementMap(zipCounts, zip)
    if (state) incrementMap(stateCounts, state)
  }

  const peakHour = [...hourCounts].sort((a, b) => b.count - a.count)[0] || { hour: 0, count: 0 }
  const peakDay = [...dayCounts].sort((a, b) => b.count - a.count)[0] || dayCounts[0]

  const howHeardList = [...howHeardCategories.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => ({
      label,
      count,
      percent: appointments.length ? Math.round((count / appointments.length) * 100) : 0,
      examples: howHeardExamples.get(label) || [],
    }))

  return {
    statusCounts,
    howHeard: {
      categories: howHeardList,
      topAnswers: mapToSortedList(howHeardRaw, 8),
    },
    timing: {
      byHour: hourCounts,
      byDay: dayCounts,
      peakHour: {
        hour: peakHour.hour,
        label: formatHourLabel(peakHour.hour),
        count: peakHour.count,
      },
      peakDay: {
        day: peakDay.day,
        label: peakDay.label,
        count: peakDay.count,
      },
    },
    locations: {
      cities: mapToSortedList(cityCounts, 10),
      zips: mapToSortedList(zipCounts, 10),
      states: mapToSortedList(stateCounts, 5),
    },
  }
}

export function formatHourLabel(hour) {
  const normalized = ((hour % 24) + 24) % 24
  if (normalized === 0) return '12 AM'
  if (normalized === 12) return '12 PM'
  if (normalized < 12) return `${normalized} AM`
  return `${normalized - 12} PM`
}
