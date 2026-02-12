'use client'

import { createContext, useContext, useState } from 'react'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en')

  const value = {
    language,
    setLanguage,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return ctx
}

export function LanguageToggle({ className = '' }) {
  const { language, setLanguage } = useLanguage()
  const isSpanish = language === 'es'

  return (
    <button
      type="button"
      onClick={() => setLanguage(isSpanish ? 'en' : 'es')}
      className={`inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white/80 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:border-apl-blue hover:text-apl-blue cursor-pointer ${className}`}
    >
      <span className="text-gray-500 mr-1">{isSpanish ? 'Idioma' : 'Language'}</span>
      <span className={isSpanish ? 'text-gray-400' : 'text-gray-900'}>EN</span>
      <span className="text-gray-300">/</span>
      <span className={isSpanish ? 'text-gray-900' : 'text-gray-400'}>ES</span>
    </button>
  )
}


