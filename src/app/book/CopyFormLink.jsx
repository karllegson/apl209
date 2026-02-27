'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function CopyFormLink() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (!url) return
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-apl-blue transition-colors cursor-pointer"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-green-600" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          Copy form link
        </>
      )}
    </button>
  )
}
