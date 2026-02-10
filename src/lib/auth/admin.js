const ADMIN_COOKIE = 'apl_admin_session'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'apl'

export function getAdminPassword() {
  return ADMIN_PASSWORD
}

export function isAdminAuthenticated(request) {
  const value = request.cookies.get(ADMIN_COOKIE)?.value
  return !!value
}
