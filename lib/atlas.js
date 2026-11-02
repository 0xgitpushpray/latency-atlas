// Shared by the collector (Node) and the page (browser). No dependencies.

// Anchoring Mesh Measurement: Ping IPv4 for anchor pl-krk-as204841.anchors.atlas.ripe.net
export const MEASUREMENT_ID = 84162223;
export const ORIGIN_ANCHOR_ID = 4050;
export const ORIGIN_PROBE_ID = 7431;
export const API = 'https://atlas.ripe.net/api/v2';
export const INTERVAL_S = 240;

// Light in single-mode fibre: c / 1.468 ≈ 204,190 km/s.
export const FIBRE_KM_PER_MS = 204.19;
// Half of Earth's circumference along a great circle: the antipode.
export const ANTIPODE_KM = 20015;

export const ZONES = [
  { id: 'I', max: 20 },
  { id: 'II', max: 50 },
  { id: 'III', max: 100 },
  { id: 'IV', max: 160 },
  { id: 'V', max: 250 },
  { id: 'VI', max: Infinity },
];

export function zoneIndex(rtt) {
  if (rtt == null) return -1;
  return ZONES.findIndex((z) => rtt < z.max);
}

export function haversineKm(lat1, lon1, lat2, lon2) {
  const r = Math.PI / 180;
  const dLat = (lat2 - lat1) * r;
  const dLon = (lon2 - lon1) * r;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371.0088 * Math.asin(Math.min(1, Math.sqrt(a)));
}

// Fastest possible round trip over a straight fibre along the great circle.
export const floorRtt = (km) => (2 * km) / FIBRE_KM_PER_MS;

const round = (v, d = 2) => (v == null ? null : Math.round(v * 10 ** d) / 10 ** d);

// Anchor operators spell some cities more than one way.
const ALIASES = { 'frankfurt am main': 'Frankfurt', milano: 'Milan', 'new york city': 'New York' };

function cityKey(city, cc) {
  const raw = String(city || 'Unknown').split(',')[0].trim();
  const name = ALIASES[raw.toLowerCase()] || raw;
  const slug = name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'L')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return { name, id: `${slug}-${String(cc || 'xx').toLowerCase()}` };
}

// Reduce the RIPE Atlas anchors API rows to what the page needs.
export function compactAnchors(rows) {
  return rows
    .filter((a) => !a.is_disabled && a.geometry && a.id !== ORIGIN_ANCHOR_ID)
    .map((a) => ({
      probe: a.probe,
      host: a.fqdn.replace('.anchors.atlas.ripe.net', ''),
      city: a.city,
      cc: a.country,
      asn: a.as_v4,
      lon: a.geometry.coordinates[0],
      lat: a.geometry.coordinates[1],
    }));
}

// Join one /latest/ result set with anchor metadata and group anchors into cities.
export function summarise(results, anchors, origin) {
  const byProbe = new Map(results.map((r) => [r.prb_id, r]));
  let newest = 0;

  const rows = anchors.map((a) => {
    const r = byProbe.get(a.probe);
    const km = haversineKm(origin.lat, origin.lon, a.lat, a.lon);
    const ok = r && r.rcvd > 0 && r.min > 0;
    if (r && r.timestamp > newest) newest = r.timestamp;
    return {
      ...a,
      km: Math.round(km),
      floor: round(floorRtt(km)),
      min: ok ? round(r.min) : null,
      avg: ok ? round(r.avg) : null,
      max: ok ? round(r.max) : null,
      sent: r ? r.sent : 0,
      rcvd: r ? r.rcvd : 0,
      t: r ? r.timestamp : null,
    };
  });

  const groups = new Map();
  for (const a of rows) {
    const { name, id } = cityKey(a.city, a.cc);
    if (!groups.has(id)) groups.set(id, { id, name, cc: a.cc, anchors: [] });
    groups.get(id).anchors.push(a);
  }

  const cities = [...groups.values()].map((g) => {
    const lat = g.anchors.reduce((s, a) => s + a.lat, 0) / g.anchors.length;
    const lon = g.anchors.reduce((s, a) => s + a.lon, 0) / g.anchors.length;
    const km = haversineKm(origin.lat, origin.lon, lat, lon);
    const live = g.anchors.filter((a) => a.min != null);
    const best = live.length ? live.reduce((b, a) => (a.min < b.min ? a : b)) : null;
    g.anchors.sort((a, b) => (a.min ?? Infinity) - (b.min ?? Infinity));
    return {
      id: g.id,
      name: g.name,
      cc: g.cc,
      lat: round(lat, 4),
      lon: round(lon, 4),
      km: Math.round(km),
      floor: round(floorRtt(km)),
      rtt: best ? best.min : null,
      answered: live.length,
      anchors: g.anchors,
    };
  });

  cities.sort((a, b) => (a.rtt ?? Infinity) - (b.rtt ?? Infinity));

  return {
    collectedAt: newest || null,
    answered: rows.filter((a) => a.min != null).length,
    total: rows.length,
    cities,
  };
}

export async function fetchLatest(fetchImpl = fetch) {
  const res = await fetchImpl(`${API}/measurements/${MEASUREMENT_ID}/latest/`);
  if (!res.ok) throw new Error(`RIPE Atlas answered ${res.status}`);
  return res.json();
}
