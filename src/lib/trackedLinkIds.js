/**
 * Link IDs that can be tracked (clicks and redirect URLs).
 * Add new ids here; also add them in the analytics page LINK_ITEMS (or via "Add link" in UI).
 */
export const ALLOWED_LINK_IDS = [
  'pricing-request-appointment',
  'pricing-back-to-home',
  'google-business',
]

/** Where /t/[linkId] redirects after recording the click */
export const TRACK_REDIRECT_PATH = '/book'
