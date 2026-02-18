/**
 * Send a link-click event to the API (non-blocking).
 * Use for tracking which buttons/links users click.
 * @param {string} linkId - e.g. 'pricing-request-appointment', 'pricing-back-to-home', 'google-business'
 * @param {string} [source] - optional, e.g. 'utm'
 */
export function trackClick(linkId, source = '') {
  if (typeof linkId !== 'string' || !linkId.trim()) return
  const payload = JSON.stringify({ linkId: linkId.trim(), source: String(source).slice(0, 100) })
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon('/api/track-click', new Blob([payload], { type: 'application/json' }))
  } else {
    fetch('/api/track-click', {
      method: 'POST',
      body: payload,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => {})
  }
}
