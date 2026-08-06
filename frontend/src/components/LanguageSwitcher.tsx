'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Globe2 } from 'lucide-react'
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
  const [open, setOpen] = useState(false)

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
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-3 text-sm font-medium text-slate-100 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] transition hover:border-sky-400/40 hover:bg-slate-800"
        aria-label={`Switch language to ${nextLabel}`}
        title={`Switch language to ${nextLabel}`}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/10 text-[11px] font-semibold text-sky-300">
          {isArabic ? 'AR' : 'EN'}
        </div>
        <div className="flex flex-col items-start leading-none">
          <span className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{t('language.label')}</span>
          <span className="text-sm text-slate-100">{isArabic ? 'العربية' : 'English'}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 min-w-[160px] rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl shadow-slate-950/50 backdrop-blur">
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              void i18n.changeLanguage('en')
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${!isArabic ? 'bg-sky-500/15 text-sky-300' : 'text-slate-300 hover:bg-white/5'}`}
          >
            <span>English</span>
            <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">EN</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              void i18n.changeLanguage('ar')
            }}
            className={`mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${isArabic ? 'bg-sky-500/15 text-sky-300' : 'text-slate-300 hover:bg-white/5'}`}
          >
            <span>العربية</span>
            <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">AR</span>
          </button>
        </div>
      ) : null}
    </div>
  )
}
