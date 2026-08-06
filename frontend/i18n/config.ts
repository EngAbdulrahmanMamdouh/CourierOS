import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en/common.json'
import ar from './locales/ar/common.json'

const isClient = typeof window !== 'undefined'

const saved = isClient ? localStorage.getItem('i18nextLng') : null
const initialLng = saved || 'en'

const resources = {
  en: { translation: en },
  ar: { translation: ar },
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: initialLng,
    fallbackLng: 'en',
    defaultNS: 'translation',
    ns: ['translation'],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })
}

if (isClient) {
  const applyHtmlAttrs = (lng: string) => {
    document.documentElement.lang = lng
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr'
  }

  applyHtmlAttrs(i18n.language || initialLng)

  i18n.on('languageChanged', (lng: string) => {
    try {
      localStorage.setItem('i18nextLng', lng)
    } catch {}
    applyHtmlAttrs(lng)
  })
}

export default i18n
