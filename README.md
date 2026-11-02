# latency-atlas

A live map of internet round-trip times between Kraków and cities around the world, built from public [RIPE Atlas](https://atlas.ripe.net/) measurements and hosted free on GitHub Pages.

The world is drawn as one round postmark centred on Kraków. Each city is stamped with its latest round trip. The **Delay** view moves every city out to where its ping time puts it, next to where light in fibre would have put it, so you can see how far the real network detours from physics.

## Where the numbers come from

RIPE Atlas anchors ping each other continuously in the *anchoring mesh*. Measurement [84162223](https://atlas.ripe.net/measurements/84162223) is the IPv4 ping mesh that targets the Kraków anchor `pl-krk-as204841`: about 1,000 anchors worldwide each send it 3 ICMP packets every 4 minutes.

- An anchor pinging Kraków travels the same loop as Kraków pinging it, so the round-trip time is the same either way.
- A city's value is its fastest anchor's best packet (`min` RTT).
- The light-in-fibre floor is `2 × great-circle distance ÷ 204.19 km/ms` (c divided by a refractive index of 1.468).
- Anchors that didn't reply in the latest collection are marked **Return to sender**. They are never dropped.

No API key is needed. The results and anchor metadata are public, and the RIPE Atlas API sends CORS headers, so the page reads live data straight from the browser.

## How it runs

```
GitHub Actions (hourly)                     Browser
  scripts/collect.mjs                         index.html + app.js
    ├─ anchors + latest results ─┐              ├─ paints data/latest.json at once
    └─ extends data/history.json │              └─ then polls RIPE Atlas every 4 min
                                 ▼                 while the tab is visible
                  deployed to GitHub Pages
```

- `lib/atlas.js` holds the shared logic (joining results to anchors, grouping cities, zones, physics). The collector and the page both use it.
- `data/` isn't committed. Each workflow run builds fresh `latest.json` and extends the 7-day `history.json` by reading the copy that's already deployed. The live site stores its own history, so the repo never fills up with data commits.
- There is no build step and nothing to install. Vendored files: d3-geo, d3-array, topojson-client, Natural Earth 1:110m land (via `world-atlas`), and the Anybody variable font (SIL OFL).

## Deploy your own

1. Push this repository to GitHub.
2. Go to **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.
3. Open **Actions → Collect and deploy → Run workflow**. After that it runs every hour, and on every push to `main`.

The site is served at `https://<user>.github.io/latency-atlas/`. If you use a custom domain, add a repository variable `PAGES_URL` with the site's URL so the collector can find the deployed history.

**Scheduled workflows pause after 60 days without repository activity.** If that happens, the page keeps working from live browser polling, but the snapshot and the 7-day history stop updating until you re-enable the workflow or push a commit.

## Point it at another city

1. Find an anchor in your city: `https://atlas.ripe.net/api/v2/anchors/?search=<city>`. Note its `id` and `probe`.
2. Find its mesh ping measurement: `https://atlas.ripe.net/api/v2/measurements/?target=<anchor fqdn>&type=ping&af=4&status=2`. Pick the one whose description starts with "Anchoring Mesh Measurement".
3. Update `MEASUREMENT_ID`, `ORIGIN_ANCHOR_ID` and `ORIGIN_PROBE_ID` in `lib/atlas.js`, then change the city name in `scripts/collect.mjs`, `index.html` and the `bootstrapFromApi` origin in `app.js`.

The map recentres itself on the origin anchor's coordinates.

## Local development

Requires Node 20 or later.

```sh
node scripts/collect.mjs   # writes data/latest.json and data/history.json
node scripts/serve.mjs     # http://localhost:8080
```

The page still works without `data/`: it bootstraps anchor metadata and results straight from the RIPE Atlas API. Add `?view=delay` to the URL to open in the Delay view, or `#tokyo-jp` to open a city's slip.

## Credits

Measurements by RIPE Atlas, operated by the RIPE NCC. Land shapes from Natural Earth. Typeface: Anybody by Tyler Finck / Etcetera Type Co.
