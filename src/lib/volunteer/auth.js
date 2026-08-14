export const VOLUNTEER_COOKIE = 'apl_volunteer_session'
export const VOLUNTEER_ADMIN_COOKIE = 'apl_volunteer_admin'
export const VOLUNTEER_ADMIN_EMAIL = 'administration@apl209.org'

const COOKIE_MAX_AGE = 60 * 60 * 24 * 90

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  }
}

export function isVolunteerAdminEmail(email) {
  return String(email || '').trim().toLowerCase() === VOLUNTEER_ADMIN_EMAIL
}

export function getVolunteerSession(request) {
  const isAdmin = request.cookies.get(VOLUNTEER_ADMIN_COOKIE)?.value === '1'
  const volunteerId = request.cookies.get(VOLUNTEER_COOKIE)?.value || null
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return {
    isAdmin,
    volunteerId: volunteerId && uuidRe.test(volunteerId) ? volunteerId : null,
  }
}

export function isSignedIn(session) {
  return !!(session?.isAdmin || session?.volunteerId)
}

export function setVolunteerCookies(response, { volunteerId = null, isAdmin = false } = {}) {
  if (isAdmin) {
    response.cookies.set(VOLUNTEER_ADMIN_COOKIE, '1', cookieOptions())
  } else {
    response.cookies.set(VOLUNTEER_ADMIN_COOKIE, '', { ...cookieOptions(), maxAge: 0 })
  }

  if (volunteerId) {
    response.cookies.set(VOLUNTEER_COOKIE, volunteerId, cookieOptions())
  } else {
    response.cookies.set(VOLUNTEER_COOKIE, '', { ...cookieOptions(), maxAge: 0 })
  }
}

export function clearVolunteerCookies(response) {
  const opts = { path: '/', maxAge: 0 }
  response.cookies.set(VOLUNTEER_COOKIE, '', opts)
  response.cookies.set(VOLUNTEER_ADMIN_COOKIE, '', opts)
}

export function firstName(fullName) {
  const name = String(fullName || '').trim()
  if (!name) return 'Volunteer'
  return name.split(/\s+/)[0]
}
