'use client'

import { format, getDate } from 'date-fns'
import { AlertCircle, FileText } from 'lucide-react'

function isFirstWeekOfMonth(date) {
  const day = getDate(date)
  return day >= 1 && day <= 7
}

export default function AdminJitasaReminder() {
  const now = new Date()
  const showReminder = isFirstWeekOfMonth(now)

  if (!showReminder) return null

  return (
    <div className="rounded-xl border-2 border-amber-200 bg-amber-50/80 p-4 sm:p-5 flex gap-3 sm:gap-4">
      <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-100 flex items-center justify-center">
        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900 text-sm sm:text-base">
              First week of {format(now, 'MMMM')} — Jitasa reminder
            </h3>
            <p className="text-amber-800/90 text-xs sm:text-sm mt-1">
              Time to send files and documents to Jitasa for accounting. Use the checklist below.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
