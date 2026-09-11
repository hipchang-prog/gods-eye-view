import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import en from './locales/en.json' with { type: 'json' };
import zhTW from './locales/zh-TW.json' with { type: 'json' };
import {
  LOCALE_STORAGE_KEY,
  createI18n,
  detectLocale,
  normalizeLocale,
} from './index.js';
import { createFormatters } from './format.js';
import {
  UNIT_STORAGE_KEY,
  convertDistance,
  createUnits,
  defaultUnitSystem,
} from './units.js';
import {
  DYNAMIC_EXACT_PHRASES,
  DYNAMIC_PARAMETERIZED_PHRASES,
  applyI18nBindings,
  observeI18n,
  resolveDynamicPhrase,
  translateDynamicPhrase,
} from './dom.js';

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    values,
  };
}

function flatten(value, prefix = '', result = {}) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === 'object' && !Array.isArray(child)) flatten(child, path, result);
    else result[path] = child;
  }
  return result;
}

test('catalogs have identical keys and broad domain coverage', () => {
  assert.deepEqual(Object.keys(flatten(zhTW)).sort(), Object.keys(flatten(en)).sort());
  for (const key of ['layers.aircraft', 'layers.militaryAircraft', 'layers.vessels', 'layers.satellites',
    'layers.earthquakes', 'layers.wildfires', 'layers.cctv', 'layers.rockets', 'layers.traffic',
    'common.loading', 'common.error', 'common.warning', 'common.empty', 'settings.title', 'search.placeholder']) {
    assert.ok(flatten(en)[key], `missing ${key}`);
    assert.ok(flatten(zhTW)[key], `missing ${key}`);
  }
});

test('catalog audit gates every requested visible-copy domain and interpolation parity', () => {
  const flatEn = flatten(en);
  const flatZh = flatten(zhTW);
  const required = [
    'hud.altitude', 'hud.speed', 'hud.heading', 'map.source', 'map.style', 'location.label',
    'fields.latitude', 'fields.longitude', 'fields.callsign', 'fields.icao', 'fields.operator',
    'fields.country', 'fields.updated', 'fields.dataSource', 'vessel.mmsi', 'vessel.shipType',
    'vessel.destination', 'vessel.draught', 'satellite.norad', 'satellite.orbitClass',
    'satellite.nextPass', 'earthquake.magnitude', 'earthquake.depth', 'earthquake.time',
    'wildfire.frp', 'wildfire.age', 'wildfire.confidence', 'cctv.frame', 'cctv.calibration',
    'rocket.mission', 'rocket.status', 'rocket.site', 'rocket.payload', 'rocket.stage',
    'rocket.replay', 'traffic.congestion', 'bikeshare.availableBikes', 'radio.station',
    'scene.captureShot', 'scene.exportPresets', 'settings.apiKey', 'settings.defaultProvider',
    'voice.microphone', 'voice.connect', 'voice.estimatedCost', 'dialogs.close',
    'tooltips.moreInformation', 'a11y.loading', 'dynamic.fieldValue', 'dynamic.updatedAgo',
  ];
  for (const key of required) {
    assert.ok(String(flatEn[key] || '').trim(), `missing/empty en key: ${key}`);
    assert.ok(String(flatZh[key] || '').trim(), `missing/empty zh-TW key: ${key}`);
  }
  const placeholders = (value) => [...String(value).matchAll(/{{\s*([\w.-]+)\s*}}/g)].map((m) => m[1]).sort();
  for (const key of Object.keys(flatEn)) {
    assert.deepEqual(placeholders(flatZh[key]), placeholders(flatEn[key]), `interpolation mismatch: ${key}`);
  }
  const banned = /視頻|信息|數據|默認|保存|加載|鏈接/;
  for (const [key, value] of Object.entries(flatZh)) assert.doesNotMatch(String(value), banned, `non-Taiwan wording: ${key}`);
});

test('all declarative HTML bindings and dynamic registry keys exist in both catalogs', async () => {
  const html = await readFile(new URL('../../index.html', import.meta.url), 'utf8');
  const boundKeys = [...html.matchAll(/data-i18n(?:-title|-aria-label|-placeholder)?="([^"]+)"/g)].map((match) => match[1]);
  const flatEn = flatten(en);
  const flatZh = flatten(zhTW);
  for (const key of new Set(boundKeys)) {
    assert.ok(flatEn[key], `index.html binding missing from en: ${key}`);
    assert.ok(flatZh[key], `index.html binding missing from zh-TW: ${key}`);
  }
  assert.ok(Object.keys(DYNAMIC_EXACT_PHRASES).length >= 180, 'dynamic exact registry coverage regressed');
  assert.ok(DYNAMIC_PARAMETERIZED_PHRASES.length >= 20, 'dynamic parameterized registry coverage regressed');
  for (const key of [
    ...Object.values(DYNAMIC_EXACT_PHRASES),
    ...DYNAMIC_PARAMETERIZED_PHRASES.map(({ key }) => key),
  ]) {
    assert.ok(flatEn[key], `dynamic registry key missing from en: ${key}`);
    assert.ok(flatZh[key], `dynamic registry key missing from zh-TW: ${key}`);
  }
});

test('dynamic seam translates exact and parameterized copy while preserving identifiers', () => {
  const zh = createI18n({ locale: 'zh-TW', storage: memoryStorage() });
  assert.deepEqual(resolveDynamicPhrase('Altitude'), { key: 'fields.altitude', values: {} });
  assert.deepEqual(resolveDynamicPhrase('Updated 2 minutes ago'), {
    key: 'dynamic.updatedAgo', values: { value: '2 minutes' },
  });
  assert.equal(translateDynamicPhrase('Callsign: EVA123', zh), '呼號：EVA123');
  assert.equal(translateDynamicPhrase('ICAO: 899123', zh), 'ICAO：899123');
  assert.equal(translateDynamicPhrase('NORAD: 25544', zh), 'NORAD：25544');
  assert.equal(translateDynamicPhrase('Data Source: OpenSky', zh), '資料來源：OpenSky');
  assert.equal(translateDynamicPhrase('Loaded 12 aircraft', zh), '已載入 12 架航空器');
});

test('mutation translation is loop-safe, refreshes parameters, and switching to en restores English', () => {
  const element = {
    nodeType: 1, dataset: {}, children: [], textContent: 'Loaded 2 aircraft',
    querySelectorAll() { return []; }, matches(selector) { return selector === '[data-i18n]'; },
  };
  const root = {
    nodeType: 1, dataset: {}, children: [element],
    querySelectorAll(selector) { return selector === '[data-i18n]' || selector === '*' ? [element] : []; },
    matches() { return false; },
  };
  let callback;
  let writes = 0;
  let last = element.textContent;
  Object.defineProperty(element, 'textContent', {
    get: () => last,
    set: (value) => { writes += 1; last = value; },
  });
  class Observer {
    constructor(cb) { callback = cb; }
    observe() {}
    disconnect() {}
  }
  const i18n = createI18n({ locale: 'zh-TW', storage: memoryStorage() });
  const stop = observeI18n(root, i18n, Observer);
  assert.equal(element.textContent, '已載入 2 架航空器');
  callback([{ type: 'characterData', target: { nodeType: 3, parentElement: element }, addedNodes: [] }]);
  assert.equal(writes, 1, 'observer translated its own output again');
  last = 'Loaded 5 aircraft';
  callback([{ type: 'characterData', target: { nodeType: 3, parentElement: element }, addedNodes: [] }]);
  assert.equal(element.textContent, '已載入 5 架航空器');
  i18n.setLocale('en');
  applyI18nBindings(root, i18n);
  assert.equal(element.textContent, 'Loaded 5 aircraft');
  stop();
});

test('locale normalization and detection respect storage, browser order, and defaults', () => {
  assert.equal(normalizeLocale('zh-Hant-HK'), 'zh-TW');
  assert.equal(normalizeLocale('en-GB'), 'en');
  assert.equal(normalizeLocale('ja-JP'), null);
  assert.equal(detectLocale({ storage: memoryStorage({ [LOCALE_STORAGE_KEY]: 'en' }), languages: ['zh-TW'] }), 'en');
  assert.equal(detectLocale({ storage: memoryStorage(), languages: ['ja', 'zh-HK', 'en-US'] }), 'zh-TW');
  assert.equal(detectLocale({ storage: memoryStorage(), languages: ['fr', 'en-AU'] }), 'en');
  assert.equal(detectLocale({ storage: memoryStorage(), languages: ['fr'] }), 'en');
  assert.equal(detectLocale({ storage: memoryStorage(), languages: [] }), 'zh-TW');
});

test('locale and unit factories survive a throwing global localStorage getter', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() { throw new Error('storage access denied'); },
  });
  try {
    assert.doesNotThrow(() => detectLocale({ languages: [] }));
    assert.doesNotThrow(() => createI18n({ locale: 'zh-TW', document: undefined }));
    assert.doesNotThrow(() => createUnits({ locale: 'zh-TW' }));
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  }
});

test('bootstrap does not expose a non-reactive unit selector', async () => {
  const source = await readFile(new URL('./bootstrap.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /unit-system-select/);
});

test('translation supports interpolation, English fallback, persistence, and html lang', () => {
  const storage = memoryStorage();
  const document = { documentElement: { lang: '' }, dispatchEvent() {} };
  const i18n = createI18n({ locale: 'zh-TW', storage, document });
  assert.equal(i18n.t('status.itemsLoaded', { count: 3 }), '已載入 3 個項目');
  assert.equal(i18n.t('missing.key', {}, 'Fallback text'), 'Fallback text');
  delete zhTW.testFallback;
  en.testFallback = 'English fallback';
  assert.equal(i18n.t('testFallback'), 'English fallback');
  i18n.setLocale('en');
  assert.equal(storage.getItem(LOCALE_STORAGE_KEY), 'en');
  assert.equal(document.documentElement.lang, 'en');
});

test('Intl formatters are locale aware while operational UTC stays UTC', () => {
  const zh = createFormatters('zh-TW');
  const enUS = createFormatters('en');
  assert.equal(zh.locale, 'zh-TW');
  assert.equal(enUS.locale, 'en-US');
  const instant = new Date('2026-01-02T03:04:00Z');
  assert.notEqual(zh.date(instant), enUS.date(instant));
  assert.match(zh.operationalTime(instant), /03:04/);
  assert.match(enUS.relative(-1, 'hour'), /hour ago/);
});

test('units default independently by locale, convert, format, and persist', () => {
  assert.equal(defaultUnitSystem('zh-TW'), 'metric');
  assert.equal(defaultUnitSystem('en'), 'imperial');
  assert.ok(Math.abs(convertDistance(1, 'kilometer', 'mile') - 0.621371) < 0.00001);
  const storage = memoryStorage();
  const units = createUnits({ locale: 'zh-TW', storage });
  assert.equal(units.system, 'metric');
  assert.match(units.distance(1609.344), /公里/);
  units.setSystem('imperial');
  assert.equal(storage.getItem(UNIT_STORAGE_KEY), 'imperial');
  units.setLocale('en');
  assert.equal(units.system, 'imperial');
  assert.match(units.distance(1609.344), /mi/);
  assert.match(units.speed(10), /kt/);
  assert.match(units.altitude(100), /ft/);
  assert.match(units.temperature(0), /32/);
});

test('DOM bindings translate text and accessible attributes', () => {
  const attrs = {
    '[data-i18n]': [{ dataset: { i18n: 'common.loading' }, textContent: '' }],
    '[data-i18n-title]': [{ dataset: { i18nTitle: 'actions.share' }, setAttribute(k, v) { this[k] = v; } }],
    '[data-i18n-aria-label]': [{ dataset: { i18nAriaLabel: 'actions.resetGlobe' }, setAttribute(k, v) { this[k] = v; } }],
    '[data-i18n-placeholder]': [{ dataset: { i18nPlaceholder: 'search.placeholder' }, setAttribute(k, v) { this[k] = v; } }],
  };
  const root = { querySelectorAll: (selector) => attrs[selector] ?? [] };
  const i18n = createI18n({ locale: 'zh-TW', storage: memoryStorage() });
  applyI18nBindings(root, i18n);
  assert.equal(attrs['[data-i18n]'][0].textContent, '載入中');
  assert.equal(attrs['[data-i18n-title]'][0].title, '複製分享連結');
  assert.equal(attrs['[data-i18n-aria-label]'][0]['aria-label'], '重設為完整地球視角');
  assert.equal(attrs['[data-i18n-placeholder]'][0].placeholder, '搜尋地點或座標');
});
