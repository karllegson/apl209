'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminPageLoading from '@/components/AdminPageLoading'
import AdminSimpleCalendar from '@/components/admin/AdminSimpleCalendar'
import AdminTasksToday from '@/components/admin/AdminTasksToday'
import AdminNotes from '@/components/admin/AdminNotes'
import ChecklistSection from '@/components/admin/ChecklistSection'
import { Lock } from 'lucide-react'
import { getDate, getDaysInMonth } from 'date-fns'

const SHAREFILE_DEFAULT = [{ id: '1', label: 'Upload documents to Sharefile', checked: false }]
const BILL_SFSPCA_P1_DEFAULT = [{ id: '1', label: 'Submit Part 1 (vouchers 1–15) — do on 16th', checked: false }]
const BILL_SFSPCA_P2_DEFAULT = [
  { id: '1', label: 'Prepare voucher invoice (16–end of previous month)', checked: false },
  { id: '2', label: 'Submit invoice to SFSPCA — do on first Tuesday', checked: false },
]
const BOARD_PACKET_DEFAULT = [
  { id: '1', label: 'Gather board packet materials', checked: false },
  { id: '2', label: 'Compile and send packet', checked: false },
]
const PAY_PARAGON_DEFAULT = [{ id: '1', label: 'Pay Paragon', checked: false }]

/** Day of month that is the first Tuesday (1–7). */
function getFirstTuesdayOfMonth(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1)
  const dayOfWeek = d.getDay()
  const daysUntilTuesday = (2 - dayOfWeek + 7) % 7
  return 1 + daysUntilTuesday
}

/** Day of month that is the third Tuesday (15–21). */
function getThirdTuesdayOfMonth(date) {
  return getFirstTuesdayOfMonth(date) + 14
}

function getActiveTasksForToday(date) {
  const day = getDate(date)
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

export default function AdminToolsPage() {
  const router = useRouter()
  const [staffName, setStaffName] = useState(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
  })
  const [taskCompletion, setTaskCompletion] = useState({})

  const monthKeyFor = (date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}`
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem('apl-admin-calendar-tasks-v1')
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') setTaskCompletion(parsed)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem('apl-admin-calendar-tasks-v1', JSON.stringify(taskCompletion))
    } catch {
      // ignore
    }
  }, [taskCompletion])

  useEffect(() => {
    fetch('/api/admin/me', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          router.replace('/admin')
          return null
        }
        return res.json()
      })
      .then((data) => {
        if (!data) return
        if (!data.staffName) {
          router.replace('/admin/who')
          return
        }
        setStaffName(data.staffName)
      })
      .catch(() => router.replace('/admin'))
      .finally(() => setAuthChecking(false))
  }, [router])

  const canViewTools = staffName === 'Karl Legson'

  const now = new Date()
  const day = getDate(now)
  const firstTuesday = getFirstTuesdayOfMonth(now)
  const thirdTuesday = getThirdTuesdayOfMonth(now)
  const rawTasksForSelected = getActiveTasksForToday(selectedDate)
  const selectedMonthKey = monthKeyFor(selectedDate)
  const completedForMonth = taskCompletion[selectedMonthKey] || {}
  const sharefileDone = !!completedForMonth.sharefile
  const billP1Done = !!completedForMonth.billP1
  const billP2Done = !!completedForMonth.billP2
  const boardPacketDone = !!completedForMonth.boardPacket
  const payParagonDone = !!completedForMonth.payParagon
  const sharefileActive = day >= 1 && day <= 7
  const billP1Active = day === 16
  const billP2Active = day === firstTuesday
  const boardPacketActive = day === thirdTuesday
  const payParagonActive = day === 5

  // If someone other than Karl somehow lands here, send them away.
  useEffect(() => {
    if (!authChecking && staffName && staffName !== 'Karl Legson') {
      router.replace('/admin')
    }
  }, [authChecking, staffName, router])

  if (authChecking) {
    return <AdminPageLoading />
  }

  if (!canViewTools) {
    // Redirect in effect above; render nothing to avoid flashing content.
    return null
  }

  return (
    <>
      <header className="bg-white border-b border-slate-100 px-4 md:px-8 py-5">
        <div className="md:pl-0 pl-14">
          <h1 className="text-xl font-bold text-slate-800">Admin Tools</h1>
          <p className="text-sm text-slate-500">
            Welcome — your dashboard for today's tasks and reminders.
          </p>
        </div>
      </header>

      <div className="p-4 md:p-8">
        <div className="space-y-6 max-w-4xl">
            {/* Welcome dashboard: calendar + tasks today */}
            <section aria-label="Today overview" className="flex flex-col md:flex-row md:items-stretch gap-4">
              <div className="flex-shrink-0">
                <AdminSimpleCalendar
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  taskCompletion={taskCompletion}
                />
              </div>
              <div className="flex-1 min-w-0">
                <AdminTasksToday
                  date={selectedDate}
                  tasks={rawTasksForSelected}
                  completed={completedForMonth}
                  onToggleTask={(key) => {
                    setTaskCompletion((prev) => {
                      const mk = monthKeyFor(selectedDate)
                      const monthState = prev[mk] || {}
                      const nextMonthState = {
                        ...monthState,
                        [key]: !monthState[key],
                      }
                      return {
                        ...prev,
                        [mk]: nextMonthState,
                      }
                    })
                  }}
                />
              </div>
            </section>

            {/* Notes & reminders */}
            <section aria-label="Notes and reminders">
              <AdminNotes />
            </section>

            {/* Monthly checklists */}
            <section aria-label="Monthly checklists">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Monthly checklists</h2>
              <div className="space-y-4">
                {[
                  {
                    key: 'paragon',
                    storageKey: 'apl-checklist-pay-paragon',
                    title: 'Pay Paragon',
                    description: '5th of month',
                    defaults: PAY_PARAGON_DEFAULT,
                    isActive: payParagonActive,
                    visible: !payParagonDone,
                  },
                  {
                    key: 'board',
                    storageKey: 'apl-checklist-board-packet',
                    title: 'Board Packet Preparation',
                    description: 'Board packet prep — do on 3rd Tuesday of month',
                    defaults: BOARD_PACKET_DEFAULT,
                    isActive: boardPacketActive,
                    visible: !boardPacketDone,
                  },
                  {
                    key: 'billP2',
                    storageKey: 'apl-checklist-bill-sfspca-p2',
                    title: 'Bill SFSPCA (Vouchers) — Part 2',
                    description: 'Vouchers for 16–end of previous month; do the task on first Tuesday of the month',
                    defaults: BILL_SFSPCA_P2_DEFAULT,
                    isActive: billP2Active,
                    visible: !billP2Done,
                  },
                  {
                    key: 'billP1',
                    storageKey: 'apl-checklist-bill-sfspca-p1',
                    title: 'Bill SFSPCA (Vouchers) — Part 1',
                    description: 'Vouchers for days 1–15; do the task on the 16th (mid-month)',
                    defaults: BILL_SFSPCA_P1_DEFAULT,
                    isActive: billP1Active,
                    visible: !billP1Done,
                  },
                  {
                    key: 'sharefile',
                    storageKey: 'apl-checklist-sharefile',
                    title: 'Sharefile',
                    description: 'First week of month — send files/documents',
                    defaults: SHAREFILE_DEFAULT,
                    isActive: sharefileActive,
                    visible: !sharefileDone,
                  },
                ]
                  .filter((section) => section.visible)
                  .sort((a, b) => {
                    // Active sections first; within that, keep the defined importance order above
                    if (a.isActive && !b.isActive) return -1
                    if (!a.isActive && b.isActive) return 1
                    return 0
                  })
                  .map((section) => (
                    <ChecklistSection
                      key={section.key}
                      storageKey={section.storageKey}
                      title={section.title}
                      description={section.description}
                      defaultItems={section.defaults}
                      isActive={section.isActive}
                      visible={section.visible}
                    />
                  ))}
              </div>
            </section>
          </div>
      </div>
    </>
  )
}
