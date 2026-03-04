'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage, LanguageToggle } from './LanguageContext'
import { Loader2, CheckCircle, ImagePlus, X } from 'lucide-react'

const MAX_PHOTO_PX = 800
const MAX_PHOTO_QUALITY = 0.82

function resizeImageToDataUrl(file, maxPx = MAX_PHOTO_PX, quality = MAX_PHOTO_QUALITY) {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img')
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let w = img.naturalWidth
      let h = img.naturalHeight
      if (w > maxPx || h > maxPx) {
        if (w > h) {
          h = Math.round((h * maxPx) / w)
          w = maxPx
        } else {
          w = Math.round((w * maxPx) / h)
          h = maxPx
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h)
      try {
        resolve(canvas.toDataURL('image/jpeg', quality))
      } catch (e) {
        reject(e)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    img.src = url
  })
}

export default function TnrWaitlist({ onBack, onLogoClick }) {
  const { language } = useLanguage()
  const isSpanish = language === 'es'
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    animal_type: '',
    customer_notes: '',
    photo_url: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const photoInputRef = useRef(null)
  const [tnrEnabled, setTnrEnabled] = useState(true)
  const [settingsLoading, setSettingsLoading] = useState(true)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const first = form.first_name?.trim()
    const last = form.last_name?.trim()
    const email = form.email?.trim()
    const phone = form.phone?.trim()
    const animalType = form.animal_type
    if (!first || !last || !email || !phone || !animalType) {
      setError(
        isSpanish
          ? 'Complete todos los campos y seleccione gato o perro.'
          : 'Please fill in all fields and choose cat or dog.'
      )
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(isSpanish ? 'Correo no válido.' : 'Invalid email address.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/tnr-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: first,
          last_name: last,
          email,
          phone,
          animal_type: animalType,
          customer_notes: form.customer_notes?.trim() || undefined,
          photo_url: form.photo_url || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit')
      setSubmitted(true)
    } catch (err) {
      setError(err.message || (isSpanish ? 'Error al enviar. Intente de nuevo.' : 'Something went wrong. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  // Load TNR waitlist enabled/disabled flag
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/tnr-settings')
        if (!res.ok) throw new Error('settings error')
        const data = await res.json()
        if (typeof data.enabled === 'boolean') setTnrEnabled(data.enabled)
      } catch {
        // Fail-open: keep enabled if settings can’t be read
        setTnrEnabled(true)
      } finally {
        setSettingsLoading(false)
      }
    }
    fetchSettings()
  }, [])

  if (submitted) {
    return (
      <div className="space-y-5 md:space-y-8 max-w-xl mx-auto">
        <div className="flex justify-end">
          <LanguageToggle />
        </div>
        {onLogoClick ? (
          <button type="button" onClick={onLogoClick} className="flex justify-center mb-2 w-full cursor-pointer">
            <Image src="/logo.png" alt="APL" width={140} height={140} className="h-14 md:h-16 w-auto object-contain" />
          </button>
        ) : (
          <Link href="/book" className="flex justify-center mb-2 block">
            <Image src="/logo.png" alt="APL" width={140} height={140} className="h-14 md:h-16 w-auto object-contain" />
          </Link>
        )}
        <div className="bg-white rounded-xl border-2 border-green-200 p-6 md:p-8 text-center space-y-4">
          <div className="flex justify-center">
            <Image
              src="/tnr-confirmation-cat.png"
              alt=""
              width={160}
              height={160}
              className="rounded-2xl w-28 h-28 md:w-32 md:h-32 object-cover"
            />
          </div>
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {isSpanish ? '¡Ya está en la lista!' : "You're on the list!"}
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            {isSpanish
              ? 'Lo llamaremos cuando haya espacio. Gracias por su interés en TNR.'
              : "We'll call you when we have availability. Thank you for your interest in TNR."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 md:space-y-8 max-w-xl mx-auto">
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className="text-sm text-gray-600 hover:text-apl-blue transition-colors cursor-pointer">
          ← Back
        </button>
        <LanguageToggle />
      </div>

      {onLogoClick ? (
        <button type="button" onClick={onLogoClick} className="flex justify-center mb-2 w-full cursor-pointer">
          <Image src="/logo.png" alt="APL" width={140} height={140} className="h-14 md:h-16 w-auto object-contain" />
        </button>
      ) : (
        <Link href="/book" className="flex justify-center mb-2 block">
          <Image src="/logo.png" alt="APL" width={140} height={140} className="h-14 md:h-16 w-auto object-contain" />
        </Link>
      )}

      <div className="text-center space-y-2">
        <h1 className="form-page-title text-xl md:text-2xl">
          {isSpanish ? 'TNR Lista de espera' : 'TNR Waitlist'}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {isSpanish ? 'Lea la información y complete el formulario.' : 'Please read the info below and complete the form.'}
        </p>
      </div>

      {/* Info block */}
      <div className="rounded-xl border-2 border-slate-200 bg-slate-50/80 p-4 md:p-5 space-y-3 text-sm text-gray-700">
        <p className="font-semibold text-gray-800">
          {isSpanish ? 'Necesitamos que venga en persona para hacer la cita' : 'You’ll need to come in person to book'}
        </p>
        <p className="leading-relaxed">
          {isSpanish
            ? 'Depósito de $50 en efectivo solamente. Puede aplicar ese efectivo al saldo después; el servicio real puede pagarse con tarjeta.'
            : 'We require a $50 deposit in cash only. You can put that cash toward your balance later; you can pay for the actual service with a card.'}
        </p>
        <p className="leading-relaxed">
          {isSpanish
            ? 'Trampas: el depósito en efectivo de $50 se devuelve como $45 en efectivo al devolver la trampa (es decir, la trampa cuesta $5). Puede rentar una trampa con nosotros si no tiene una.'
            : 'Traps: the $50 cash deposit is refunded as $45 cash when you return the trap (so the trap is effectively $5). You can rent a trap from us if you don’t have one.'}
        </p>
        <p className="leading-relaxed">
          {isSpanish
            ? 'Suele haber mucha demanda. Tenemos lista de espera; lo llamaremos. Puede dejarnos sus datos y lo ponemos en la lista.'
            : 'We’re usually fully booked. We have a waitlist; we’ll call you back. Leave your info below and we’ll put you on the list.'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border-2 border-slate-200 p-4 md:p-5 space-y-4">
        {!tnrEnabled && !settingsLoading && (
          <div className="flex flex-col items-center text-center space-y-3 mb-2">
            <div className="w-28 h-28 md:w-32 md:h-32 relative">
              <img
                src="/waiting-kitten.png"
                alt=""
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <p className="text-sm text-slate-600 font-medium">
              {isSpanish
                ? 'La lista de espera TNR está llena y temporalmente cerrada.'
                : 'The TNR waitlist is maxed out and temporarily closed.'}
            </p>
          </div>
        )}
        {!submitting && tnrEnabled && (
          <fieldset className="">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{isSpanish ? 'Nombre' : 'First name'}</label>
            <input
              type="text"
              value={form.first_name}
              onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-apl-primary/30 focus:border-apl-primary"
              placeholder={isSpanish ? 'Nombre' : 'First name'}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{isSpanish ? 'Apellido' : 'Last name'}</label>
            <input
              type="text"
              value={form.last_name}
              onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-apl-primary/30 focus:border-apl-primary"
              placeholder={isSpanish ? 'Apellido' : 'Last name'}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">{isSpanish ? 'Correo electrónico' : 'Email'}</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-apl-primary/30 focus:border-apl-primary"
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">{isSpanish ? 'Teléfono' : 'Phone number'}</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-apl-primary/30 focus:border-apl-primary"
            placeholder={isSpanish ? 'Teléfono' : 'Phone'}
          />
        </div>

        {/* Animal type */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {isSpanish ? 'Animal' : 'Animal'} <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, animal_type: 'cat' }))}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                form.animal_type === 'cat'
                  ? 'border-apl-primary bg-apl-primary/10 text-apl-primary'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {isSpanish ? 'Gato' : 'Cat'}
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, animal_type: 'dog' }))}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                form.animal_type === 'dog'
                  ? 'border-apl-primary bg-apl-primary/10 text-apl-primary'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {isSpanish ? 'Perro' : 'Dog'}
            </button>
          </div>
        </div>

        {/* Optional photo */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {isSpanish ? 'Foto (opcional)' : 'Photo (optional)'}
          </label>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              try {
                const dataUrl = await resizeImageToDataUrl(file)
                setForm((f) => ({ ...f, photo_url: dataUrl }))
              } catch (err) {
                setError(isSpanish ? 'No se pudo cargar la imagen.' : 'Could not load image.')
              }
              e.target.value = ''
            }}
          />
          {form.photo_url ? (
            <div className="flex items-start gap-3">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                <img src={form.photo_url} alt="" className="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, photo_url: '' }))}
                className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm"
                aria-label={isSpanish ? 'Quitar foto' : 'Remove photo'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-600 text-sm hover:bg-gray-100"
            >
              <ImagePlus className="w-4 h-4" />
              {isSpanish ? 'Elegir imagen' : 'Choose image'}
            </button>
          )}
        </div>

        {/* Optional notes */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {isSpanish ? 'Comentarios (opcional)' : 'Message / notes (optional)'}
          </label>
          <textarea
            value={form.customer_notes}
            onChange={(e) => setForm((f) => ({ ...f, customer_notes: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-apl-primary/30 focus:border-apl-primary resize-y"
            placeholder={isSpanish ? 'Cuéntanos lo que quieras...' : 'Tell us whatever you’d like...'}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50"
          >
            {isSpanish ? 'Atrás' : 'Back'}
          </button>
          {tnrEnabled && (
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-lg bg-apl-primary hover:bg-apl-blue-dark text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {isSpanish ? 'Enviar' : 'Submit'}
            </button>
          )}
        </div>
        </fieldset>
        )}

        {!submitting && !tnrEnabled && !settingsLoading && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50"
            >
              {isSpanish ? 'Atrás' : 'Back'}
            </button>
          </div>
        )}

        {submitting && (
          <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
            <Loader2 className="w-6 h-6 text-apl-primary animate-spin" />
            <p className="text-sm text-slate-600">
              {isSpanish ? 'Enviando su información…' : 'Submitting your information…'}
            </p>
          </div>
        )}
      </form>
    </div>
  )
}
