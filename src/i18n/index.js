import en from './locales/en.json' with { type: 'json' };
import zhTW from './locales/zh-TW.json' with { type: 'json' };

export const SUPPORTED_LOCALES = Object.freeze(['zh-TW', 'en']);
export const DEFAULT_LOCALE = 'zh-TW';
export const FALLBACK_LOCALE = 'en';
export const LOCALE_STORAGE_KEY = 'gev:locale:v1';
export const catalogs = Object.freeze({ en, 'zh-TW': zhTW });

function defaultStorage() {
  try { return globalThis.localStorage; } catch { return undefined; }
}

export function normalizeLocale(value) {
  const locale = String(value || '').trim().replaceAll('_', '-').toLowerCase();
  if (!locale) return null;
  if (locale === 'zh-tw' || locale === 'zh-hant' || locale.startsWith('zh-hant-') || locale === 'zh-hk' || locale.startsWith('zh-hk-')) return 'zh-TW';
  if (locale === 'en' || locale.startsWith('en-')) return 'en';
  return null;
}

export function detectLocale({
  storage,
  languages = globalThis.navigator?.languages ?? (globalThis.navigator?.language ? [globalThis.navigator.language] : []),
} = {}) {
  if (storage === undefined) storage = defaultStorage();
  try {
    const selected = normalizeLocale(storage?.getItem(LOCALE_STORAGE_KEY));
    if (selected) return selected;
  } catch { /* blocked storage must not block startup */ }
  if (!languages?.length) return DEFAULT_LOCALE;
  for (const language of languages) {
    const detected = normalizeLocale(language);
    if (detected) return detected;
  }
  return FALLBACK_LOCALE;
}

function valueAt(catalog, key) {
  return String(key).split('.').reduce((value, segment) => value?.[segment], catalog);
}

function interpolate(template, values) {
  return String(template).replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_match, key) => values[key] ?? `{{${key}}}`);
}

export function createI18n({ locale, storage, document = globalThis.document } = {}) {
  if (storage === undefined) storage = defaultStorage();
  let currentLocale = normalizeLocale(locale) || detectLocale({ storage });
  const listeners = new Set();
  const api = {
    get locale() { return currentLocale; },
    t(key, values = {}, defaultValue) {
      const translated = valueAt(catalogs[currentLocale], key) ?? valueAt(catalogs[FALLBACK_LOCALE], key) ?? defaultValue ?? key;
      return interpolate(translated, values);
    },
    setLocale(nextLocale, { persist = true } = {}) {
      const normalized = normalizeLocale(nextLocale) || FALLBACK_LOCALE;
      currentLocale = normalized;
      if (persist) {
        try { storage?.setItem(LOCALE_STORAGE_KEY, normalized); } catch { /* storage is optional */ }
      }
      if (document?.documentElement) document.documentElement.lang = normalized;
      for (const listener of listeners) listener(normalized);
      if (typeof document?.dispatchEvent === 'function' && typeof globalThis.CustomEvent === 'function') {
        document.dispatchEvent(new CustomEvent('gev:localechange', { detail: { locale: normalized } }));
      }
      return normalized;
    },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
  };
  if (document?.documentElement) document.documentElement.lang = currentLocale;
  return api;
}

export const i18n = createI18n();
export const t = (...args) => i18n.t(...args);
