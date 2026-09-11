const EXACT_GROUPS = Object.freeze({
  'app.tagline': ['NO PLACE LEFT BEHIND'],
  'app.activeStyle': ['ACTIVE STYLE'],
  'status.loadingLiveData': ['LOADING LIVE DATA'],
  'status.syncingRoads': ['syncing road network', 'SYNCING ROAD NETWORK'],
  'status.loadingFrames': ['loading frames', 'LOADING FRAMES'],
  'status.cameraGridReady': ['camera grid ready', 'CAMERA GRID READY'],
  'common.loading': ['Loading', 'LOADING'], 'common.ready': ['Ready', 'READY'],
  'common.success': ['Success', 'SUCCESS'], 'common.error': ['Error', 'ERROR'],
  'common.warning': ['Warning', 'WARNING'], 'common.empty': ['No data available', 'NO DATA AVAILABLE'],
  'common.unknown': ['Unknown', 'UNKNOWN'], 'common.unavailable': ['Unavailable', 'UNAVAILABLE'],
  'common.enabled': ['Enable', 'ENABLE', 'Enabled', 'ENABLED'], 'common.disabled': ['Disable', 'DISABLE', 'Disabled', 'DISABLED'],
  'common.close': ['Close', 'CLOSE'], 'common.save': ['Save', 'SAVE'], 'common.cancel': ['Cancel', 'CANCEL'],
  'common.apply': ['Apply', 'APPLY'], 'common.clear': ['Clear', 'CLEAR'], 'common.all': ['All', 'ALL'],
  'common.none': ['None', 'NONE'], 'common.on': ['On', 'ON'], 'common.off': ['Off', 'OFF'],
  'common.retry': ['Retry', 'RETRY'], 'common.new': ['New', 'NEW'], 'common.delete': ['Delete', 'DELETE', 'DEL'],
  'common.start': ['Start', 'START'], 'common.stop': ['Stop', 'STOP'], 'common.previous': ['Previous', 'PREVIOUS', 'PREV'],
  'common.next': ['Next', 'NEXT'], 'common.focus': ['Focus', 'FOCUS'], 'common.nearest': ['Nearest', 'NEAREST'],
  'common.adjust': ['Adjust', 'ADJUST'], 'common.reset': ['Reset', 'RESET'], 'common.import': ['Import', 'IMPORT'],
  'common.export': ['Export', 'EXPORT'], 'actions.play': ['Play', 'PLAY'], 'actions.pause': ['Pause', 'PAUSE'],
  'actions.dismiss': ['Dismiss', 'DISMISS'], 'actions.select': ['Select', 'SELECT'], 'actions.open': ['Open', 'OPEN'],
  'actions.back': ['Back', 'BACK'], 'actions.exit': ['Exit', 'EXIT'], 'actions.refresh': ['Refresh', 'REFRESH'],
  'layers.title': ['Data layers', 'DATA LAYERS'], 'settings.dataSources': ['Data sources', 'DATA SOURCES'],
  'settings.title': ['Settings', 'SETTINGS'], 'settings.provider': ['Provider settings', 'PROVIDER SETTINGS'],
  'settings.saveKeys': ['Save keys', 'SAVE KEYS'], 'settings.apiKey': ['API key', 'API KEY'],
  'settings.defaultProvider': ['Default provider', 'DEFAULT PROVIDER'], 'settings.configured': ['Configured', 'CONFIGURED'],
  'settings.notConfigured': ['Not configured', 'NOT CONFIGURED'], 'settings.powerUp': ['Power up', 'POWER UP'],
  'search.label': ['Search', 'SEARCH'], 'search.filter': ['Filter', 'FILTER'], 'search.searching': ['Searching', 'SEARCHING'],
  'search.noResults': ['No search results', 'NO SEARCH RESULTS'], 'location.label': ['Location', 'LOCATION'],
  'location.landmark': ['Landmark', 'LANDMARK'], 'location.region': ['Region', 'REGION'],
  'location.resolving': ['Resolving region', 'RESOLVING REGION'], 'location.unavailable': ['Region unavailable', 'REGION UNAVAILABLE'],
  'location.positionUnavailable': ['Position unavailable', 'POSITION UNAVAILABLE'], 'location.localInfo': ['Local info', 'LOCAL INFO', 'LOCAL'],
  'location.regionalNews': ['Regional news', 'REGIONAL NEWS', 'NEWS'],
  'layers.aircraft': ['Aircraft', 'AIRCRAFT', 'Flights', 'FLIGHTS', 'Live Flights'],
  'layers.militaryAircraft': ['Military aircraft', 'MILITARY AIRCRAFT', 'Military flights', 'MILITARY FLIGHTS'],
  'layers.vessels': ['Vessels', 'VESSELS', 'Ships', 'SHIPS', 'Live AIS Vessels'],
  'layers.satellites': ['Satellites', 'SATELLITES'], 'layers.earthquakes': ['Earthquakes', 'EARTHQUAKES'],
  'layers.wildfires': ['Wildfires', 'WILDFIRES', 'Active fires', 'ACTIVE FIRES', 'FIRMS Active Fires'],
  'layers.cctv': ['Live cameras', 'LIVE CAMERAS', 'CCTV'], 'layers.rockets': ['Rocket launches', 'ROCKET LAUNCHES'],
  'layers.traffic': ['Traffic', 'TRAFFIC', 'Street Traffic'], 'layers.radio': ['Radio', 'RADIO'],
  'layers.bikeshare': ['Bike share', 'BIKE SHARE', 'Bikeshare'],
  'layers.militaryInstallations': ['Military installations', 'MILITARY INSTALLATIONS', 'Mapped Installations'],
  'layers.datacenters': ['Datacenters', 'DATACENTERS'], 'layers.dams': ['Dams', 'DAMS'],
  'layers.submarineCables': ['Submarine Cables', 'SUBMARINE CABLES'], 'layers.globalContext': ['Global Context', 'GLOBAL CONTEXT'],
  'map.source': ['Map source', 'MAP SOURCE'], 'map.sources': ['Map sources', 'MAP SOURCES'],
  'map.style': ['Style', 'STYLE'], 'map.stack': ['Map stack', 'MAP STACK'], 'map.normal': ['Normal', 'NORMAL'],
  'map.satellite': ['Satellite imagery', 'SATELLITE IMAGERY'], 'map.terrain': ['Terrain', 'TERRAIN'],
  'map.photorealistic3d': ['Photorealistic 3D', 'PHOTOREALISTIC 3D'], 'map.fallback': ['Fallback map', 'FALLBACK MAP'],
  'map.unavailable': ['Map unavailable', 'MAP UNAVAILABLE'], 'map.sourceUnavailable': ['Map source unavailable', 'MAP SOURCE UNAVAILABLE'],
  'map.requiresKey': ['Requires API key', 'REQUIRES API KEY'],
  'fields.altitude': ['Altitude', 'ALTITUDE'], 'fields.speed': ['Speed', 'SPEED'], 'fields.heading': ['Heading', 'HEADING'],
  'fields.latitude': ['Latitude', 'LATITUDE'], 'fields.longitude': ['Longitude', 'LONGITUDE'],
  'fields.callsign': ['Callsign', 'CALLSIGN'], 'fields.icao': ['ICAO'], 'fields.operator': ['Operator', 'OPERATOR'],
  'fields.country': ['Country', 'COUNTRY'], 'fields.updated': ['Updated', 'UPDATED'],
  'fields.dataSource': ['Data source', 'DATA SOURCE'], 'fields.source': ['Source', 'SOURCE'],
  'fields.name': ['Name', 'NAME'], 'fields.type': ['Type', 'TYPE'], 'fields.status': ['Status', 'STATUS'],
  'fields.time': ['Time', 'TIME'], 'fields.coordinates': ['Coordinates', 'COORDINATES'],
  'fields.distance': ['Distance', 'DISTANCE'], 'fields.bearing': ['Bearing', 'BEARING'],
  'hud.title': ['HUD', 'Heads-up display'], 'hud.firstPerson': ['First person', 'FIRST PERSON'],
  'hud.groundSpeed': ['Ground speed', 'GROUND SPEED', 'GROUND SPEED · KTS'], 'hud.course': ['Course', 'COURSE'],
  'hud.level': ['Level', 'LEVEL'], 'hud.current': ['Current', 'CURRENT'], 'hud.liveTrack': ['Live track', 'LIVE TRACK'],
  'hud.staleFeed': ['Stale feed', 'STALE FEED'], 'hud.surfaceFallback': ['Surface fallback', 'SURFACE FALLBACK'],
  'hud.courseAligned': ['Course aligned', 'COURSE ALIGNED'], 'hud.trackAcquired': ['Track acquired', 'TRACK ACQUIRED'],
  'hud.contactLost': ['Contact lost', 'CONTACT LOST'], 'hud.contextOnly': ['Context only', 'CONTEXT ONLY'],
  'hud.nearestObserved': ['Nearest observed / mapped', 'NEAREST OBSERVED / MAPPED'],
  'hud.availableInputsOnly': ['AVAILABLE INPUTS ONLY · NOT AN ALL-CLEAR'],
  'hud.liveSignals': ['Live signals', 'LIVE SIGNALS'], 'hud.estimatedFlightPlan': ['Estimated flight plan', 'ESTIMATED FLIGHT PLAN'],
  'hud.routeUnavailable': ['Route data unavailable', 'ROUTE DATA UNAVAILABLE'], 'hud.from': ['From', 'FROM'],
  'hud.to': ['To', 'TO'], 'hud.display': ['Display', 'DISPLAY'], 'hud.exitCockpit': ['Exit cockpit', 'EXIT COCKPIT'],
  'vessel.title': ['Vessel', 'VESSEL'], 'vessel.mmsi': ['MMSI'], 'vessel.imo': ['IMO'],
  'vessel.shipType': ['Vessel type', 'VESSEL TYPE', 'Ship type', 'SHIP TYPE'],
  'vessel.navigationStatus': ['Navigation status', 'NAVIGATION STATUS'], 'vessel.destination': ['Destination', 'DESTINATION'],
  'vessel.draught': ['Draught', 'DRAUGHT'], 'vessel.length': ['Length', 'LENGTH'], 'vessel.beam': ['Beam', 'BEAM'],
  'satellite.norad': ['NORAD'], 'satellite.altitude': ['Orbital altitude', 'ORBITAL ALTITUDE'],
  'satellite.orbitClass': ['Orbit class', 'ORBIT CLASS'], 'satellite.inclination': ['Inclination', 'INCLINATION'],
  'satellite.period': ['Orbital period', 'ORBITAL PERIOD'], 'satellite.nextPass': ['Next pass', 'NEXT PASS'],
  'earthquake.magnitude': ['Magnitude', 'MAGNITUDE'], 'earthquake.depth': ['Depth', 'DEPTH'],
  'earthquake.time': ['Earthquake time', 'EARTHQUAKE TIME'], 'earthquake.felt': ['Felt reports', 'FELT REPORTS'],
  'wildfire.frp': ['FRP', 'Fire radiative power', 'FIRE RADIATIVE POWER'], 'wildfire.age': ['Age', 'AGE'],
  'wildfire.confidence': ['Confidence', 'CONFIDENCE'], 'wildfire.brightness': ['Brightness', 'BRIGHTNESS'],
  'cctv.camera': ['Camera', 'CAMERA'], 'cctv.source': ['Camera source', 'CAMERA SOURCE'], 'cctv.frame': ['Frame', 'FRAME'],
  'cctv.frames': ['Frames', 'FRAMES'], 'cctv.calibration': ['Calibration', 'CALIBRATION'],
  'cctv.projection': ['Projection', 'PROJECTION'], 'cctv.coverage': ['Coverage', 'COVERAGE'],
  'cctv.autoHop': ['Auto hop', 'AUTO HOP'], 'cctv.quality': ['Calibration quality', 'CALIBRATION QUALITY'],
  'cctv.pose': ['Camera pose', 'CAMERA POSE'], 'cctv.pitch': ['Pitch', 'PITCH'], 'cctv.fov': ['FOV', 'Field of view'],
  'cctv.range': ['Range', 'RANGE'], 'cctv.saveCalibration': ['Save calibration', 'SAVE CAL'],
  'cctv.resetCalibration': ['Reset calibration', 'RESET CAL'], 'cctv.sceneSummary': ['Scene summary', 'SCENE SUMMARY'],
  'rocket.mission': ['Mission', 'MISSION'], 'rocket.missions': ['Space Missions', 'SPACE MISSIONS'],
  'rocket.availableMissions': ['Available missions', 'AVAILABLE MISSIONS'], 'rocket.status': ['Launch status', 'LAUNCH STATUS'],
  'rocket.site': ['Launch site', 'LAUNCH SITE'], 'rocket.payload': ['Payload', 'PAYLOAD'], 'rocket.stage': ['Stage', 'STAGE'],
  'rocket.replay': ['Replay', 'REPLAY'], 'rocket.vehicle': ['Launch vehicle', 'LAUNCH VEHICLE'],
  'rocket.window': ['Launch window', 'LAUNCH WINDOW'], 'rocket.loadingIndex': ['LOADING 30-DAY MISSION INDEX'],
  'traffic.congestion': ['Congestion', 'CONGESTION'], 'traffic.flow': ['Traffic flow', 'TRAFFIC FLOW'],
  'traffic.incident': ['Traffic incident', 'TRAFFIC INCIDENT'], 'traffic.road': ['Road', 'ROAD'],
  'bikeshare.station': ['Bike-share station', 'BIKE-SHARE STATION'],
  'bikeshare.availableBikes': ['Available bikes', 'AVAILABLE BIKES'], 'bikeshare.availableDocks': ['Available docks', 'AVAILABLE DOCKS'],
  'bikeshare.capacity': ['Capacity', 'CAPACITY'], 'radio.station': ['Station', 'STATION'],
  'radio.stationTag': ['Station tag', 'STATION TAG'], 'radio.directoryBand': ['Directory band', 'DIRECTORY BAND'],
  'radio.dragToTune': ['Drag to tune', 'DRAG TO TUNE'], 'radio.noStation': ['No station selected', 'NO STATION SELECTED'],
  'radio.noStationAvailable': ['No station available', 'NO STATION AVAILABLE'],
  'radio.stationUnavailable': ['Station unavailable', 'STATION UNAVAILABLE'], 'radio.offAir': ['Off air', 'OFF AIR'],
  'radio.radioOff': ['Radio off', 'RADIO OFF'], 'radio.volume': ['Volume', 'VOLUME'],
  'scene.title': ['Scenes', 'SCENES'], 'scene.recipe': ['Scene recipe', 'SCENE RECIPE'],
  'scene.captureShot': ['Capture shot', 'CAPTURE SHOT'], 'scene.updateShot': ['Update shot', 'UPDATE SHOT'],
  'scene.exportPresets': ['Export presets', 'EXPORT PRESETS'], 'scene.importPresets': ['Import presets', 'IMPORT PRESETS'],
  'scene.runLog': ['Run log', 'RUN LOG'], 'scene.ready': ['Scene ready', 'SCENE READY'],
  'display.title': ['Display options', 'DISPLAY OPTIONS'], 'display.parameters': ['Parameters', 'PARAMETERS'],
  'display.layout': ['Layout', 'LAYOUT'], 'display.tactical': ['Tactical', 'TACTICAL'],
  'display.operator': ['Operator layout', 'OPERATOR LAYOUT'], 'display.minimal': ['Minimal', 'MINIMAL'],
  'display.detection': ['Detection', 'DETECTION', 'DETECT'], 'display.density': ['Density', 'DENSITY'],
  'display.allocation': ['Allocation', 'ALLOCATION'], 'display.elastic': ['Elastic', 'ELASTIC'],
  'display.weighted': ['Weighted', 'WEIGHTED'], 'display.fade': ['Fade', 'FADE'],
  'display.outside': ['Outside', 'OUTSIDE'], 'display.models': ['Models', 'MODELS'],
  'display.proximity': ['Proximity', 'PROXIMITY'], 'display.scope': ['Scope', 'SCOPE'],
  'display.feather': ['Feather', 'FEATHER'], 'display.celestial': ['Celestial', 'CELESTIAL'],
  'display.cleanUi': ['Clean UI', 'CLEAN UI'], 'display.exitCleanView': ['Exit clean view', 'EXIT CLEAN VIEW'],
  'display.bloom': ['Bloom', 'BLOOM'], 'display.sharpen': ['Sharpen', 'SHARPEN'],
  'display.visualPresets': ['Visual presets', 'VISUAL PRESETS'], 'display.crt': ['CRT'], 'display.nvg': ['NVG'],
  'display.flir': ['FLIR'], 'display.anime': ['Anime', 'ANIME'], 'display.noir': ['Noir', 'NOIR'], 'display.snow': ['Snow', 'SNOW'],
  'voice.microphone': ['Microphone', 'MICROPHONE'], 'voice.mic': ['MIC'], 'voice.connect': ['Connect voice', 'CONNECT VOICE'],
  'voice.connecting': ['Connecting voice', 'CONNECTING VOICE'], 'voice.connected': ['Voice connected', 'VOICE CONNECTED'],
  'voice.listening': ['Listening', 'LISTENING'], 'voice.speaking': ['Speaking', 'SPEAKING'],
  'voice.muted': ['Muted', 'MUTED'], 'voice.estimatedCost': ['Estimated cost', 'ESTIMATED COST'],
  'panels.details': ['Details', 'DETAILS'], 'panels.dashboard': ['Dashboard', 'DASHBOARD'],
  'panels.context': ['Context', 'CONTEXT'], 'panels.contacts': ['Contacts', 'CONTACTS'],
  'firstRun.kicker': ['MISSION CONTROL · FIRST LAUNCH'], 'firstRun.title': ['Choose your first view'],
  'firstRun.contacts': ['LIVE CONTACTS'], 'firstRun.contactsDetail': ['Aircraft, vessels and nearby intelligence'],
  'firstRun.space': ['Launches, spacecraft and orbital context'], 'firstRun.environment': ['ENVIRONMENTAL'],
  'firstRun.environmentDetail': ['Live earthquakes and active fires, from USGS and NASA'],
  'firstRun.explore': ['EXPLORE MANUALLY'], 'firstRun.exploreDetail': ['Begin with a clean globe'],
  'firstRun.dontShow': ["Don't show this again"], 'firstRun.escape': ['ESC to dismiss'],
  'dialogs.close': ['Close dialog', 'CLOSE DIALOG'], 'dialogs.confirm': ['Confirm', 'CONFIRM'],
  'tooltips.moreInformation': ['More information', 'MORE INFORMATION'],
  'tooltips.collapsePanel': ['Collapse panel', 'Collapse Panel'], 'tooltips.expandPanel': ['Expand panel', 'Expand Panel'],
  'tooltips.keepOpen': ['Keep open', 'Keep visual presets open', 'Keep location tray open'],
  'tooltips.searchLocation': ['Search any location'], 'tooltips.clickToType': ['Click to type'],
  'actions.clearLayers': ['Clear selected data layers'], 'actions.clearLayersTitle': ['Turn off all selected data layers'],
  'actions.share': ['Copy share link'], 'actions.resetGlobe': ['Reset to full globe view'],
  'actions.resetGlobeTitle': ['Reset camera and return to full globe view'],
  'a11y.closeAttribution': ['Close data attribution'], 'a11y.previousPage': ['Previous page'], 'a11y.nextPage': ['Next page'],
  'a11y.loading': ['Content is loading'], 'map.visibleTargets': ['Visible map targets'], 'map.controls': ['Map controls'],
});

export const DYNAMIC_EXACT_PHRASES = Object.freeze(Object.fromEntries(
  Object.entries(EXACT_GROUPS).flatMap(([key, phrases]) => phrases.map((phrase) => [phrase, key])),
));

export const DYNAMIC_PARAMETERIZED_PHRASES = Object.freeze([
  { key: 'dynamic.callsignValue', pattern: /^Callsign\s*:\s*(?<value>.+)$/i },
  { key: 'dynamic.icaoValue', pattern: /^ICAO\s*:\s*(?<value>.+)$/i },
  { key: 'dynamic.noradValue', pattern: /^NORAD\s*:\s*(?<value>.+)$/i },
  { key: 'dynamic.dataSourceValue', pattern: /^Data Source\s*:\s*(?<value>.+)$/i },
  { key: 'dynamic.operatorValue', pattern: /^Operator\s*:\s*(?<value>.+)$/i },
  { key: 'dynamic.countryValue', pattern: /^Country\s*:\s*(?<value>.+)$/i },
  { key: 'dynamic.mmsiValue', pattern: /^MMSI\s*:\s*(?<value>.+)$/i },
  { key: 'dynamic.updatedAgo', pattern: /^Updated\s+(?<value>.+)\s+ago$/i },
  { key: 'dynamic.loadedAircraft', pattern: /^Loaded\s+(?<count>[\d,]+)\s+aircraft$/i },
  { key: 'dynamic.loadedVessels', pattern: /^Loaded\s+(?<count>[\d,]+)\s+vessels?$/i },
  { key: 'dynamic.loadedSatellites', pattern: /^Loaded\s+(?<count>[\d,]+)\s+satellites?$/i },
  { key: 'dynamic.loadedFrames', pattern: /^Loaded\s+(?<count>[\d,]+)\s+frames?$/i },
  { key: 'dynamic.loadedItems', pattern: /^Loaded\s+(?<count>[\d,]+)\s+items?$/i },
  { key: 'dynamic.sourceDot', pattern: /^Source\s*·\s*(?<value>.+)$/i },
  { key: 'dynamic.locationValue', pattern: /^Location\s*:\s*(?<value>.+)$/i },
  { key: 'dynamic.landmarkValue', pattern: /^Landmark\s*:\s*(?<value>.+)$/i },
  { key: 'dynamic.altitudeValue', pattern: /^Altitude\s*:\s*(?<value>.+)$/i },
  { key: 'dynamic.speedValue', pattern: /^Speed\s*:\s*(?<value>.+)$/i },
  { key: 'dynamic.headingValue', pattern: /^Heading\s*:\s*(?<value>.+)$/i },
  { key: 'dynamic.magnitudeValue', pattern: /^Magnitude\s*:\s*(?<value>.+)$/i },
  { key: 'dynamic.depthValue', pattern: /^Depth\s*:\s*(?<value>.+)$/i },
  { key: 'dynamic.confidenceValue', pattern: /^Confidence\s*:\s*(?<value>.+)$/i },
  { key: 'dynamic.frpValue', pattern: /^FRP\s*:\s*(?<value>.+)$/i },
  { key: 'dynamic.availableBikes', pattern: /^Available bikes\s*:\s*(?<count>[\d,]+)$/i },
  { key: 'dynamic.availableDocks', pattern: /^Available docks\s*:\s*(?<count>[\d,]+)$/i },
  { key: 'dynamic.missionValue', pattern: /^Mission\s*:\s*(?<value>.+)$/i },
  { key: 'dynamic.statusValue', pattern: /^Status\s*:\s*(?<value>.+)$/i },
  { key: 'dynamic.payloadValue', pattern: /^Payload\s*:\s*(?<value>.+)$/i },
  { key: 'dynamic.stageValue', pattern: /^Stage\s*:\s*(?<value>.+)$/i },
  { key: 'dynamic.channelCount', pattern: /^CH\s+(?<current>\d+)\s*\/\s*(?<total>\d+)$/i },
  { key: 'dynamic.itemsOfTotal', pattern: /^(?<current>\d+)\s+of\s+(?<total>\d+)$/i },
  { key: 'dynamic.unavailableReason', pattern: /^(?<label>.+)\s+unavailable:\s*(?<reason>.+)$/i },
  { key: 'dynamic.selectFlight', pattern: /^Select flight\s+(?<value>.+)$/i },
  { key: 'dynamic.courseDegrees', pattern: /^Course\s+(?<value>[\d.]+)°$/i },
  { key: 'dynamic.destinationDegrees', pattern: /^(?:Dest|Destination)\s+(?<value>[\d.]+)°$/i },
]);

const BINDINGS = Object.freeze([
  ['[data-i18n]', 'i18n', null],
  ['[data-i18n-title]', 'i18nTitle', 'title'],
  ['[data-i18n-aria-label]', 'i18nAriaLabel', 'aria-label'],
  ['[data-i18n-placeholder]', 'i18nPlaceholder', 'placeholder'],
]);

const suffix = (datasetKey, name) => `${datasetKey}${name}`;

function parsedValues(raw) {
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}

function setTranslated(element, datasetKey, attribute, value) {
  const renderedKey = suffix(datasetKey, 'Rendered');
  element.dataset[renderedKey] = value;
  if (attribute) {
    if (element.getAttribute?.(attribute) !== value) element.setAttribute(attribute, value);
  } else if (element.textContent !== value) element.textContent = value;
}

export function applyI18nBindings(root, i18n) {
  for (const [selector, datasetKey, attribute] of BINDINGS) {
    const elements = [...(root?.querySelectorAll?.(selector) ?? [])];
    if (root?.matches?.(selector)) elements.unshift(root);
    for (const element of elements) {
      const values = parsedValues(element.dataset[suffix(datasetKey, 'Values')]);
      const source = element.dataset[suffix(datasetKey, 'Source')];
      const value = element.dataset[suffix(datasetKey, 'Dynamic')] === 'true' && i18n.locale === 'en' && source
        ? source : i18n.t(element.dataset[datasetKey], values);
      setTranslated(element, datasetKey, attribute, value);
    }
  }
}

export function resolveDynamicPhrase(text) {
  const source = String(text ?? '').trim();
  const key = DYNAMIC_EXACT_PHRASES[source];
  if (key) return { key, values: {} };
  for (const entry of DYNAMIC_PARAMETERIZED_PHRASES) {
    const match = entry.pattern.exec(source);
    if (match) return { key: entry.key, values: { ...(match.groups ?? {}) } };
  }
  return null;
}

export function translateDynamicPhrase(text, i18n) {
  const resolved = resolveDynamicPhrase(text);
  return resolved ? i18n.t(resolved.key, resolved.values) : text;
}

function tagBinding(element, datasetKey, attribute) {
  const dynamicKey = suffix(datasetKey, 'Dynamic');
  const renderedKey = suffix(datasetKey, 'Rendered');
  const current = attribute ? element.getAttribute?.(attribute) : element.textContent?.trim();
  if (!current || (element.dataset[dynamicKey] === 'true' && current === element.dataset[renderedKey])) return;
  if (element.dataset[datasetKey] && element.dataset[dynamicKey] !== 'true') return;
  const resolved = resolveDynamicPhrase(current);
  if (!resolved) return;
  element.dataset[datasetKey] = resolved.key;
  element.dataset[suffix(datasetKey, 'Values')] = JSON.stringify(resolved.values);
  element.dataset[suffix(datasetKey, 'Source')] = current;
  element.dataset[dynamicKey] = 'true';
}

/** Tag runtime-generated copy so locale changes remain reversible. */
export function tagKnownDynamicPhrases(root) {
  const elements = [root, ...(root?.querySelectorAll?.('*') ?? [])].filter(Boolean);
  for (const element of elements) {
    if (!element.dataset) continue;
    if (!element.children?.length) tagBinding(element, 'i18n', null);
    tagBinding(element, 'i18nTitle', 'title');
    tagBinding(element, 'i18nAriaLabel', 'aria-label');
    tagBinding(element, 'i18nPlaceholder', 'placeholder');
  }
}

export function observeI18n(root, i18n, MutationObserverClass = globalThis.MutationObserver) {
  if (!root || !MutationObserverClass) return () => {};
  const translate = (node = root) => {
    const target = node.nodeType === 3 ? node.parentElement : node;
    if (!target) return;
    tagKnownDynamicPhrases(target);
    applyI18nBindings(target, i18n);
  };
  translate(root);
  const observer = new MutationObserverClass((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'characterData' || mutation.type === 'attributes') translate(mutation.target);
      for (const node of mutation.addedNodes ?? []) if (node.nodeType === 1 || node.nodeType === 3) translate(node);
    }
  });
  observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['title', 'aria-label', 'placeholder'] });
  return () => observer.disconnect();
}
