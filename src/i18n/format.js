const INTL_LOCALES = Object.freeze({ en: 'en-US', 'zh-TW': 'zh-TW' });

export function intlLocale(locale) {
  return INTL_LOCALES[locale] || INTL_LOCALES.en;
}

export function createFormatters(locale = 'en') {
  const resolvedLocale = intlLocale(locale);
  return {
    locale: resolvedLocale,
    number(value, options) {
      return new Intl.NumberFormat(resolvedLocale, options).format(value);
    },
    date(value, options = {}) {
      return new Intl.DateTimeFormat(resolvedLocale, options).format(new Date(value));
    },
    dateTime(value, options = {}) {
      return new Intl.DateTimeFormat(resolvedLocale, { dateStyle: 'medium', timeStyle: 'short', ...options }).format(new Date(value));
    },
    relative(value, unit = 'second', options = {}) {
      return new Intl.RelativeTimeFormat(resolvedLocale, { numeric: 'auto', ...options }).format(value, unit);
    },
    operationalTime(value, options = {}) {
      return new Intl.DateTimeFormat(resolvedLocale, {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
        timeZone: 'UTC', timeZoneName: 'short', ...options,
      }).format(new Date(value));
    },
  };
}
