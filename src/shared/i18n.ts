export type Language = 'zh' | 'en';

export type MessageParams = Record<string, string | number>;

export type Translate = (source: string, params?: MessageParams) => string;

export type Messages = Record<string, string>;

export type I18n = {
  t: Translate;
  readonly language: Language;
  readonly locale: string;
  setLocale(locale: string | null | undefined): boolean;
};

export const browserLocale = (): string => {
  if (typeof navigator !== 'undefined' && navigator.language) return navigator.language;
  return 'en';
};

export const languageOf = (locale: string | null | undefined): Language => (
  (locale ?? '').toLowerCase().startsWith('zh') ? 'zh' : 'en'
);

const interpolate = (text: string, params?: MessageParams): string => {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match
  ));
};

/** Keeps source text but still fills placeholders; the default for non-UI modules. */
export const sourceTranslate: Translate = (source, params) => interpolate(source, params);

/**
 * Chinese is the source language: keys are the exact Chinese copy. English is
 * looked up from the table, and an unknown key falls back to the Chinese text.
 */
export const createI18n = (messages: Messages, initialLocale = browserLocale()): I18n => {
  let locale = initialLocale || 'en';
  let language = languageOf(locale);
  const t: Translate = (source, params) => interpolate(language === 'zh' ? source : messages[source] ?? source, params);
  return {
    t,
    get language() { return language; },
    get locale() { return locale; },
    setLocale(next) {
      const value = next || browserLocale();
      const nextLanguage = languageOf(value);
      locale = value;
      if (nextLanguage === language) return false;
      language = nextLanguage;
      return true;
    },
  };
};

export const applyDocumentLanguage = (i18n: I18n): void => {
  document.documentElement.lang = i18n.language === 'zh' ? 'zh-CN' : 'en';
};
