'use client'

import { format, isToday } from 'date-fns'
import { CheckSquare, Check, Square } from 'lucide-react'

const TASK_LABELS = {
  sharefile: { label: 'Sharefile', desc: 'Send files/documents (first week)', color: 'bg-slate-500' },
  billP1: { label: 'Bill SFSPCA Part 1', desc: 'Vouchers 1–15; do on 16th', color: 'bg-emerald-500' },
  billP2: { label: 'Bill SFSPCA Part 2', desc: 'Vouchers 16–end of previous month; do on first Tuesday', color: 'bg-violet-500' },
  boardPacket: { label: 'Board Packet', desc: 'Prepare packet (3rd week)', color: 'bg-amber-500' },
  payParagon: { label: 'Pay Paragon', desc: 'Due 5th', color: 'bg-rose-500' },
}

export default function AdminTasksToday({ date, tasks, completed = {}, onToggleTask }) {
  const viewDate = date ? new Date(date) : new Date()
  const isTodayDate = isToday(viewDate)
  const list = tasks || []
  const hasTasks = list.length > 0

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100">
        {isTodayDate ? (
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-apl-primary shrink-0" />
            <h3 className="text-sm font-semibold text-slate-800">Tasks today</h3>
          </div>
        ) : (
          <h3 className="text-sm font-semibold text-slate-800">
            {format(viewDate, 'EEEE, MMMM d')}
          </h3>
        )}
      </div>
      <div className="p-4">
        {isTodayDate && (
          <p className="text-sm text-slate-500 mb-3">
            {format(viewDate, 'EEEE, MMMM d')}
          </p>
        )}
        {hasTasks ? (
          <ul className="space-y-2">
            {list.map((key) => {
              const t = TASK_LABELS[key]
              if (!t) return null
              const done = !!completed[key]
              const dotColor = t.color || 'bg-slate-500'
              const handleClick = () => {
                if (onToggleTask) onToggleTask(key)
              }
              return (
                <li
                  key={key}
                  className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer"
                  onClick={handleClick}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleClick()
                    }}
                    className="shrink-0 mt-0.5 p-0.5 rounded text-slate-400 hover:text-apl-primary transition-colors"
                    aria-label={done ? 'Uncheck task' : 'Check task'}
                  >
                    {done ? <Check className="w-4 h-4 text-apl-primary" /> : <Square className="w-4 h-4" />}
                  </button>
                  <span className="flex-1 min-w-0">
                    <span
                      className={`block ${done ? 'text-slate-400 line-through' : 'text-slate-800'}`}
                    >
                      {t.label}
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      {t.desc}
                    </span>
                  </span>
                  {!done && (
                    <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${dotColor}`} />
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No calendar tasks for this day.</p>
        )}
      </div>
    </div>
  )
}
