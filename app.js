import {
  API,
  ANTIPODE_KM,
  FIBRE_KM_PER_MS,
  INTERVAL_S,
  ORIGIN_ANCHOR_ID,
  ZONES,
  compactAnchors,
  fetchLatest,
  summarise,
  zoneIndex,
} from './lib/atlas.js';

const SVG = 'http://www.w3.org/2000/svg';
const C = 500;
const R = 412;
const RIM_IN = 424;
const RIM_OUT = 482;
const DELAY_MAX_MS = 400;
const LIGHT_LIMIT_MS = (2 * ANTIPODE_KM) / FIBRE_KM_PER_MS;
const LAND_DELAY_SCALE = Math.sqrt(LIGHT_LIMIT_MS / DELAY_MAX_MS);
// One millisecond of round trip plays as this many milliseconds of animation.
const REPLAY_SLOWDOWN = 7;
const DISTANCE_RINGS = [1000, 2500, 5000, 10000, 15000];
const DELAY_RINGS = [20, 50, 100, 160, 250];
// South-east of Kraków the disc crosses the Indian Ocean, the sparsest bearing for ring labels.
const RING_LABEL_ANGLE = (68 * Math.PI) / 180;
const SHORT_LABELS = new Set(['London', 'New York', 'Tokyo', 'Singapore', 'Sydney', 'São Paulo', 'Johannesburg']);
const LABELLED = [
  'London', 'Moscow', 'New York', 'Los Angeles', 'Seattle', 'Tokyo', 'Singapore', 'Sydney', 'São Paulo',
  'Johannesburg', 'Dubai', 'Santiago', 'Auckland', 'Hong Kong', 'Mumbai', 'Nairobi', 'Reykjavik', 'Honolulu',
  'Lagos', 'Buenos Aires', 'Anchorage', 'Cairo', 'Almaty', 'Miami',
];
const TRIES = ['Tokyo', 'New York', 'São Paulo', 'Johannesburg', 'Sydney', 'Singapore'];
const ZONE_RANGE = ['under 20 ms', '20–50 ms', '50–100 ms', '100–160 ms', '160–250 ms', '250 ms and over'];
const ROMAN_MONTHS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

const $ = (s) => document.querySelector(s);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const regions = new Intl.DisplayNames(['en'], { type: 'region' });
const int = new Intl.NumberFormat('en-GB');
const countryName = (cc) => {
  try { return regions.of(cc); } catch { return cc; }
};
const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
const ms = (v) => (v >= 100 ? int.format(Math.round(v)) : v.toFixed(1));
const zoneOf = (c) => zoneIndex(c.rtt);
const markId = (z) => (z < 0 ? 'm-x' : `m-${z}`);
const markIcon = (z) => `<svg class="m" viewBox="-8 -8 16 16" aria-hidden="true"><use href="#${markId(z)}" x="-8" y="-8" width="16" height="16"/></svg>`;
const ICON_X = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 3.5 9 9m0-9-9 9"/></svg>';

function el(tag, attrs = {}, parent) {
  const node = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (parent) parent.append(node);
  return node;
}

function utcTime(sec, withSeconds = false) {
  const d = new Date(sec * 1000);
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  const ss = String(d.getUTCSeconds()).padStart(2, '0');
  return withSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
}

function postalDate(sec) {
  const d = new Date(sec * 1000);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const yy = String(d.getUTCFullYear()).slice(2);
  return `${dd} ${ROMAN_MONTHS[d.getUTCMonth()]} ${yy}`;
}

function ago(sec) {
  const m = Math.round((Date.now() / 1000 - sec) / 60);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 48 ? `${h} h ago` : `${Math.round(h / 24)} days ago`;
}

// ---------- state ----------

const state = {
  origin: null,
  anchors: null,
  summary: null,
  byId: new Map(),
  history: null,
  source: 'none',
  liveError: null,
  mode: 'distance',
  selected: null,
  hovered: null,
  sort: 'near',
  query: '',
  zone: null,
  u: 1,
  pollTimer: 0,
};

// ---------- projection ----------

// Azimuthal equidistant around Kraków, with distance on a square-root scale so
// Europe has room while bearings and rings stay true.
function sqrtAzimuthalRaw(lambda, phi) {
  const [x, y] = d3.geoAzimuthalEquidistantRaw(lambda, phi);
  const c = Math.hypot(x, y);
  if (c < 1e-12) return [0, 0];
  const k = (Math.sqrt(c / Math.PI) * Math.PI) / c;
  return [x * k, y * k];
}

let projection;
const radiusKm = (km) => R * Math.sqrt(Math.min(km, ANTIPODE_KM) / ANTIPODE_KM);
const radiusMs = (v) => R * Math.sqrt(Math.min(v, DELAY_MAX_MS) / DELAY_MAX_MS);

function place(city) {
  const [x, y] = projection([city.lon, city.lat]);
  const dx = x - C;
  const dy = y - C;
  const r = Math.hypot(dx, dy);
  const ux = r > 1e-6 ? dx / r : 0;
  const uy = r > 1e-6 ? dy / r : -1;
  city.dist = [x, y];
  city.ghost = [C + dx * LAND_DELAY_SCALE, C + dy * LAND_DELAY_SCALE];
  if (city.rtt != null) {
    const rr = radiusMs(city.rtt);
    city.delay = [C + ux * rr, C + uy * rr];
  } else {
    city.delay = city.ghost;
  }
}

const pos = (city) => (state.mode === 'delay' ? city.delay : city.dist);
const translate = ([x, y]) => `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;

// ---------- map scaffold ----------

const svg = $('#map');
const layer = {};

function buildMap(landTopo) {
  projection = d3
    .geoProjection(sqrtAzimuthalRaw)
    .rotate([-state.origin.lon, -state.origin.lat])
    .clipAngle(179.6)
    .scale(R / Math.PI)
    .translate([C, C])
    .precision(0.2);

  const defs = el('defs', {}, svg);
  defs.innerHTML = `
    <filter id="ink" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="4" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <clipPath id="disc-clip"><circle cx="${C}" cy="${C}" r="${R}"/></clipPath>
    <symbol id="m-0" viewBox="-8 -8 16 16"><circle r="4.7" style="fill:var(--z0)"/></symbol>
    <symbol id="m-1" viewBox="-8 -8 16 16"><circle r="4.7" style="fill:var(--z1)"/><circle r="1.8" style="fill:var(--paper-hi)"/></symbol>
    <symbol id="m-2" viewBox="-8 -8 16 16"><circle r="4" style="fill:var(--paper-hi);stroke:var(--z2);stroke-width:1.9"/></symbol>
    <symbol id="m-3" viewBox="-8 -8 16 16"><circle r="4" style="fill:var(--paper-hi);stroke:var(--z3);stroke-width:1.6"/><path d="M-6.4 0h12.8" style="stroke:var(--z3);stroke-width:1.7"/></symbol>
    <symbol id="m-4" viewBox="-8 -8 16 16"><circle r="4.8" style="fill:var(--paper-hi);stroke:var(--z4);stroke-width:1.3"/><circle r="2.1" style="fill:none;stroke:var(--z4);stroke-width:1.3"/></symbol>
    <symbol id="m-5" viewBox="-8 -8 16 16"><circle r="4.6" style="fill:var(--paper-hi);stroke:var(--z5);stroke-width:1.5"/><path d="M-2.6-2.6l5.2 5.2M2.6-2.6l-5.2 5.2" style="stroke:var(--z5);stroke-width:1.5;stroke-linecap:round"/></symbol>
    <symbol id="m-x" viewBox="-8 -8 16 16"><path d="M-3.8-3.8l7.6 7.6M3.8-3.8l-7.6 7.6" style="stroke:var(--air-red);stroke-width:2.3;stroke-linecap:round"/></symbol>
    <symbol id="m-origin" viewBox="-8 -8 16 16"><circle r="6.4" style="fill:var(--paper-hi);stroke:var(--ink);stroke-width:1.5"/><circle r="3.6" style="fill:none;stroke:var(--ink);stroke-width:0.8;stroke-dasharray:1 1.1"/><circle r="1.9" style="fill:var(--ink)"/></symbol>`;

  el('circle', { class: 'disc', cx: C, cy: C, r: R }, svg);

  layer.land = el('g', { class: 'land-plate', 'clip-path': 'url(#disc-clip)' }, svg);
  const land = topojson.feature(landTopo, landTopo.objects.land);
  el('path', { class: 'land', d: d3.geoPath(projection)(land) }, layer.land);

  layer.ringsDistance = el('g', { class: 'rings rings-distance' }, svg);
  layer.ringsDelay = el('g', { class: 'rings rings-delay' }, svg);
  layer.detours = el('g', { class: 'detours' }, svg);
  layer.light = el('circle', { class: 'light', cx: C, cy: C, r: 0 }, svg);
  layer.lightLabel = el('text', { class: 'light-label', x: C, y: C }, svg);
  layer.lightLabel.textContent = 'light in fibre';
  layer.cities = el('g', { class: 'cities' }, svg);
  layer.origin = el('g', { class: 'origin-mark' }, svg);
  layer.ringLabelsDistance = el('g', { class: 'rings rings-distance' }, svg);
  layer.ringLabelsDelay = el('g', { class: 'rings rings-delay' }, svg);
  layer.labels = el('g', { class: 'labels' }, svg);
  layer.hover = el('g', { class: 'focus-ring city' }, svg);
  layer.selected = el('g', { class: 'focus-ring city is-selected' }, svg);
  layer.rim = el('g', { class: 'rim', filter: 'url(#ink)' }, svg);

  for (const g of [layer.hover, layer.selected]) {
    el('circle', { class: 'f-outer', r: 10 }, g);
    el('circle', { class: 'f-inner', r: 14 }, g);
    el('text', {}, g);
    g.style.display = 'none';
  }

  const originUse = el('use', { href: '#m-origin', x: -8, y: -8, width: 16, height: 16, class: 'size' }, layer.origin);
  originUse.style.setProperty('--extra', '1.5');
  layer.originLabel = el('text', { class: 'origin-label', 'text-anchor': 'middle' }, layer.origin);
  layer.originLabel.textContent = state.origin.name;
  layer.origin.style.transform = translate([C, C]);

  drawRings();
  resize();
  new ResizeObserver(resize).observe(svg);
}

function ringLabel(parent, r, text, cls = '') {
  const x = C + Math.cos(RING_LABEL_ANGLE) * r;
  const y = C + Math.sin(RING_LABEL_ANGLE) * r;
  const t = el('text', { class: `ring-label ${cls}`, x: x.toFixed(1), y: y.toFixed(1), dy: '0.35em' }, parent);
  t.textContent = text;
}

function drawRings() {
  for (const km of DISTANCE_RINGS) {
    const r = radiusKm(km);
    el('circle', { class: 'ring', cx: C, cy: C, r }, layer.ringsDistance);
    ringLabel(layer.ringLabelsDistance, r, `${int.format(km)} km`, km === 5000 || km === 15000 ? '' : 'is-minor');
  }
  for (const v of DELAY_RINGS) {
    const r = radiusMs(v);
    el('circle', { class: 'ring', cx: C, cy: C, r }, layer.ringsDelay);
    ringLabel(layer.ringLabelsDelay, r, `${v} ms`, v === 50 || v === 250 ? '' : 'is-minor');
  }
  // The limit caption rides inside its own ring along the top, where the ring crosses the Arctic.
  const limit = radiusMs(LIGHT_LIMIT_MS);
  el('circle', { class: 'ring is-limit', cx: C, cy: C, r: limit }, layer.ringsDelay);
  const lr = limit - 6;
  el('path', { id: 'limit-path', fill: 'none', d: `M ${C - lr} ${C} A ${lr} ${lr} 0 0 1 ${C + lr} ${C}` }, layer.ringLabelsDelay);
  const t = el('text', { class: 'ring-label is-limit', dy: '0.7em' }, layer.ringLabelsDelay);
  const tp = el('textPath', { href: '#limit-path', startOffset: '50%' }, t);
  tp.textContent = `Light's limit · ${Math.round(LIGHT_LIMIT_MS)} ms`;
}

function drawRim() {
  const s = state.summary;
  layer.rim.replaceChildren();
  el('circle', { class: 'rim-ring', cx: C, cy: C, r: RIM_IN, 'stroke-width': 2.2 }, layer.rim);
  el('circle', { class: 'rim-ring', cx: C, cy: C, r: RIM_OUT, 'stroke-width': 3.4 }, layer.rim);

  const fs = Math.min(27, Math.max(15, 9 * state.u));
  const band = RIM_OUT - RIM_IN;
  const pathR = RIM_IN + (band - fs * 0.72) / 2;
  const id = 'rim-path';
  el('path', {
    id,
    d: `M ${C} ${C - pathR} a ${pathR} ${pathR} 0 1 1 0 ${2 * pathR} a ${pathR} ${pathR} 0 1 1 0 ${-2 * pathR}`,
    fill: 'none',
  }, layer.rim);

  const when = s?.collectedAt ? `${postalDate(s.collectedAt)} · ${utcTime(s.collectedAt)} UTC` : 'awaiting collection';
  const answered = s ? `${int.format(s.answered)} of ${int.format(s.total)} anchors answered` : '';
  // Non-breaking spaces survive where the end of the text meets its start at the top.
  const phrase = ['Round trips from Kraków', when, 'RIPE Atlas mesh 84162223', answered].filter(Boolean).join(' · ') + ' · ';
  const circ = 2 * Math.PI * pathR;
  const perChar = fs * 0.6;
  const reps = Math.max(1, Math.floor(circ / (phrase.length * perChar)));
  const text = el('text', { class: 'rim-text' }, layer.rim);
  text.style.fontSize = `${fs}px`;
  const tp = el('textPath', { href: `#${id}`, textLength: (circ - 2).toFixed(1), lengthAdjust: 'spacing' }, text);
  tp.textContent = phrase.repeat(reps);
}

function resize() {
  const box = svg.getBoundingClientRect();
  const drawn = Math.min(box.width, box.height) || 800;
  state.u = 1000 / drawn;
  state.compact = drawn < 600;
  svg.classList.toggle('is-compact', state.compact);
  const markPx = drawn < 520 ? 8.5 : drawn < 760 ? 9.5 : 10.5;
  svg.style.setProperty('--u', state.u.toFixed(3));
  svg.style.setProperty('--ms', ((markPx * state.u) / 10).toFixed(3));
  layer.originLabel.setAttribute('y', (17 * state.u).toFixed(1));
  drawRim();
  updateFocus();
}

// ---------- cities on the map ----------

const nodes = new Map();

function syncCities(previous) {
  const seen = new Set();
  for (const city of state.summary.cities) {
    seen.add(city.id);
    place(city);
    let n = nodes.get(city.id);
    const z = zoneOf(city);
    if (!n) {
      const g = el('g', { class: 'city' }, layer.cities);
      const mark = el('g', { class: 'mark' }, g);
      const use = el('use', { x: -8, y: -8, width: 16, height: 16, class: 'size' }, mark);
      n = { g, mark, use, label: null, line: null, ghost: null };
      nodes.set(city.id, n);
    }
    n.use.setAttribute('href', `#${markId(z)}`);
    n.g.style.transform = translate(pos(city));

    if (LABELLED.includes(city.name) && !n.label) {
      n.label = el('g', { class: 'city' }, layer.labels);
      el('text', {}, n.label);
    }
    if (n.label) {
      n.label.style.transform = translate(pos(city));
      drawCityLabel(n.label.firstChild, city);
    }

    const old = previous?.get(city.id);
    if (old && zoneIndex(old.rtt) !== z && !reduceMotion.matches) press(n.mark, 0);
  }
  for (const [id, n] of nodes) {
    if (!seen.has(id)) {
      n.g.remove();
      n.label?.remove();
      nodes.delete(id);
    }
  }
  drawDetours();
  applyDimming();
}

function drawCityLabel(text, city) {
  const right = pos(city)[0] > C + R * 0.55;
  const off = 9 * state.u;
  text.setAttribute('x', right ? -off : off);
  text.setAttribute('y', (4 * state.u).toFixed(1));
  text.setAttribute('text-anchor', right ? 'end' : 'start');
  text.innerHTML = `${esc(city.name)}${city.rtt != null ? ` <tspan class="ms">${ms(city.rtt)}</tspan>` : ''}`;
}

function drawDetours() {
  layer.detours.replaceChildren();
  const frag = document.createDocumentFragment();
  for (const city of state.summary.cities) {
    if (city.rtt == null) continue;
    const [gx, gy] = city.ghost;
    const [dx, dy] = city.delay;
    if (Math.hypot(dx - gx, dy - gy) < 2) continue;
    el('line', { x1: gx.toFixed(1), y1: gy.toFixed(1), x2: dx.toFixed(1), y2: dy.toFixed(1) }, frag);
    el('circle', { cx: gx.toFixed(1), cy: gy.toFixed(1), r: (1.4 * state.u).toFixed(2) }, frag);
  }
  layer.detours.append(frag);
}

function applyDimming() {
  const visible = filteredIds();
  for (const [id, n] of nodes) n.g.classList.toggle('is-dim', state.zone !== null && !visible.has(id));
  updateFocus();
}

function updateFocus() {
  if (!state.summary) return;
  setFocus(layer.hover, state.hovered && state.hovered !== state.selected ? state.byId.get(state.hovered) : null);
  setFocus(layer.selected, state.selected ? state.byId.get(state.selected) : null);
  resolveLabels();
}

// Greedy placement: focus labels and Kraków first, then the short list, then the rest;
// any label that would overlap one already placed stays hidden.
function resolveLabels() {
  const placed = [];
  const boxAt = (textEl, [x, y]) => {
    const b = textEl.getBBox();
    return { x1: b.x + x, y1: b.y + y, x2: b.x + b.width + x, y2: b.y + b.height + y };
  };
  const hits = (a) => placed.some((b) => a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1);

  placed.push(boxAt(layer.originLabel, [C, C]));
  const ringLabels = state.mode === 'delay' ? layer.ringLabelsDelay : layer.ringLabelsDistance;
  for (const t of ringLabels.querySelectorAll('text')) {
    if (!(state.compact && t.classList.contains('is-minor'))) placed.push(boxAt(t, [0, 0]));
  }
  for (const [g, id] of [[layer.selected, state.selected], [layer.hover, state.hovered]]) {
    const city = id && state.byId.get(id);
    if (city && g.style.display !== 'none') placed.push(boxAt(g.lastChild, pos(city)));
  }

  const candidates = [];
  for (const [id, n] of nodes) {
    if (!n.label) continue;
    const city = state.byId.get(id);
    const ruledOut =
      (state.compact && !SHORT_LABELS.has(city.name)) || id === state.hovered || id === state.selected || n.g.classList.contains('is-dim');
    if (ruledOut) n.label.classList.add('is-hidden');
    else candidates.push([n, city]);
  }
  candidates.sort(([, a], [, b]) => SHORT_LABELS.has(b.name) - SHORT_LABELS.has(a.name));
  for (const [n, city] of candidates) {
    const box = boxAt(n.label.firstChild, pos(city));
    const clash = hits(box);
    n.label.classList.toggle('is-hidden', clash);
    if (!clash) placed.push(box);
  }
}

function setFocus(g, city) {
  if (!city) {
    g.style.display = 'none';
    return;
  }
  g.style.display = '';
  g.style.transform = translate(pos(city));
  const [outer, inner, text] = g.children;
  outer.setAttribute('r', (9 * state.u).toFixed(1));
  inner.setAttribute('r', (13 * state.u).toFixed(1));
  const right = pos(city)[0] > C + R * 0.4;
  const off = 17 * state.u;
  text.setAttribute('x', right ? -off : off);
  text.setAttribute('y', (5 * state.u).toFixed(1));
  text.setAttribute('text-anchor', right ? 'end' : 'start');
  text.style.fontSize = `${Math.max(15, 13 * state.u)}px`;
  text.innerHTML = `${esc(city.name)} <tspan class="ms">${city.rtt != null ? `${ms(city.rtt)} ms` : 'no reply'}</tspan>`;
}

// ---------- motion ----------

function press(mark, delay) {
  return mark.animate(
    [
      { transform: 'scale(2.4)', opacity: 0 },
      { transform: 'scale(0.86)', opacity: 1, offset: 0.62 },
      { transform: 'scale(1)', opacity: 1 },
    ],
    { duration: 300, delay, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)', fill: 'backwards' },
  );
}

let replayFrame = 0;
let replayAnims = [];

function replay() {
  cancelAnimationFrame(replayFrame);
  replayAnims.forEach((a) => a.cancel());
  replayAnims = [];
  if (reduceMotion.matches || !state.summary) return;

  const cities = state.summary.cities;
  const slowest = Math.max(...cities.map((c) => c.rtt ?? 0));
  for (const city of cities) {
    const n = nodes.get(city.id);
    if (!n) continue;
    const t = city.rtt != null ? city.rtt * REPLAY_SLOWDOWN : slowest * REPLAY_SLOWDOWN + 250;
    replayAnims.push(press(n.mark, t));
    if (n.label) {
      replayAnims.push(n.label.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: t + 120, fill: 'backwards' }));
    }
  }

  const start = performance.now();
  const end = (state.mode === 'delay' ? DELAY_MAX_MS : LIGHT_LIMIT_MS) * REPLAY_SLOWDOWN;
  layer.light.style.opacity = '1';
  layer.lightLabel.style.opacity = '1';
  const tick = (now) => {
    const t = Math.max(0, now - start);
    const network = t / REPLAY_SLOWDOWN;
    const r = state.mode === 'delay' ? radiusMs(network) : radiusKm((network * FIBRE_KM_PER_MS) / 2);
    layer.light.setAttribute('r', r.toFixed(1));
    layer.lightLabel.setAttribute('y', (C - r - 6 * state.u).toFixed(1));
    layer.lightLabel.style.fontSize = `${Math.max(12, 11 * state.u)}px`;
    const fade = Math.max(0, Math.min(1, (end + 300 - t) / 300));
    layer.light.style.opacity = String(fade);
    layer.lightLabel.style.opacity = String(fade);
    if (t < end + 300) replayFrame = requestAnimationFrame(tick);
  };
  replayFrame = requestAnimationFrame(tick);
}

function setMode(mode) {
  state.mode = mode;
  svg.classList.toggle('is-delay', mode === 'delay');
  layer.land.style.transform = mode === 'delay' ? `scale(${LAND_DELAY_SCALE})` : '';
  for (const city of state.summary?.cities ?? []) {
    const n = nodes.get(city.id);
    if (!n) continue;
    n.g.style.transform = translate(pos(city));
    if (n.label) {
      n.label.style.transform = translate(pos(city));
      drawCityLabel(n.label.firstChild, city);
    }
  }
  updateFocus();
  $('#view-note').textContent =
    mode === 'delay'
      ? `Each city moves out to where its round trip puts it. The shrunken land is where light in fibre would place it; the line between is the detour. The solid ring is light's limit: ${Math.round(LIGHT_LIMIT_MS)} ms gets light to the far side of the Earth and back.`
      : 'Cities sit at their true direction and distance from Kraków.';
}

// ---------- pointer ----------

function nearest(evt) {
  if (!state.summary) return null;
  const pt = new DOMPoint(evt.clientX, evt.clientY).matrixTransform(svg.getScreenCTM().inverse());
  const limit = 16 * state.u;
  let best = null;
  let bestD = limit * limit;
  const visible = state.zone !== null ? filteredIds() : null;
  for (const city of state.summary.cities) {
    if (visible && !visible.has(city.id)) continue;
    const [x, y] = pos(city);
    const d = (x - pt.x) ** 2 + (y - pt.y) ** 2;
    if (d < bestD) {
      bestD = d;
      best = city;
    }
  }
  return best;
}

svg.addEventListener('pointermove', (evt) => {
  if (evt.pointerType === 'touch') return;
  const city = nearest(evt);
  const id = city?.id ?? null;
  svg.classList.toggle('is-over-city', !!city);
  if (id !== state.hovered) {
    state.hovered = id;
    updateFocus();
  }
});
svg.addEventListener('pointerleave', () => {
  state.hovered = null;
  svg.classList.remove('is-over-city');
  updateFocus();
});
svg.addEventListener('click', (evt) => {
  const city = nearest(evt);
  if (city) select(city.id);
});

// ---------- panel ----------

function select(id, { scroll = false } = {}) {
  state.selected = id;
  history.replaceState(null, '', id ? `#${id}` : location.pathname + location.search);
  updateFocus();
  renderSlip(true);
  renderRegister();
  if (scroll && matchMedia('(max-width: 1023px)').matches) $('#slip').scrollIntoView({ block: 'nearest', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
}

function renderStatus() {
  const s = state.summary;
  const box = $('#status');
  if (!s) {
    box.innerHTML = state.liveError
      ? `<span class="collection-when is-stale">No data yet</span>Couldn't reach RIPE Atlas or the saved snapshot. Retrying in a minute.`
      : `<span class="collection-when">Collecting…</span>`;
    return;
  }
  const live = state.source === 'live' && !state.liveError;
  const head = live
    ? `<span class="collection-when"><span class="is-live">Live</span>, collected ${utcTime(s.collectedAt)} UTC</span>`
    : `<span class="collection-when">Snapshot from ${utcTime(s.collectedAt)} UTC</span>`;
  const due = s.collectedAt + INTERVAL_S - Date.now() / 1000;
  const next = live
    ? due > 30 ? `next collection in about ${Math.ceil(due / 60)} min` : 'next collection due any moment'
    : state.liveError
      ? '<span class="is-stale">live feed not answering, retrying</span>'
      : 'checking the live feed';
  box.innerHTML = `${head}${ago(s.collectedAt)} · ${int.format(s.answered)} of ${int.format(s.total)} anchors answered · ${next}`;
}

function physicsLine(c) {
  const ratio = c.rtt / c.floor;
  if (c.km < 150) {
    return `Only ${int.format(c.km)} km away, so nearly all of this round trip is time spent in routers and switches, not on the wire.`;
  }
  if (ratio < 1) {
    return `That is faster than light in fibre could cover ${int.format(c.km)} km, so this anchor's registered location is probably wrong.`;
  }
  if (ratio < 1.3) {
    return `Light in fibre needs ${ms(c.floor)} ms for this trip, and the network gets within ${Math.round((ratio - 1) * 100)}% of it. About as direct as the internet gets.`;
  }
  if (ratio < 2.2) {
    return `Light in fibre needs ${ms(c.floor)} ms. The real route takes ${ratio.toFixed(1)} times as long: the usual cost of cable paths that bend, routers and queues.`;
  }
  return `Light in fibre needs ${ms(c.floor)} ms. The real route takes ${ratio.toFixed(1)} times as long, so packets are probably going a long way round.`;
}

function weekChart(c) {
  const h = state.history;
  const row = h?.series?.[c.id];
  const points = row ? row.filter((v) => v != null).length : 0;
  if (!h || points < 2) {
    const n = h?.hours?.length ?? 0;
    return `<div class="week"><div class="week-head"><b>Past 7 days</b></div><p class="week-empty">The hourly record builds up as the collector runs${n ? `: ${n} ${n === 1 ? 'hour' : 'hours'} so far` : ''}.</p></div>`;
  }
  const vals = row.filter((v) => v != null);
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  const yMin = Math.min(lo, c.floor) * 0.92;
  const yMax = hi * 1.06 || 1;
  const W = 360;
  const H = 64;
  const t0 = h.hours[0];
  const span = Math.max(1, 7 * 24 * 3600);
  const x = (t) => (((t - t0) / span) * W).toFixed(1);
  const y = (v) => (H - ((v - yMin) / (yMax - yMin)) * H).toFixed(1);
  const segs = [];
  let cur = [];
  row.forEach((v, i) => {
    if (v == null) {
      if (cur.length) segs.push(cur);
      cur = [];
    } else cur.push(`${x(h.hours[i])},${y(v)}`);
  });
  if (cur.length) segs.push(cur);
  const colour = `var(--z${Math.max(0, zoneOf(c))})`;
  const lines = segs
    .map((s) => (s.length === 1 ? `<circle cx="${s[0].split(',')[0]}" cy="${s[0].split(',')[1]}" r="1.8" fill="${colour}"/>` : `<polyline class="trace" points="${s.join(' ')}" style="stroke:${colour}" vector-effect="non-scaling-stroke"/>`))
    .join('');
  const floorY = y(c.floor);
  return `<div class="week">
    <div class="week-head"><b>Past 7 days, hourly</b><span>best ${ms(lo)} · worst ${ms(hi)} ms</span></div>
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Hourly round trip to ${esc(c.name)} over the past week, between ${ms(lo)} and ${ms(hi)} ms">
      <line class="floor" x1="0" x2="${W}" y1="${floorY}" y2="${floorY}" vector-effect="non-scaling-stroke"/>
      ${lines}
    </svg>
    <div class="week-head"><span>${points} hours on record</span><span style="color:var(--air-blue)">dashed: light in fibre, ${ms(c.floor)} ms</span></div>
  </div>`;
}

function anchorItem(a) {
  const ok = a.min != null;
  const packets = a.sent ? `${a.rcvd} of ${a.sent} packets came back` : 'no result in this collection';
  const when = a.t ? ` · postmarked ${utcTime(a.t, true)} UTC` : '';
  return `<li>
    <span class="host">${esc(a.host)}</span>
    <span class="rtt">${ok ? `${ms(a.min)} ms` : '<span class="returned is-small">Return to sender</span>'}</span>
    <span class="meta">AS${a.asn}${ok ? ` · min ${ms(a.min)} · avg ${ms(a.avg)} · max ${ms(a.max)} ms` : ''} · ${packets}${when}</span>
  </li>`;
}

function renderSlip(arriving = false) {
  const slip = $('#slip');
  const c = state.selected && state.byId.get(state.selected);
  if (!state.summary) {
    slip.innerHTML = `<div class="slip-empty"><h2>Waiting for the post</h2><p>Loading the latest collection from RIPE Atlas.</p></div>`;
    return;
  }
  if (!c) {
    const tries = TRIES.map((name) => state.summary.cities.find((x) => x.name === name)).filter(Boolean);
    slip.innerHTML = `<div class="slip-empty">
      <h2>Pick a postmark</h2>
      <p>Tap a mark on the map or a row in the register to read its slip. Press replay and watch the blue ring: that is light in fibre racing out from Kraków. Each city is stamped only when its real ping gets back.</p>
      <ul class="tries">${tries.map((t) => `<li><button type="button" class="try" data-id="${t.id}">${esc(t.name)} <span>${t.rtt != null ? `${ms(t.rtt)} ms` : 'no reply'}</span></button></li>`).join('')}</ul>
    </div>`;
    return;
  }
  const z = zoneOf(c);
  const best = c.anchors.find((a) => a.min != null) ?? c.anchors[0];
  const reading =
    c.rtt != null
      ? `<span class="reading-value">${ms(c.rtt)}</span><span class="reading-unit"><b>ms</b>round trip</span>
         <span class="zone-tag">${markIcon(z)}Zone ${ZONES[z].id}</span>`
      : `<span class="returned">Return to sender</span>`;
  const detour = c.rtt != null && c.floor > 0 ? `${(c.rtt / c.floor).toFixed(1)} times` : '–';
  const shown = c.anchors.slice(0, 4);
  const rest = c.anchors.slice(4);
  slip.innerHTML = `
    <div class="slip-top">
      <span class="reg"><b>R</b><span>No. ${best.probe}</span></span>
      <button type="button" class="slip-close" aria-label="Clear selection">${ICON_X}</button>
    </div>
    <h2>${esc(c.name)}</h2>
    <p class="slip-country">${esc(countryName(c.cc))}</p>
    <div class="reading">${reading}</div>
    <p class="physics">${c.rtt != null ? physicsLine(c) : `None of the ${c.anchors.length === 1 ? 'anchor' : `${c.anchors.length} anchors`} here answered this collection. It may be offline or filtering ICMP.`}</p>
    <dl class="facts">
      <div><dt>Distance</dt><dd>${int.format(c.km)} km</dd></div>
      <div><dt>Light in fibre</dt><dd>${ms(c.floor)} ms</dd></div>
      <div><dt>Detour</dt><dd>${detour}</dd></div>
      <div><dt>Anchors answering</dt><dd>${c.answered} of ${c.anchors.length}</dd></div>
    </dl>
    ${c.rtt != null ? weekChart(c) : ''}
    <p class="anchors-head">${c.anchors.length === 1 ? 'The anchor' : `${c.anchors.length} anchors`} in ${esc(c.name)}</p>
    <ul class="anchors">${shown.map(anchorItem).join('')}</ul>
    ${rest.length ? `<details class="more-anchors"><summary>Show the other ${rest.length} ${rest.length === 1 ? 'anchor' : 'anchors'}</summary><ul class="anchors">${rest.map(anchorItem).join('')}</ul></details>` : ''}`;
  if (arriving && !reduceMotion.matches) {
    slip.classList.remove('is-arriving');
    void slip.offsetWidth;
    slip.classList.add('is-arriving');
  }
}

$('#slip').addEventListener('click', (evt) => {
  const t = evt.target.closest('button');
  if (!t) return;
  if (t.classList.contains('slip-close')) {
    select(null);
    return;
  }
  if (t.dataset.id) select(t.dataset.id);
});

function renderZones() {
  const counts = new Array(ZONES.length).fill(0);
  let returned = 0;
  for (const c of state.summary.cities) {
    const z = zoneOf(c);
    if (z < 0) returned++;
    else counts[z]++;
  }
  const row = (z, name, range, n, cls = '') => `
    <tr class="${cls}${state.zone === z ? ' is-active' : ''}" data-zone="${z}">
      <td>${markIcon(z)}</td>
      <td><button type="button" class="zone-id" aria-pressed="${state.zone === z}" data-zone="${z}">${name}</button></td>
      <td>${range}</td>
      <td>${n}</td>
    </tr>`;
  $('#zone-rows').innerHTML =
    ZONES.map((zone, i) => row(i, `Zone ${zone.id}`, ZONE_RANGE[i], counts[i])).join('') +
    row(-1, 'Returned', 'no reply', returned, 'is-returned');
}

$('#zone-rows').addEventListener('click', (evt) => {
  const tr = evt.target.closest('tr[data-zone]');
  if (!tr) return;
  const z = Number(tr.dataset.zone);
  state.zone = state.zone === z ? null : z;
  renderZones();
  renderRegister();
  applyDimming();
  updateFocus();
});

function matches(c, q) {
  if (!q) return true;
  const hay = `${c.name} ${countryName(c.cc)} ${c.cc} ${c.anchors.map((a) => `${a.host} as${a.asn}`).join(' ')}`
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
  return hay.includes(q);
}

function filteredIds() {
  const q = state.query.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const ids = new Set();
  for (const c of state.summary?.cities ?? []) {
    if (state.zone !== null && zoneOf(c) !== state.zone) continue;
    if (!matches(c, q)) continue;
    ids.add(c.id);
  }
  return ids;
}

function sorted(list) {
  const rtt = (c) => c.rtt ?? Infinity;
  const by = {
    near: (a, b) => rtt(a) - rtt(b),
    far: (a, b) => (b.rtt ?? -1) - (a.rtt ?? -1),
    detour: (a, b) => (b.rtt ? b.rtt / Math.max(b.floor, 0.5) : -1) - (a.rtt ? a.rtt / Math.max(a.floor, 0.5) : -1),
    name: (a, b) => a.name.localeCompare(b.name, 'en'),
  }[state.sort];
  return [...list].sort(by);
}

function renderRegister() {
  if (!state.summary) return;
  const ids = filteredIds();
  const list = sorted(state.summary.cities.filter((c) => ids.has(c.id)));
  const total = state.summary.cities.length;
  const zoneName = state.zone === null ? '' : state.zone < 0 ? 'returned' : `Zone ${ZONES[state.zone].id}`;
  $('#register-count').textContent =
    list.length === total
      ? `${int.format(total)} cities`
      : `${int.format(list.length)} of ${int.format(total)} cities${zoneName ? ` in ${zoneName}` : ''}${state.query ? ` matching “${state.query.trim()}”` : ''}`;
  $('#register').innerHTML = list.length
    ? list
        .map((c) => {
          const z = zoneOf(c);
          const val = c.rtt != null ? `${ms(c.rtt)}<small>ms</small>` : '<span class="returned is-small">Returned</span>';
          return `<li><button type="button" data-id="${c.id}" aria-current="${c.id === state.selected}">${markIcon(z)}<span class="name">${esc(c.name)}<span>${esc(c.cc)}</span></span><span class="val">${val}</span></button></li>`;
        })
        .join('')
    : `<li class="register-empty">No city matches${state.query ? ` “${esc(state.query.trim())}”` : ''}. Try a country name or an AS number.</li>`;
}

$('#register').addEventListener('click', (evt) => {
  const b = evt.target.closest('button[data-id]');
  if (b) select(b.dataset.id, { scroll: true });
});
$('#register').addEventListener('pointerover', (evt) => {
  const b = evt.target.closest('button[data-id]');
  const id = b?.dataset.id ?? null;
  if (id !== state.hovered) {
    state.hovered = id;
    updateFocus();
  }
});
$('#register').addEventListener('pointerleave', () => {
  state.hovered = null;
  updateFocus();
});
$('#query').addEventListener('input', (evt) => {
  state.query = evt.target.value;
  renderRegister();
  applyDimming();
});
$('#query').addEventListener('keydown', (evt) => {
  if (evt.key === 'Enter') {
    const first = $('#register button[data-id]');
    if (first) select(first.dataset.id, { scroll: true });
  }
});
$('#sort').addEventListener('change', (evt) => {
  state.sort = evt.target.value;
  renderRegister();
});
for (const input of document.querySelectorAll('input[name="view"]')) {
  input.addEventListener('change', () => setMode(input.value));
}
$('#replay').addEventListener('click', replay);
document.addEventListener('keydown', (evt) => {
  if (evt.key === 'Escape' && state.selected && !evt.target.matches('input, select')) select(null);
});

// ---------- data ----------

function applySummary(summary, source) {
  const previous = state.byId;
  state.summary = summary;
  state.byId = new Map(summary.cities.map((c) => [c.id, c]));
  state.source = source;
  if (state.selected && !state.byId.has(state.selected)) state.selected = null;
  syncCities(previous.size ? previous : null);
  drawRim();
  renderStatus();
  renderZones();
  renderRegister();
  renderSlip();
  updateFocus();
  $('#replay').disabled = reduceMotion.matches;
}

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.json();
}

async function bootstrapFromApi() {
  const rows = [];
  let next = `${API}/anchors/?page_size=500`;
  while (next) {
    const page = await getJson(next);
    rows.push(...page.results);
    next = page.next;
  }
  const o = rows.find((a) => a.id === ORIGIN_ANCHOR_ID);
  return {
    origin: { name: 'Kraków', cc: o.country, host: o.fqdn, asn: o.as_v4, lon: o.geometry.coordinates[0], lat: o.geometry.coordinates[1] },
    anchors: compactAnchors(rows),
    results: null,
  };
}

async function pollLive() {
  clearTimeout(state.pollTimer);
  try {
    const results = await fetchLatest();
    const s = summarise(results, state.anchors, state.origin);
    if (!state.summary || s.collectedAt >= state.summary.collectedAt) applySummary(s, 'live');
    state.liveError = null;
    state.source = 'live';
  } catch (err) {
    state.liveError = err;
  }
  renderStatus();
  scheduleLive();
}

function scheduleLive() {
  clearTimeout(state.pollTimer);
  if (document.hidden) return;
  let wait = 120_000;
  if (!state.liveError && state.summary) {
    const due = (state.summary.collectedAt + INTERVAL_S + 30) * 1000 - Date.now();
    wait = Math.min(INTERVAL_S * 1000, Math.max(45_000, due));
  }
  state.pollTimer = setTimeout(pollLive, wait);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearTimeout(state.pollTimer);
  } else if (state.anchors) {
    const stale = !state.summary || Date.now() / 1000 - state.summary.collectedAt > INTERVAL_S + 30;
    stale ? pollLive() : scheduleLive();
  }
});

setInterval(() => state.summary && renderStatus(), 20_000);

async function start() {
  renderSlip();
  const landP = getJson('vendor/land-110m.json');
  const historyP = getJson('data/history.json').catch(() => null);
  let snap;
  try {
    snap = await getJson('data/latest.json');
  } catch {
    try {
      snap = await bootstrapFromApi();
    } catch (err) {
      state.liveError = err;
      renderStatus();
      return;
    }
  }
  state.origin = snap.origin;
  state.anchors = snap.anchors;
  buildMap(await landP);
  state.history = await historyP;
  document.fonts.ready.then(() => {
    drawRim();
    updateFocus();
  });
  if (new URLSearchParams(location.search).get('view') === 'delay') {
    $('#view-delay').checked = true;
    setMode('delay');
  }

  const hashId = decodeURIComponent(location.hash.slice(1));
  if (snap.results) applySummary(summarise(snap.results, snap.anchors, snap.origin), 'snapshot');
  if (hashId && state.byId.has(hashId)) state.selected = hashId;
  if (state.summary) {
    renderSlip();
    renderRegister();
    updateFocus();
    replay();
  }

  await pollLive();
  if (!snap.results && state.summary) {
    if (hashId && state.byId.has(hashId)) select(hashId);
    replay();
  }
}

start();
