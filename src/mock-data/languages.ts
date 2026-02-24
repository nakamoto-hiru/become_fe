export interface Language {
  code:  string
  label: string   // native name shown in the list
}

export const LANGUAGES: Language[] = [
  { code: 'en',    label: 'English'            },
  { code: 'zh-CN', label: '简体中文'            },
  { code: 'zh-TW', label: '繁體中文'            },
  { code: 'es',    label: 'Español'             },
  { code: 'ru',    label: 'Русский'             },
  { code: 'fr',    label: 'Français'            },
  { code: 'de',    label: 'Deutsch'             },
  { code: 'ja',    label: '日本語'              },
  { code: 'ko',    label: '한국어'              },
  { code: 'pt',    label: 'Português'           },
  { code: 'vi',    label: 'Tiếng Việt'          },
  { code: 'tr',    label: 'Türkçe'              },
  { code: 'id',    label: 'Bahasa Indonesia'    },
  { code: 'th',    label: 'ภาษาไทย'            },
  { code: 'ar',    label: 'العربية'             },
  { code: 'uk',    label: 'Українська'          },
]
