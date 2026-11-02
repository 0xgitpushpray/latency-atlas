# Product

## Platform

web

## Stack

delegated: plain static HTML/CSS/JS with no build step, served by GitHub Pages. A dependency-free Node script, run on a schedule by GitHub Actions, fetches RIPE Atlas data and commits JSON snapshots into the site. Chosen because the site must be free to host, trivial to fork, and have nothing to break between deploys.

## Users

The curious public and portfolio visitors: someone who follows a link, wants to understand in seconds what they are looking at, and enjoys poking at it. Network detail (min/avg RTT, packet loss, anchor hostname, ASN) is available on demand but never required to get the point.

## Product Purpose

latency-atlas shows how long a packet takes to travel from Kraków to cities around the world and back, using real, continuously refreshed measurements. Success is a visitor leaving with an intuition for internet geography: that latency follows cables and exchanges, not straight lines, and that it is bounded by the speed of light in glass.

## Positioning

Every number is a real ICMP round-trip measured in the last few minutes by RIPE Atlas anchors, between named machines in named cities, against one fixed origin: Kraków. It can set each measurement beside the physical floor (light in fibre over the great-circle distance), which turns a latency map into a picture of how far the network detours from physics.

## Operating Context

- Data: RIPE Atlas anchoring mesh. Measurement 84162223 is the IPv4 ping mesh targeting the Kraków anchor `pl-krk-as204841.anchors.atlas.ripe.net` (anchor 4050, probe 7431). About 1,000 anchors worldwide ping it every 240 seconds, 3 packets each. Results and anchor metadata (city, country, coordinates, ASN) are public, need no API key, and the API sends CORS headers, so the browser can read them directly.
- RTT is symmetric for this purpose: an anchor pinging Kraków measures the same round trip as Kraków pinging the anchor. Copy says "round trip between Kraków and X".
- A GitHub Actions cron commits a snapshot plus a rolling history; the page loads the snapshot first and then refreshes live from the RIPE Atlas API while the tab is open.
- An IPv6 mesh (measurement 84162232) also exists and is an open option, not a commitment.

## Capabilities and Constraints

- Free hosting on GitHub Pages; no server, no secrets, no paid APIs, no map tile service that needs a key.
- Anchors cluster in Europe and North America; Africa, South America and Central Asia are thin. The map must represent sparse coverage honestly rather than interpolating it away.
- Some anchors time out or are offline at any moment; these are shown as unreachable, not dropped silently.
- Several anchors can share a city; city values aggregate them (best/median), with per-anchor detail available.

## Brand Commitments

Name: latency-atlas. Origin city is Kraków, written with the diacritic.

## Evidence on Hand

Only live RIPE Atlas data. No testimonials, users, or press exist; none may be invented. Credit RIPE Atlas / RIPE NCC as the data source.

## Product Principles

1. Every number is real and timestamped; nothing on the map is estimated without saying so.
2. Physics is the reference: show how far the network is from the speed of light, not just raw milliseconds.
3. Legible in one glance, deep on a second look.
4. Honest about gaps: missing coverage and dead anchors are part of the picture.
5. Zero cost, zero keys, forkable: anyone can repoint it at their own city.

## Accessibility & Inclusion

Latency colour encoding must not rely on hue alone and must remain readable for colour-blind visitors; all values reachable by keyboard and in a non-map list view.
