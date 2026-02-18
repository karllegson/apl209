'use client'

import Link from 'next/link'
import { trackClick } from '@/lib/trackClick'

/**
 * Same as Next.js Link but sends a click event to /api/track-click before navigating.
 * Use linkId to identify the button in admin stats.
 */
export default function TrackedLink({ href, linkId, children, className, ...props }) {
  const handleClick = () => {
    if (linkId) trackClick(linkId)
  }

  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}
