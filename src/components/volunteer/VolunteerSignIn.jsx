'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { es as esLocale, enUS } from 'date-fns/locale'
import { ArrowLeft, Clock, Loader2, RotateCcw, Shirt, UserPlus, X } from 'lucide-react'
import { LanguageToggle, useLanguage } from '@/components/intake/LanguageContext'
import { CLINIC, LAUNDRY_COORDINATOR } from '@/lib/volunteer/clinic'
import { parseDateStr } from '@/lib/volunteer/dates'
import { isVolunteerAdminEmail } from '@/lib/volunteer/auth'
import VolunteerWeekPreview from './VolunteerWeekPreview'

const PENDING_DAY_KEY = 'apl_volunteer_pending_day'

const fieldClass =
  'w-full intake-input px-3.5 py-3 rounded-xl border border-gray-200 text-base bg-white focus:outline-none focus:ring-2 focus:ring-apl-primary/25 focus:border-apl-primary transition-shadow'
const primaryBtn =
  'w-full min-h-[48px] py-3 flex items-center justify-center bg-apl-primary text-white font-semibold rounded-xl hover:bg-apl-blue-dark disabled:opacity-50 cursor-pointer text-sm touch-manipulation transition-colors'

export default function VolunteerSignIn({ onSignedIn }) {
  const { language } = useLanguage()
  const isSpanish = language === 'es'

  const [mode, setMode] = useState(null)
  const [newName, setNewName] = useState('')
  const [newMethod, setNewMethod] = useState(null)
  const [newContact, setNewContact] = useState('')
  const [newError, setNewError] = useState('')
  const [newLoading, setNewLoading] = useState(false)
  const [retContact, setRetContact] = useState('')
  const [retPassword, setRetPassword] = useState('')
  const [retError, setRetError] = useState('')
  const [retLoading, setRetLoading] = useState(false)
  const [pendingDay, setPendingDay] = useState(null)
  const retIsAdmin = isVolunteerAdminEmail(retContact.trim())

  const locale = isSpanish ? esLocale : enUS

  const goBack = () => {
    setMode(null)
    setNewError('')
    setRetError('')
    setRetPassword('')
    setNewMethod(null)
    setPendingDay(null)
  }

  const chooseDayPath = (which) => {
    if (pendingDay) {
      try {
        sessionStorage.setItem(PENDING_DAY_KEY, pendingDay)
      } catch {
        /* ignore */
      }
    }
    setPendingDay(null)
    setMode(which)
  }

  const handleNew = async (e) => {
    e.preventDefault()
    setNewError('')
    if (!newName.trim()) {
      setNewError(isSpanish ? 'Ingresa tu nombre' : 'Enter your name')
      return
    }
    if (!newMethod) {
      setNewError(isSpanish ? 'Elige correo o teléfono' : 'Choose email or phone')
      return
    }
    if (!newContact.trim()) {
      setNewError(
        newMethod === 'email'
          ? isSpanish
            ? 'Ingresa tu correo'
            : 'Enter your email'
          : isSpanish
            ? 'Ingresa tu teléfono'
            : 'Enter your phone number'
      )
      return
    }
    setNewLoading(true)
    try {
      const body = { name: newName.trim() }
      if (newMethod === 'email') body.email = newContact.trim()
      else body.phone = newContact.trim()
      const res = await fetch('/api/volunteer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not sign up')
      onSignedIn(data)
    } catch (err) {
      setNewError(err.message)
    } finally {
      setNewLoading(false)
    }
  }

  const handleReturning = async (e) => {
    e.preventDefault()
    setRetError('')
    if (!retContact.trim()) {
      setRetError(isSpanish ? 'Ingresa tu correo o teléfono' : 'Enter your email or phone')
      return
    }
    if (retIsAdmin && !retPassword) {
      setRetError(isSpanish ? 'Ingresa la contraseña de admin' : 'Enter the admin password')
      return
    }
    setRetLoading(true)
    try {
      const body = { contact: retContact.trim() }
      if (retIsAdmin) body.password = retPassword
      const res = await fetch('/api/volunteer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not sign in')
      onSignedIn(data)
    } catch (err) {
      setRetError(err.message)
    } finally {
      setRetLoading(false)
    }
  }

  const steps = isSpanish
    ? [
        { n: '1', t: 'Elige un día abierto', d: 'Lunes a viernes, una persona por día.' },
        { n: '2', t: 'Di a qué hora llegas', d: 'Elige la hora que te funcione.' },
        { n: '3', t: 'Pasa por recepción', d: 'Te llevan a la lavandería, atrás junto a recuperación.' },
      ]
    : [
        { n: '1', t: 'Pick an open weekday', d: 'Monday–Friday. One volunteer per day.' },
        { n: '2', t: 'Say when you’ll arrive', d: 'Pick a time that works for you.' },
        { n: '3', t: 'Check in at the desk', d: 'They’ll walk you back by recovery.' },
      ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        {mode ? (
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-apl-blue transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {isSpanish ? 'Atrás' : 'Back'}
          </button>
        ) : (
          <Link
            href="/book"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-apl-blue transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {isSpanish ? 'Inicio' : 'Home'}
          </Link>
        )}
        <LanguageToggle />
      </div>

      {!mode && (
        <>
          <div className="text-center space-y-3">
            <Link href="/book" className="inline-flex justify-center">
              <Image
                src="/logo.png"
                alt="Animal Protection League"
                width={140}
                height={140}
                className="h-14 w-auto object-contain"
              />
            </Link>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-apl-primary/80 mb-1.5">
                {isSpanish ? 'Clínica APL · Stockton' : 'APL Clinic · Stockton'}
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                {isSpanish ? 'Ayuda con la lavandería' : 'Laundry volunteers'}
              </h1>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed max-w-xs mx-auto">
                {isSpanish
                  ? 'Mira la semana abajo. Un día entre semana — luego entra para anotarte.'
                  : 'See the week below. One weekday at a time — then sign in to take a day.'}
              </p>
            </div>
          </div>

          <VolunteerWeekPreview isSpanish={isSpanish} onTakeOpenDay={setPendingDay} />

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => setMode('returning')}
              className="group flex items-center gap-3.5 p-4 rounded-2xl border border-apl-primary/25 bg-gradient-to-br from-apl-blue-50 to-white hover:border-apl-primary hover:shadow-sm transition-all cursor-pointer w-full touch-manipulation text-left"
            >
              <span className="flex shrink-0 items-center justify-center w-11 h-11 rounded-full bg-apl-primary text-white shadow-sm">
                <RotateCcw className="w-5 h-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-gray-900 text-[15px]">
                  {isSpanish ? 'Ya soy voluntario' : 'Returning volunteer'}
                </span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  {isSpanish ? 'Correo o teléfono — sin contraseña' : 'Email or phone — no password'}
                </span>
              </span>
              <span className="text-apl-primary text-sm font-semibold group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMode('new')}
              className="group flex items-center gap-3.5 p-4 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/80 transition-all cursor-pointer w-full touch-manipulation text-left"
            >
              <span className="flex shrink-0 items-center justify-center w-11 h-11 rounded-full bg-gray-100 text-gray-600">
                <UserPlus className="w-5 h-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-gray-900 text-[15px]">
                  {isSpanish ? 'Quiero ayudar' : 'I want to help'}
                </span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  {isSpanish ? 'Voluntario nuevo — 1 minuto' : 'New volunteer — takes a minute'}
                </span>
              </span>
              <span className="text-gray-400 text-sm font-semibold group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </button>
          </div>

          <ol className="rounded-2xl border border-gray-100 bg-gray-50/80 p-3.5 space-y-2.5">
            {steps.map((s) => (
              <li key={s.n} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-apl-orange text-[11px] font-bold text-white">
                  {s.n}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-gray-900">{s.t}</span>
                  <span className="block text-xs text-gray-500 leading-relaxed">{s.d}</span>
                </span>
              </li>
            ))}
          </ol>

          <p className="text-[11px] text-gray-400 text-center leading-relaxed">
            {isSpanish ? (
              <>
                Si es tu primera vez,{' '}
                <a href={`tel:${LAUNDRY_COORDINATOR.tel}`} className="text-apl-primary/80 hover:underline">
                  llámame o mándame mensaje
                </a>
                .
              </>
            ) : (
              <>
                If it&apos;s your first time,{' '}
                <a href={`tel:${LAUNDRY_COORDINATOR.tel}`} className="text-apl-primary/80 hover:underline">
                  call or text me
                </a>
                .
              </>
            )}
          </p>

          <div className="flex items-start gap-2.5 rounded-xl bg-amber-50/80 border border-apl-orange/20 px-3 py-2.5">
            <Shirt className="w-4 h-4 text-apl-orange-dark shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 leading-relaxed">
              {isSpanish
                ? 'Si no puedes ir, cancela aquí — y llama si faltan menos de 24 horas para que la clínica no te espere.'
                : 'If you can’t make it, cancel here — and call if it’s under 24 hours so the clinic isn’t waiting.'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 text-[11px] text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{CLINIC.address.split(',')[0]}</span>
            <span aria-hidden>·</span>
            <a href={`tel:${CLINIC.tel}`} className="text-apl-primary hover:underline">
              {CLINIC.phoneDisplay}
            </a>
          </div>
        </>
      )}

      {mode === 'returning' && (
        <form onSubmit={handleReturning} className="space-y-4 animate-fade-in">
          <div className="text-center pb-1">
            <h2 className="text-lg font-bold text-gray-900">
              {isSpanish ? 'Bienvenido de nuevo' : 'Welcome back'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {retIsAdmin
                ? isSpanish
                  ? 'Cuenta de admin — ingresa la contraseña'
                  : 'Admin account — enter the password'
                : isSpanish
                  ? 'Correo o teléfono — sin contraseña'
                  : 'Email or phone — no password'}
            </p>
          </div>
          <div>
            <label className="form-field-label block mb-2">
              {isSpanish ? 'Correo o teléfono' : 'Email or phone'}
            </label>
            <input
              type="text"
              inputMode="email"
              autoComplete="username"
              autoFocus
              placeholder={isSpanish ? 'correo o (209) 555-1234' : 'email or (209) 555-1234'}
              value={retContact}
              onChange={(e) => {
                setRetContact(e.target.value)
                setRetError('')
              }}
              className={fieldClass}
            />
          </div>
          {retIsAdmin && (
            <div className="animate-fade-in">
              <label className="form-field-label block mb-2">
                {isSpanish ? 'Contraseña de admin' : 'Admin password'}
              </label>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="••••"
                value={retPassword}
                onChange={(e) => {
                  setRetPassword(e.target.value)
                  setRetError('')
                }}
                className={fieldClass}
              />
            </div>
          )}
          {retError && <p className="text-red-500 text-sm">{retError}</p>}
          <button type="submit" disabled={retLoading} className={primaryBtn}>
            {retLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isSpanish ? 'Entrar' : 'Sign in'}
          </button>
        </form>
      )}

      {mode === 'new' && (
        <form onSubmit={handleNew} className="space-y-4 animate-fade-in">
          <div className="text-center pb-1">
            <h2 className="text-lg font-bold text-gray-900">
              {isSpanish ? 'Crea tu cuenta' : 'Create your account'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isSpanish ? 'Luego elige un día abierto en el calendario' : 'Then pick an open day on the calendar'}
            </p>
          </div>
          <div>
            <label className="form-field-label block mb-2">{isSpanish ? 'Nombre' : 'Name'}</label>
            <input
              type="text"
              autoComplete="name"
              autoFocus
              placeholder={isSpanish ? 'Tu nombre' : 'Your name'}
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value)
                setNewError('')
              }}
              className={fieldClass}
            />
          </div>

          <div>
            <p className="form-field-label mb-2">
              {isSpanish ? '¿Cómo te contactamos?' : 'How should we reach you?'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'email', en: 'Email', es: 'Correo' },
                { id: 'phone', en: 'Phone', es: 'Teléfono' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setNewMethod(opt.id)
                    setNewContact('')
                    setNewError('')
                  }}
                  className={`py-3 rounded-xl border text-sm font-medium cursor-pointer transition-colors ${
                    newMethod === opt.id
                      ? 'border-apl-primary bg-apl-blue-50 text-apl-blue-dark'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {isSpanish ? opt.es : opt.en}
                </button>
              ))}
            </div>
          </div>

          {newMethod && (
            <div className="animate-fade-in">
              <label className="form-field-label block mb-2">
                {newMethod === 'email'
                  ? isSpanish
                    ? 'Correo electrónico'
                    : 'Email'
                  : isSpanish
                    ? 'Teléfono'
                    : 'Phone'}
              </label>
              <input
                type={newMethod === 'email' ? 'email' : 'tel'}
                inputMode={newMethod === 'email' ? 'email' : 'tel'}
                autoComplete={newMethod === 'email' ? 'email' : 'tel'}
                placeholder={newMethod === 'email' ? 'you@email.com' : '(209) 555-1234'}
                value={newContact}
                onChange={(e) => {
                  setNewContact(e.target.value)
                  setNewError('')
                }}
                className={fieldClass}
              />
            </div>
          )}

          {newError && <p className="text-red-500 text-sm">{newError}</p>}
          <button type="submit" disabled={newLoading} className={primaryBtn}>
            {newLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSpanish ? (
              'Crear cuenta y continuar'
            ) : (
              'Create account & continue'
            )}
          </button>
        </form>
      )}

      {pendingDay && !mode && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setPendingDay(null)}
            aria-label="Close"
          />
          <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-4 animate-fade-in">
            <div className="mx-auto mb-1 h-1 w-10 rounded-full bg-gray-200 sm:hidden" aria-hidden />
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-apl-orange-dark">
                  {isSpanish ? 'Día abierto' : 'Open day'}
                </p>
                <h2 className="text-lg font-bold text-gray-900 mt-0.5">
                  {format(parseDateStr(pendingDay), 'EEE, MMM d', { locale })}
                </h2>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  {isSpanish
                    ? '¿Ya tienes cuenta o eres nuevo?'
                    : 'Already signed up, or new here?'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPendingDay(null)}
                className="p-2 -mr-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => chooseDayPath('returning')}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-apl-primary/25 bg-apl-blue-50/50 hover:bg-apl-blue-50 text-left cursor-pointer touch-manipulation"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-apl-primary text-white">
                  <RotateCcw className="w-4 h-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-gray-900">
                    {isSpanish ? 'Ya soy voluntario' : 'Returning volunteer'}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {isSpanish ? 'Entrar y anotar este día' : 'Sign in and take this day'}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => chooseDayPath('new')}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-left cursor-pointer touch-manipulation"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                  <UserPlus className="w-4 h-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-gray-900">
                    {isSpanish ? 'Voluntario nuevo' : 'New volunteer'}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {isSpanish ? 'Crear cuenta y anotar este día' : 'Create an account, then take this day'}
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
