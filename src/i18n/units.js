import { createFormatters } from './format.js';
import { normalizeLocale } from './index.js';

export const UNIT_STORAGE_KEY = 'gev:units:v1';
export const UNIT_SYSTEMS = Object.freeze(['metric', 'imperial']);

const DISTANCE_IN_METERS = Object.freeze({ meter: 1, kilometer: 1000, foot: 0.3048, mile: 1609.344 });

export function defaultUnitSystem(locale) {
  return normalizeLocale(locale) === 'zh-TW' ? 'metric' : 'imperial';
}

export function convertDistance(value, from, to) {
  if (!(from in DISTANCE_IN_METERS) || !(to in DISTANCE_IN_METERS)) throw new RangeError('Unsupported distance unit');
  return Number(value) * DISTANCE_IN_METERS[from] / DISTANCE_IN_METERS[to];
}

export function createUnits({ locale = 'en', storage } = {}) {
  if (storage === undefined) {
    try { storage = globalThis.localStorage; } catch { storage = undefined; }
  }
  let currentLocale = normalizeLocale(locale) || 'en';
  let stored;
  try { stored = storage?.getItem(UNIT_STORAGE_KEY); } catch { /* optional */ }
  let system = UNIT_SYSTEMS.includes(stored) ? stored : defaultUnitSystem(currentLocale);
  const api = {
    get system() { return system; },
    get locale() { return currentLocale; },
    setLocale(next) { currentLocale = normalizeLocale(next) || 'en'; return currentLocale; },
    setSystem(next) {
      if (!UNIT_SYSTEMS.includes(next)) throw new RangeError(`Unsupported unit system: ${next}`);
      system = next;
      try { storage?.setItem(UNIT_STORAGE_KEY, next); } catch { /* optional */ }
      return system;
    },
    distance(meters, options = {}) {
      const value = system === 'metric' ? convertDistance(meters, 'meter', 'kilometer') : convertDistance(meters, 'meter', 'mile');
      const unit = system === 'metric' ? 'kilometer' : 'mile';
      return new Intl.NumberFormat(currentLocale === 'zh-TW' ? 'zh-TW' : 'en-US', {
        style: 'unit', unit, unitDisplay: 'short', maximumFractionDigits: 1, ...options,
      }).format(value);
    },
    altitude(meters, options = {}) {
      const value = system === 'metric' ? meters : convertDistance(meters, 'meter', 'foot');
      const unit = system === 'metric' ? 'meter' : 'foot';
      return new Intl.NumberFormat(currentLocale === 'zh-TW' ? 'zh-TW' : 'en-US', {
        style: 'unit', unit, unitDisplay: 'short', maximumFractionDigits: 0, ...options,
      }).format(value);
    },
    speed(metersPerSecond, options = {}) {
      const value = system === 'metric' ? metersPerSecond * 3.6 : metersPerSecond * 1.9438444924;
      const formatter = new Intl.NumberFormat(currentLocale === 'zh-TW' ? 'zh-TW' : 'en-US', {
        maximumFractionDigits: 0, ...options,
        ...(system === 'metric' ? { style: 'unit', unit: 'kilometer-per-hour', unitDisplay: 'short' } : {}),
      });
      // `knot` is not a sanctioned ECMA-402 unit, so retain an explicit localized
      // suffix while still using Intl for its numeric portion.
      return system === 'metric' ? formatter.format(value) : `${formatter.format(value)} ${currentLocale === 'zh-TW' ? '節' : 'kt'}`;
    },
    temperature(celsius, options = {}) {
      const value = system === 'metric' ? celsius : (celsius * 9 / 5) + 32;
      const unit = system === 'metric' ? 'celsius' : 'fahrenheit';
      return new Intl.NumberFormat(currentLocale === 'zh-TW' ? 'zh-TW' : 'en-US', {
        style: 'unit', unit, unitDisplay: 'short', maximumFractionDigits: 0, ...options,
      }).format(value);
    },
    formatters() { return createFormatters(currentLocale); },
  };
  return api;
}
