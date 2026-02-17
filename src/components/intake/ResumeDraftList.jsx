'use client'

import { useLanguage, LanguageToggle } from './LanguageContext'

const STEP_LABELS_EN = ['Preferences', 'Pet Info', 'Medical History', 'Vaccination', 'Review']
const STEP_LABELS_ES = ['Preferencias', 'Información de la mascota', 'Historial médico', 'Vacunación', 'Revisión']

function formatRelativeTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hr ago`
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
}

export default function ResumeDraftList({ drafts, onSelect, onBack }) {
  const { language } = useLanguage()
  const isSpanish = language === 'es'
  const stepLabels = isSpanish ? STEP_LABELS_ES : STEP_LABELS_EN

  return (
    <div className="space-y-5 md:space-y-8">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-apl-blue transition-colors cursor-pointer"
        >
          ← Back
        </button>
        <LanguageToggle />
      </div>

      <div className="text-center space-y-2">
        <h1 className="form-page-title text-xl md:text-2xl">
          {isSpanish ? 'Tu progreso guardado' : 'Your saved progress'}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {isSpanish ? 'Elige uno para continuar.' : 'Select one to continue.'}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {drafts.map((draft) => {
          const stepLabel = stepLabels[draft.step - 1] || `Step ${draft.step}`
          const pets = draft.formData?.pets || []
          const petNames = pets.map((p) => p?.pet_name?.trim()).filter(Boolean)
          const numPets = draft.formData?.num_pets ?? pets.length ?? 0
          const name = [draft.formData?.owner_first_name, draft.formData?.owner_last_name].filter(Boolean).join(' ') || null
          const submitted = draft.formData?.submitted === true
          const statusLabel = submitted
            ? (isSpanish ? 'Enviado' : 'Submitted')
            : (isSpanish ? 'No enviado' : 'Not submitted')

          return (
            <button
              key={draft.id}
              type="button"
              onClick={() => onSelect(draft)}
              className="w-full text-left p-4 md:p-5 rounded-xl border-2 border-gray-200 bg-white hover:border-apl-primary hover:bg-apl-primary/5 transition-all cursor-pointer shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">
                      {stepLabel} {isSpanish ? '(paso' : '(step'} {draft.step}/5)
                    </p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${submitted ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {statusLabel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {name && <span>{name}</span>}
                    {name && (petNames.length > 0 || numPets > 0) && ' · '}
                    {petNames.length > 0 ? (
                      <span>{petNames.join(', ')}</span>
                    ) : (
                      numPets > 0 && (numPets === 1 ? (isSpanish ? '1 mascota' : '1 pet') : (isSpanish ? `${numPets} mascotas` : `${numPets} pets`))
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {isSpanish ? 'Guardado' : 'Saved'} {formatRelativeTime(draft.updatedAt)}
                  </p>
                </div>
                <span className="shrink-0 text-apl-primary font-medium text-sm">
                  {isSpanish ? 'Continuar' : 'Continue'} →
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
