/**
 * LanguageContext — global language state + translation helper
 *
 * Usage:
 *   const { lang, setLang, t } = useLanguage()
 *   t('hero.title')  →  translated string for current lang
 */

import {
  createContext, useContext, useState, useCallback, type ReactNode,
} from 'react'
import { TRANSLATIONS, type TranslationKey } from '@/i18n/translations'

// ─── Context shape ────────────────────────────────────────────────────────────

interface LanguageContextValue {
  lang:    string
  setLang: (code: string) => void
  t:       (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextValue>({
  lang:    'en',
  setLang: () => {},
  t:       (key) => key,
})

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext)
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<string>(
    () => localStorage.getItem('wm_lang') ?? 'en',
  )

  const setLang = useCallback((code: string) => {
    setLangState(code)
    localStorage.setItem('wm_lang', code)
  }, [])

  const t = useCallback(
    (key: TranslationKey): string => {
      const map = TRANSLATIONS[lang] ?? TRANSLATIONS['en']
      return map?.[key] ?? TRANSLATIONS['en']?.[key] ?? key
    },
    [lang],
  )

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
