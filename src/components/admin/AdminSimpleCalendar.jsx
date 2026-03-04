'use client'

import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toDayStart(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

const DAY_TASK_META = {
  sharefile: { color: 'bg-slate-500', title: 'Sharefile' },
  billP1: { color: 'bg-emerald-500', title: 'Bill SFSPCA Part 1 (vouchers 1–15, do on 16th)' },
  billP2: { color: 'bg-violet-500', title: 'Bill SFSPCA Part 2 (16–end prev month, first Tuesday)' },
  boardPacket: { color: 'bg-amber-500', title: 'Board packet (3rd week)' },
  payParagon: { color: 'bg-rose-500', title: 'Pay Paragon (5th)' },
}

function getFirstTuesdayOfMonth(date) {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
  const dayOfWeek = firstOfMonth.getDay() // 0=Sun,1=Mon,2=Tue...
  const daysUntilTuesday = (2 - dayOfWeek + 7) % 7
  return 1 + daysUntilTuesday
}

function getThirdTuesdayOfMonth(date) {
  return getFirstTuesdayOfMonth(date) + 14
}

function getTasksForDate(date) {
  const day = date.getDate()
  const firstTue = getFirstTuesdayOfMonth(date)
  const thirdTue = getThirdTuesdayOfMonth(date)
  const tasks = []
  // Sharefile — one due day: first Tuesday
  if (day === firstTue) tasks.push('sharefile')
  // Bill SFSPCA Part 1 — vouchers 1–15, do on 16th
  if (day === 16) tasks.push('billP1')
  // Bill SFSPCA Part 2 — vouchers 16–end prev month, do on first Tuesday
  if (day === firstTue) tasks.push('billP2')
  // Board packet — one due day: 3rd Tuesday
  if (day === thirdTue) tasks.push('boardPacket')
  // Pay Paragon — 5th of month
  if (day === 5) tasks.push('payParagon')
  return tasks
}

export default function AdminSimpleCalendar({ selectedDate: controlledSelected, onSelectDate }) {
  const isControlled = controlledSelected != null && typeof onSelectDate === 'function'
  const [internalSelected, setInternalSelected] = useState(() => toDayStart(new Date()))
  const selectedDate = isControlled ? controlledSelected : internalSelected
  const setSelectedDate = isControlled ? (d) => onSelectDate(d) : setInternalSelected

  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const rows = []
  let days = []
  let day = startDate

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      days.push(day)
      day = addDays(day, 1)
    }
    rows.push(days)
    days = []
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full max-w-[340px] sm:max-w-[380px] min-w-0">
      <div className="flex items-center justify-between px-2 sm:px-3 py-2 sm:py-3 border-b border-slate-100 gap-1">
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); setCurrentMonth((m) => subMonths(m, 1)); }}
          className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors touch-manipulation select-none"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 text-center px-1 min-w-0">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          {selectedDate && (
            <p className="text-[10px] text-slate-500 truncate" title={format(selectedDate, 'EEEE, MMMM d')}>
              Selected: {format(selectedDate, 'MMM d')}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); setCurrentMonth((m) => addMonths(m, 1)); }}
          className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors touch-manipulation select-none"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="p-2 sm:p-3">
        <div className="grid grid-cols-7 gap-[3px] sm:gap-1 text-center">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="py-1 sm:py-1.5 text-[11px] sm:text-[12px] font-semibold text-slate-500 uppercase tracking-wider"
            >
              {d}
            </div>
          ))}
          {rows.map((row) =>
            row.map((d) => {
              const inMonth = isSameMonth(d, monthStart)
              const today = isToday(d)
              const selected = selectedDate ? isSameDay(d, selectedDate) : false
              const tasksForDay = getTasksForDate(d)
              const handleDayClick = () => {
                const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
                if (!inMonth) {
                  setCurrentMonth(startOfMonth(d))
                }
                setSelectedDate(dayStart)
              }
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={handleDayClick}
                  className={`aspect-square min-h-[40px] sm:min-h-[46px] flex flex-col items-center justify-center gap-0.5 text-[11px] sm:text-sm rounded sm:rounded-lg transition-colors touch-manipulation select-none ${
                    !inMonth
                      ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer'
                      : today
                        ? selected
                          ? 'bg-apl-primary text-white font-semibold ring-2 ring-offset-2 ring-apl-primary ring-offset-white'
                          : 'bg-apl-primary text-white font-semibold hover:bg-apl-blue-dark cursor-pointer'
                        : selected
                          ? 'bg-apl-blue-50 text-apl-primary font-semibold ring-2 ring-offset-2 ring-apl-primary ring-offset-white cursor-pointer'
                          : 'text-slate-700 hover:bg-slate-100 cursor-pointer'
                  }`}
                  aria-label={`${format(d, 'EEEE, MMMM d')}${today ? ' (today)' : ''}${selected ? ' (selected)' : ''}${!inMonth ? ' — click to go to this month' : ''}`}
                >
                  <span className="leading-none">{format(d, 'd')}</span>
                  {tasksForDay.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-0.5 max-w-full">
                      {tasksForDay.map((taskKey) => {
                        const meta = DAY_TASK_META[taskKey]
                        if (!meta) return null
                        return (
                          <span
                            key={taskKey}
                            className={`w-1.5 h-1.5 rounded-full ${meta.color}`}
                            title={meta.title}
                          />
                        )
                      })}
                    </div>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
