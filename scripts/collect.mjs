// Fetches the latest Kraków mesh pings from RIPE Atlas and writes the site's data files.
//   node scripts/collect.mjs
// Env:
//   PAGES_URL  where the live site is served; its data/history.json is extended each run.
//              Defaults to https://<owner>.github.io/<repo>/ from GITHUB_REPOSITORY.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import {
  API,
  MEASUREMENT_ID,
  ORIGIN_ANCHOR_ID,
  compactAnchors,
  fetchLatest,
  summarise,
} from '../lib/atlas.js';

const OUT = new URL('../data/', import.meta.url);
const HISTORY_HOURS = 24 * 7;

async function getJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'latency-atlas collector' } });
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.json();
}

async function allAnchors() {
  const rows = [];
  let next = `${API}/anchors/?page_size=500`;
  while (next) {
    const page = await getJson(next);
    rows.push(...page.results);
    next = page.next;
  }
  return rows;
}

function pagesUrl() {
  if (process.env.PAGES_URL) return process.env.PAGES_URL.replace(/\/?$/, '/');
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo) return null;
  const [owner, name] = repo.split('/');
  return name.toLowerCase() === `${owner.toLowerCase()}.github.io`
    ? `https://${name}/`
    : `https://${owner}.github.io/${name}/`;
}

async function previousHistory() {
  const base = pagesUrl();
  const sources = [
    base && (() => getJson(`${base}data/history.json`)),
    async () => JSON.parse(await readFile(new URL('history.json', OUT), 'utf8')),
  ].filter(Boolean);
  for (const load of sources) {
    try {
      const h = await load();
      if (Array.isArray(h.hours) && h.series) return h;
    } catch {
      // Not deployed yet, or no local copy: try the next source.
    }
  }
  return { hours: [], series: {} };
}

function extendHistory(history, summary) {
  const hour = Math.floor(summary.collectedAt / 3600) * 3600;
  let { hours, series } = history;
  let at = hours.indexOf(hour);
  if (at === -1) {
    hours = [...hours, hour];
    at = hours.length - 1;
  }
  const next = {};
  const ids = new Set([...Object.keys(series), ...summary.cities.map((c) => c.id)]);
  const rtt = new Map(summary.cities.map((c) => [c.id, c.rtt]));
  for (const id of ids) {
    const row = (series[id] || []).slice(0, hours.length);
    while (row.length < hours.length) row.push(null);
    if (rtt.has(id)) row[at] = rtt.get(id);
    next[id] = row;
  }
  const drop = Math.max(0, hours.length - HISTORY_HOURS);
  const trimmed = {};
  for (const [id, row] of Object.entries(next)) {
    const kept = row.slice(drop);
    if (kept.some((v) => v != null)) trimmed[id] = kept;
  }
  return { hours: hours.slice(drop), series: trimmed };
}

const [anchorRows, results] = await Promise.all([allAnchors(), fetchLatest()]);

const originRow = anchorRows.find((a) => a.id === ORIGIN_ANCHOR_ID);
if (!originRow) throw new Error(`Origin anchor ${ORIGIN_ANCHOR_ID} not found`);
const origin = {
  name: 'Kraków',
  cc: originRow.country,
  host: originRow.fqdn.replace('.anchors.atlas.ripe.net', ''),
  asn: originRow.as_v4,
  lon: originRow.geometry.coordinates[0],
  lat: originRow.geometry.coordinates[1],
};

const anchors = compactAnchors(anchorRows);
const trimmed = results.map((r) => ({
  prb_id: r.prb_id,
  min: r.min,
  avg: r.avg,
  max: r.max,
  sent: r.sent,
  rcvd: r.rcvd,
  timestamp: r.timestamp,
}));

const summary = summarise(trimmed, anchors, origin);
if (!summary.collectedAt) throw new Error('No results in the latest collection');

const history = extendHistory(await previousHistory(), summary);

await mkdir(OUT, { recursive: true });
await writeFile(
  new URL('latest.json', OUT),
  JSON.stringify({ v: 1, generatedAt: Math.floor(Date.now() / 1000), measurement: MEASUREMENT_ID, origin, anchors, results: trimmed }),
);
await writeFile(new URL('history.json', OUT), JSON.stringify(history));

console.log(
  `Collected ${summary.answered}/${summary.total} anchors in ${summary.cities.length} cities at ${new Date(summary.collectedAt * 1000).toISOString()}; history holds ${history.hours.length} hours.`,
);
