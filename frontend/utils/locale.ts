export function getLocaleFromLanguage(language?: string | null) {
  return language?.startsWith('ar') ? 'ar-EG' : 'en-US'
}

export function formatDateValue(
  value: string | Date | number | null | undefined,
  language?: string | null,
  options?: Intl.DateTimeFormatOptions,
) {
  if (!value) {
    return ''
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat(getLocaleFromLanguage(language), options).format(date)
}

export function formatNumberValue(value: number | string | null | undefined, language?: string | null) {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  const parsed = typeof value === 'number' ? value : Number(value)

  if (Number.isNaN(parsed)) {
    return String(value)
  }

  return new Intl.NumberFormat(getLocaleFromLanguage(language)).format(parsed)
}

export function formatCurrencyValue(
  value: number | string | null | undefined,
  language?: string | null,
  currency = 'EGP',
) {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  const parsed = typeof value === 'number' ? value : Number(value)

  if (Number.isNaN(parsed)) {
    return String(value)
  }

  return new Intl.NumberFormat(getLocaleFromLanguage(language), {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(parsed)
}
