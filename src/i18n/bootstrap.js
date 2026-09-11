import { i18n } from './index.js';
import { applyI18nBindings, observeI18n } from './dom.js';
import { createUnits } from './units.js';

export const units = createUnits({ locale: i18n.locale });

/** Locale-reactive formatter seam for runtime UI renderers. */
export const format = Object.freeze({
  number: (value, options) => units.formatters().number(value, options),
  dateTime: (value, options) => units.formatters().dateTime(value, options),
  operationalTime: (value, options) => units.formatters().operationalTime(value, options),
  distance: (meters, options) => units.distance(meters, options),
  altitude: (meters, options) => units.altitude(meters, options),
  speed: (metersPerSecond, options) => units.speed(metersPerSecond, options),
  temperature: (celsius, options) => units.temperature(celsius, options),
});

// Public UI-entrypoint seam: new renderers can localize high-value readouts
// without importing bootstrap internals or duplicating Intl/unit policy.
export const uiI18n = Object.freeze({ i18n, units, format });
if (typeof globalThis !== 'undefined') globalThis.gevI18n = uiI18n;

function createSelector() {
  const wrapper = document.createElement('div');
  wrapper.id = 'locale-controls';
  wrapper.setAttribute('role', 'group');
  wrapper.setAttribute('aria-label', i18n.t('language.label'));
  wrapper.innerHTML = `
    <label for="locale-select" data-i18n="language.label">Language</label>
    <select id="locale-select" data-i18n-aria-label="language.label">
      <option value="zh-TW">繁體中文</option>
      <option value="en">English</option>
    </select>`;
  const localeSelect = wrapper.querySelector('#locale-select');
  localeSelect.value = i18n.locale;
  localeSelect.addEventListener('change', () => i18n.setLocale(localeSelect.value));
  return wrapper;
}

export function initI18nUI() {
  document.documentElement.lang = i18n.locale;
  const controls = createSelector();
  document.body.append(controls);
  const stopObserving = observeI18n(document.body, i18n);
  const unsubscribe = i18n.subscribe((locale) => {
    units.setLocale(locale);
    controls.querySelector('#locale-select').value = locale;
    controls.setAttribute('aria-label', i18n.t('language.label'));
    applyI18nBindings(document, i18n);
  });
  applyI18nBindings(document, i18n);
  return () => { stopObserving(); unsubscribe(); controls.remove(); };
}

if (typeof document !== 'undefined') initI18nUI();
