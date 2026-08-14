'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Clock, Loader2, RotateCcw, Shirt, UserPlus } from 'lucide-react'
import { LanguageToggle, useLanguage } from '@/components/intake/LanguageContext'
import { CLINIC } from '@/lib/volunteer/clinic'

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
  const [retError, setRetError] = useState('')
  const [retLoading, setRetLoading] = useState(false)

  const goBack = () => {
    setMode(null)
    setNewError('')
    setRetError('')
    setNewMethod(null)
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
    setRetLoading(true)
    try {
      const res = await fetch('/api/volunteer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: retContact.trim() }),
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
        { n: '2', t: 'Di a qué hora llegas', d: 'La mañana alrededor de las 10 funciona mejor porque no hace tanto calor.' },
        { n: '3', t: 'Pasa por recepción', d: 'Te llevan a la lavandería, atrás junto a recuperación.' },
      ]
    : [
        { n: '1', t: 'Pick an open weekday', d: 'Monday–Friday. One volunteer per day.' },
        { n: '2', t: 'Say when you’ll arrive', d: 'Morning around 10 works best since it’s not hot.' },
        { n: '3', t: 'Check in at the desk', d: 'They’ll walk you back by recovery.' },
      ]

  return (
    <div className="space-y-6">
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
            {mode === 'returning'
              ? isSpanish
                ? 'Entra con el correo o teléfono que usaste.'
                : 'Sign in with the email or phone you used.'
              : mode === 'new'
                ? isSpanish
                  ? 'Nombre y cómo contactarte. Sin contraseña.'
                  : 'Your name and how we can reach you. No password.'
                : isSpanish
                  ? 'La clínica necesita a alguien cada día entre semana. Toma un día cuando puedas.'
                  : 'The clinic needs someone every weekday. Take a day when you can.'}
          </p>
        </div>
      </div>

      {!mode && (
        <>
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
                  {isSpanish ? 'Voluntario nuevo' : 'New volunteer'}
                </span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  {isSpanish ? 'Crear una cuenta en un minuto' : 'Create an account in a minute'}
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
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-apl-primary text-[11px] font-bold text-white">
                  {s.n}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-gray-900">{s.t}</span>
                  <span className="block text-xs text-gray-500 leading-relaxed">{s.d}</span>
                </span>
              </li>
            ))}
          </ol>

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
            {retError && <p className="text-red-500 text-sm mt-2">{retError}</p>}
          </div>
          <button type="submit" disabled={retLoading} className={primaryBtn}>
            {retLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isSpanish ? 'Entrar' : 'Sign in'}
          </button>
        </form>
      )}

      {mode === 'new' && (
        <form onSubmit={handleNew} className="space-y-4 animate-fade-in">
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
            <p className="text-[11px] text-gray-400 mt-2">
              {isSpanish
                ? 'Lo usamos si hay un cambio de horario o si la clínica cierra ese día.'
                : 'We use this if the schedule changes or the clinic closes that day.'}
            </p>
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
              'Crear cuenta'
            ) : (
              'Create account'
            )}
          </button>
        </form>
      )}
    </div>
  )
}
