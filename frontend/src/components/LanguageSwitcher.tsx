'use client'

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import '@/i18n/config'

const applyDocumentAttributes = (lng: string) => {
  const normalizedLng = lng?.startsWith('ar') ? 'ar' : 'en'

  if (typeof document !== 'undefined') {
    document.documentElement.lang = normalizedLng
    document.documentElement.dir = normalizedLng === 'ar' ? 'rtl' : 'ltr'
  }
}

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  useEffect(() => {
    applyDocumentAttributes(i18n.language || 'en')
  }, [i18n.language])

  const toggleLanguage = () => {
    const current = (i18n.resolvedLanguage || i18n.language || 'en').toString()
    const nextLang = current.startsWith('ar') ? 'en' : 'ar'

    try {
      localStorage.setItem('i18nextLng', nextLang)
    } catch {}

    applyDocumentAttributes(nextLang)
    void i18n.changeLanguage(nextLang)
  }

  const isArabic = (i18n.resolvedLanguage || i18n.language || 'en').toString().startsWith('ar')
  const nextLabel = isArabic ? t('language.english') : t('language.arabic')

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="flex h-10 items-center gap-2 rounded-[10px] border border-white/10 bg-[#1F2937] px-3 text-sm font-medium text-gray-200 transition hover:border-sky-400/40 hover:text-white"
      aria-label={`Switch language to ${nextLabel}`}
      title={`Switch language to ${nextLabel}`}
    >
      <span className="text-[11px] uppercase tracking-[0.2em] text-sky-300/80">Lang</span>
      <span>{isArabic ? 'EN' : 'AR'}</span>
    </button>
  )
}
