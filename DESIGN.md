---
name: latency-atlas
description: The world drawn as one round Kraków postmark; every city a cancellation stamped with its live round trip.
colors:
  paper: "#cfe0ef"
  paper-hi: "#dde9f5"
  slip: "#e8f0f8"
  plate: "#a9c2db"
  plate-edge: "#93aecb"
  ink: "#221f3d"
  ink-2: "#454a70"
  ink-3: "#5d6488"
  rule: "rgb(34 31 61 / 0.22)"
  rule-strong: "rgb(34 31 61 / 0.5)"
  air-red: "#cf2f2b"
  air-blue: "#1d4495"
  z0: "#12285c"
  z1: "#24489a"
  z2: "#4a3d99"
  z3: "#6c3391"
  z4: "#8f2f7f"
  z5: "#a32c62"
typography:
  display:
    fontFamily: "Anybody, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 3.6vw, 3.5rem)"
    fontWeight: 860
    lineHeight: 0.95
    letterSpacing: "-0.015em"
    fontVariation: "'wdth' 64"
  reading:
    fontFamily: "Anybody, system-ui, sans-serif"
    fontSize: "clamp(3.4rem, 5vw, 4.5rem)"
    fontWeight: 880
    lineHeight: 0.82
    letterSpacing: "-0.03em"
    fontFeature: "'tnum' 1"
    fontVariation: "'wdth' 78"
  headline:
    fontFamily: "Anybody, system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 2.6vw, 2.4rem)"
    fontWeight: 860
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 70"
  title:
    fontFamily: "Anybody, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 860
    letterSpacing: "-0.005em"
    fontVariation: "'wdth' 76"
  lead:
    fontFamily: "Anybody, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 420
    lineHeight: 1.45
    fontVariation: "'wdth' 96"
  body:
    fontFamily: "Anybody, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 420
    lineHeight: 1.5
    fontFeature: "'tnum' 1"
    fontVariation: "'wdth' 96"
  control:
    fontFamily: "Anybody, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 720
    fontVariation: "'wdth' 92"
  label:
    fontFamily: "Anybody, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 820
    letterSpacing: "0.03em"
    fontVariation: "'wdth' 118"
  meta:
    fontFamily: "Anybody, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 420
    lineHeight: 1.5
    fontVariation: "'wdth' 96"
  etiquette:
    fontFamily: "Anybody, system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 880
    lineHeight: 1.1
    letterSpacing: "0.02em"
    fontVariation: "'wdth' 128"
  rim:
    fontFamily: "Anybody, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 820
    letterSpacing: "0.08em"
    fontVariation: "'wdth' 72"
  ring-label:
    fontFamily: "Anybody, system-ui, sans-serif"
    fontSize: "max(12px, calc(var(--u, 1) * 10.5px))"
    fontWeight: 640
    fontVariation: "'wdth' 82"
  city-label:
    fontFamily: "Anybody, system-ui, sans-serif"
    fontSize: "max(11px, calc(var(--u, 1) * 10.5px))"
    fontWeight: 840
    fontVariation: "'wdth' 112"
  origin-label:
    fontFamily: "Anybody, system-ui, sans-serif"
    fontSize: "max(13px, calc(var(--u, 1) * 12px))"
    fontWeight: 820
    letterSpacing: "0.06em"
    fontVariation: "'wdth' 120"
  focus-label:
    fontFamily: "Anybody, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 860
    fontVariation: "'wdth' 110"
rounded:
  none: "0px"
  hairline: "2px"
  stamp: "3px"
  control: "4px"
  pill: "999px"
  circle: "50%"
spacing:
  frame: "10px"
  frame-compact: "7px"
  gutter: "clamp(16px, 2.4vw, 36px)"
  column-gap: "clamp(20px, 3vw, 56px)"
  hair: "3px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "22px"
  section: "28px"
  section-compact: "32px"
components:
  stamp-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "8px 14px"
    height: "44px"
  stamp-button-hover:
    backgroundColor: "{colors.slip}"
  stamp-button-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.slip}"
  switch-option:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.hairline}"
    height: "44px"
  switch-option-hover:
    backgroundColor: "{colors.slip}"
  switch-option-checked:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.slip}"
  try-chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
    height: "40px"
  try-chip-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.slip}"
  search-input:
    backgroundColor: "{colors.slip}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "10px 12px 10px 40px"
    height: "46px"
  sort-select:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "6px 30px 6px 10px"
    height: "40px"
  registered-slip:
    backgroundColor: "{colors.slip}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "22px 22px 20px"
  reg-badge:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.slip}"
    padding: "4px 7px"
  register-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "8px 6px 8px 4px"
    height: "44px"
  register-row-current:
    backgroundColor: "{colors.slip}"
  zone-row-active:
    backgroundColor: "{colors.slip}"
  etiquette:
    backgroundColor: "{colors.air-blue}"
    textColor: "{colors.slip}"
    typography: "{typography.etiquette}"
    padding: "6px 10px 7px"
  returned-stamp:
    backgroundColor: "transparent"
    textColor: "{colors.air-red}"
    rounded: "{rounded.stamp}"
    padding: "5px 10px 4px"
---

# Design System: latency-atlas

## Overview

**Creative North Star: "The Kraków Postmark"**

Every ping is a letter posted in Kraków. The whole world is drawn as one round postmark: an azimuthal-equidistant disc centred on Kraków, its rim a double cancellation ring carrying curved text and the collection date in postal form (`02 XI 26 · 14:32 UTC`, Roman-numeral month). Each anchor city is a cancellation mark struck in one of six zone inks, and each zone also has its own mark shape. The page is a sheet of aerogramme paper: pale blue ground with a faint horizontal fibre grain, land printed as a deeper blue-grey plate, type and rings in violet-black ink, and the whole viewport framed by a red-and-blue airmail chevron border.

It is light, printed and flat. Depth comes from ink plates stacked in a fixed order, never from lighting. Density is that of a postal form: compact labelled facts, ruled tables, a numbered register, with provenance (anchor host, ASN, postmark time) printed beside every value. The one large number on the page is the round trip itself.

Motion is mechanical, the way a rubber stamp is. Ink lands with a press (struck large, squashed past rest, then settled). The Distance / Delay switch drives one orchestrated morph. The collection replay strikes stamps in order of their real round trip while a blue light-in-fibre ring races outward from Kraków. With reduced motion the page shows final states only. The category default (a dark map with glowing arcs and a stats sidebar) is the confirmed anti-reference.

**Key Characteristics:**
- Aerogramme-blue paper ground with fibre grain; flat ink plates, no lighting.
- Six postal-zone inks stepped like a test strip, each paired with its own mark shape.
- Air red appears only on the airmail frame and on things that did not come back.
- One variable family (Anybody) whose width axis does the hierarchy work: condensed for rings, headings and numerals, expanded for map labels.
- Tabular figures for every millisecond value.
- Rubber-stamp press, one orchestrated morph, and a replay timed from real ms.

## Colors

A cool paper-and-ink palette: blue-grey paper and plate, violet-black ink, two airmail signal colours, and a six-step navy-to-raspberry zone strip.

### Primary
- **Cancellation Ink** (`ink`): Violet-black. Used for all primary type, ring strokes, rim rings, control borders (2px), the checked switch fill, the reg badge, and the origin mark. It is the plate everything is printed in.
- **Airmail Blue** (`air-blue`): The colour of light and of being live. Used for the light-in-fibre replay ring and its label, the dashed fibre floor in the week chart, links, the dashed focus outline, the live dot, text selection, caret, `accent-color`, and the etiquette label ground.

### Secondary
- **Airmail Red** (`air-red`): The return-to-sender colour. Used for the RETURN TO SENDER hand stamp, the red cross mark for cities that gave no reply, the Returned row in the zone chart, stale-feed status text, and the red chevrons in the frame.

### Tertiary: the postal zones (nearest to farthest)
Zone thresholds come from `lib/atlas.js` (`ZONES`, first match on `rtt < max`):
- **Zone I, Deep Registry Navy** (`z0`): under 20 ms.
- **Zone II, Franking Blue** (`z1`): 20 to 50 ms.
- **Zone III, Indigo Violet** (`z2`): 50 to 100 ms.
- **Zone IV, Postal Purple** (`z3`): 100 to 160 ms.
- **Zone V, Plum Cancel** (`z4`): 160 to 250 ms.
- **Zone VI, Raspberry Frank** (`z5`): 250 ms and over.

Zone inks colour only zone membership: map marks, the zone glyphs in the chart, slip and register, and the week-chart trace for the selected city.

### Neutral
- **Aerogramme Paper** (`paper`): Page ground and `theme-color`, under a fractal-noise fibre grain (ink at 7% alpha, baseFrequency `.9 .06`, so the grain runs horizontally). Also the week-chart band and the slip-close hover.
- **Disc Paper** (`paper-hi`): The disc face, the fill inside hollow marks, and the halo stroke (`paint-order: stroke`) behind every map label.
- **Slip Paper** (`slip`): The registered slip, the search field, hover and current-row washes, and text on ink and blue grounds.
- **Land Plate** (`plate`) with **Plate Edge** (`plate-edge`, 0.6 stroke): Landmass.
- **Ink 2** (`ink-2`): Secondary text, ring labels, legends, captions, meta lines.
- **Ink 3** (`ink-3`): Placeholder text and the scrollbar thumb only.
- **Rule** (`rule`) and **Strong Rule** (`rule-strong`): Ink at 22% for hairline row dividers and fact borders; ink at 50% for the dashed dividers between anchors.

### Named Rules
**The Did-Not-Come-Back Rule.** Apart from the airmail frame chevrons, air red appears only where something failed to return: a dead anchor, a city with no reply, a live feed that is not answering. It is never a zone ink, a hover, an emphasis or a decoration.

**The Test Strip Rule.** Zone inks always appear in order, z0 to z5, from deep navy through violet to raspberry, and only to say which zone something is in. Never reorder them, never add a seventh, and never use one for anything else.

**The Light Is Blue Rule.** Air blue stands for the physical floor and for live state: the fibre ring, the fibre floor line, the live dot, focus and links. Do not use it for data values.

## Typography

**Display Font:** Anybody (variable: weight 100 to 900, width 50 to 150%, roman and italic, self-hosted woff2 subsets), with system-ui, sans-serif fallback
**Body Font:** Anybody, same family
**Label/Mono Font:** none distinct; figures use `font-variant-numeric: tabular-nums`, set once on `body`

**Character:** One grotesque stretched across its width axis, like the different pieces of type on one postal form. Condensed black for headings, the rim and numerals, at about 96% width for reading text, and expanded black for the map's city names and the etiquette. In the build the width is set with `font-stretch`; the `wdth` values in the frontmatter are the same settings.

### Hierarchy
- **Display** (860, clamp 2.6 to 3.5rem, 0.95, width 64): The `latency-atlas` h1, kept on one line (`nowrap`). 2.5rem at 480px and below.
- **Reading** (880, clamp 3.4 to 4.5rem, 0.82, width 78): The selected city's round trip, the largest number on the page. 3.2rem at 480px and below.
- **Headline** (860, clamp 1.9 to 2.4rem, 1, width 70): City name on the registered slip; breaks anywhere (`overflow-wrap: anywhere`).
- **Title** (860, 1.375rem, width 76): Section heads ("Postal zones", "Register").
- **Lead** (420, 1.0625rem, 1.45, max 40ch): The single explanatory sentence under the h1.
- **Body** (420, 1rem, 1.5, width 96): Physics line, notes. Colophon paragraphs cap at 62ch.
- **Label** (820, 1.0625rem, 0.03em, uppercase, width 118): Distance / Delay switch options.
- **Control** (720, 0.9375rem, width 92): Buttons, chips, sort select (640).
- **Meta** (420, 0.8125rem, ink-2): Legends, fact terms, counts, hints, colophon.
- **Etiquette** (880 italic, 1.05rem, 0.02em, uppercase, width 128) over a 0.625rem 640 0.08em uppercase sub-line: the ALLER-RETOUR airmail label.

Map type (SVG, scaled by `--u` = 1000 / drawn px so it holds its screen size):
- **Rim** (820, 15 to 27px, 0.08em, uppercase, width 72): Curved text in the postmark band, fitted with `textLength`.
- **Ring label** (640, at least 12px, width 82, ink-2): The `km` and `ms` ring values. Limit ring: 760, ink, 0.03em.
- **City label** (840, at least 11px, width 112), with its ms value at 500 in ink-2.
- **Origin label** (820, at least 13px, 0.06em, uppercase, width 120): KRAKÓW.
- **Focus label** (860, at least 15px, width 110), with ms at 560.
- **Light label** (700, 12px, width 90, air-blue): "light in fibre".

### Named Rules
**The Width Axis Rule.** Width does as much of the hierarchy work as size. Condensed (64 to 82) for headings, the rim, ring values and numerals. About normal (88 to 100) for reading and control text. Expanded (110 to 128) for map city labels, switch labels and the etiquette. Never bring in a second family.

**The Tabular Rule.** Every millisecond, kilometre and count uses tabular figures, inherited from `body`. Never turn this off.

**The Halo Rule.** All text on the map sits on a `paper-hi` stroke halo (3 to 4px × `--u`, round join, `paint-order: stroke`) so it stays readable over land, rings and marks.

## Layout

A two-column envelope. On desktop, the map is a sticky square SVG (viewBox 1000, disc centre 500, disc radius 412) filling the full viewport height on the left, and a 360 to 430px panel column scrolls on the right. The column gap is `column-gap`, the page is inset by `frame + gutter` (the left side uses 0.6× the gutter), and the page caps at 1720px wide. The fixed airmail frame (`frame`, z-index 50) sits over everything and lets clicks through.

The panel is a vertical flow with a `section` (28px) gap. Inner spacing follows a near-2px rhythm: `hair` 3, `xs` 4, 6, `sm` 8, 10, `md` 12, 14, `lg` 16, 18, `xl` 22. Touch targets are at least 44px (chips and the select 40px; slip close 36px).

At 1023px and below the layout becomes one column, the frame tightens to 7px, and the panel uses `display: contents` so its children reorder: masthead, then the map (up to 720px, square), then collection, switch, slip, zones, register and colophon at a `section-compact` (32px) gap. At 480px and below the h1, etiquette and reading figure step down and the slip padding becomes 20px 16px 18px. The map changes with its drawn size: below 600px it hides minor ring labels and city labels outside the short list, and marks are drawn at 8.5px (under 520), 9.5px (under 760) or 10.5px.

Map projection: azimuthal equidistant on Kraków, with a square-root radial scale (`r = R·√(km / 20015)`). Distance rings at 1,000, 2,500, 5,000, 10,000 and 15,000 km; delay rings at 20, 50, 100, 160 and 250 ms (the zone edges) on `r = R·√(ms / 400)`. A solid limit ring at about 196 ms (antipode and back in fibre) carries its caption along the top. Ring labels sit at a 68° bearing, over the Indian Ocean.

## Elevation & Depth

The system is flat. Depth comes from stacked ink plates in a fixed order, from dimming (opacity), and from the paper grain, never from cast shadows. The few shadow declarations are printed edges, not lift: a double inset ring that borders the etiquette, a 1px paper-and-blue ring round the live dot, and a 1px rule line under the slip.

### Shadow Vocabulary
- **Etiquette border** (`box-shadow: inset 0 0 0 2px var(--air-blue), inset 0 0 0 3.5px var(--slip)`): A printed white keyline inside the airmail label.
- **Live dot halo** (`box-shadow: 0 0 0 2px var(--paper), 0 0 0 3px var(--air-blue)`): A ring round the 8px live indicator.
- **Slip base rule** (`box-shadow: 0 1px 0 var(--rule)`): The bottom edge of the registered slip.

### Named Rules
**The Ink Plate Rule.** The map is printed in this order, bottom to top: disc → land plate → distance rings → delay rings → detour lines → light-in-fibre ring and label → city marks → Kraków origin mark → distance ring labels → delay ring labels → city labels → hover focus ring → selected focus ring → postmark rim (with the `#ink` displacement filter). Labels always print above marks, and the rim is always the top plate.

**The Dim, Don't Hide Rule.** When a zone filter is on, marks outside it drop to 0.18 opacity and their labels hide; the marks stay on the map so you can still see where coverage is thin. In Delay view the land plate drops to 0.55.

## Shapes

The shapes are mostly round, as a postmark is: the disc, double rim rings (2.2 and 3.4 stroke at radii 424 and 482), dashed range rings (`2 4` dash, 0.32 opacity), and circular marks. The rim and only the rim goes through a turbulence displacement filter (`feTurbulence` 0.75, scale 2.2) so it looks hand-struck. The RETURN TO SENDER stamp is masked with noise so its ink looks worn, and is rotated −4° (−2° when small). The etiquette is rotated −3° (−2° on mobile), stuck on at an angle.

Corners stay small and functional: `hairline` (2px) for switch options, `stamp` (3px) for the hand stamp, `control` (4px) for buttons, the switch track and the select, `pill` for the try chips, `circle` for the slip close and the live dot, and `none` for the slip and the search field. The slip has no corners: its top edge is perforated with a radial-gradient mask (4px holes every 12px), like a stamp torn from a sheet. Borders are ink at 2px for primary controls and 1.5px for secondary ones; the search field has only a 2px ink bottom rule.

### Zone marks (16-unit symbols, `viewBox -8 -8 16 16`)
- **Zone I, solid:** filled disc r4.7 in `z0`.
- **Zone II, ringed:** filled disc r4.7 in `z1` with a `paper-hi` core r1.8.
- **Zone III, hollow:** `paper-hi` disc r4 with a 1.9 `z2` stroke.
- **Zone IV, barred:** hollow r4 with a 1.6 `z3` stroke, crossed by a horizontal bar ±6.4 wide (1.7) that runs past the ring.
- **Zone V, double:** hollow r4.8 (1.3 stroke) plus an inner ring r2.1 (1.3), in `z4`.
- **Zone VI, crossed:** hollow r4.6 (1.5 stroke) with an inner X ±2.6 (1.5, round caps), in `z5`.
- **Returned:** a bare X ±3.8 in `air-red` (2.3, round caps), with no ring.
- **Origin (Kraków):** `paper-hi` ring r6.4 (1.5 ink), dotted inner ring r3.6 (0.8, `1 1.1`), solid core r1.9, drawn at 1.5× mark size.

## Components

### Buttons
Built like rubber stamps: ink outline, clear face, and the face fills with ink when pressed.
- **Shape:** Slightly rounded corners (4px), 2px ink border, at least 44px tall.
- **Primary (stamp button):** Transparent face, ink text at control weight 720, 8px gap to an inline 18px stroke icon (2px, round caps). Only "Replay the collection" uses it.
- **Hover / Active:** Hover washes the face with slip (160ms ease). Active fills with ink, turns the text slip and nudges down 1px (translate 100ms).
- **Disabled:** 0.45 opacity, no wash. Replay is disabled under reduced motion.
- **Slip close:** 36px circle, ink-2 X icon (2.2 stroke); hover fills with paper and the icon turns ink.

### Chips
- **Style:** Try chips are pill-shaped with a 1.5px ink outline, 40px tall. The city name is set at 700 and the ms value at 500 with 0.8 opacity.
- **State:** Hover fills with ink and the text turns slip. They appear only in the empty slip.

### Cards / Containers
- **Registered slip:** A slip-paper sheet with a perforated top edge, no radius, 22px padding, and a rule-line base. When a city is selected it slides in (`slip-in`, 420ms ease-out, from 6px down and 0.4 opacity). It opens with an R badge (an ink block with a 900-weight R, beside "No. {probe}" in a 1.5px ink box). Below that: the headline city, the country in ink-2, the reading row (huge ms, a stacked unit, and a zone glyph tag on the right), the physics sentence, a two-column facts list between rules, the 7-day hourly trace (zone-ink line over a dashed air-blue fibre floor), and the anchor list split by dashed strong rules.
- **Shadow Strategy:** Flat; see Elevation & Depth.

### Inputs / Fields
- **Search:** A slip-paper field with no box, only a 2px ink bottom rule and square corners. 46px tall, 40px left inset for an 18px ink-2 magnifier. Placeholder in ink-3.
- **Sort select:** 1.5px ink outline, 4px corners, a custom ink chevron, weight 640.
- **Focus:** Everywhere, a 2px dashed air-blue outline at a 3px offset (2px on the search field and zone buttons, −3px inset on register rows).

### Navigation
- **Distance / Delay switch:** The primary control. A two-column segmented track with a 2px ink border, 4px corners, and 3px padding and gap. Options are 44px tall, uppercase, weight 820 at width 118. The checked option fills with ink and its text turns slip; hover washes with slip (180ms ease). The radios stay real inputs, so focus shows on the label.
- **Zone chart:** A ruled table with a 2px ink header rule and 1px rule rows. Each row starts with its zone glyph. Clicking a row filters the map and the register (active row has a slip wash); the Returned row is set in air red at 700.
- **Register:** A scrolling ordered list (capped at min(34rem, 70vh), 28rem on mobile) under a 2px ink top rule. Rows are 44px: a 16px zone glyph, the city at 700 width 90 with its country code at 450 ink-2, and the ms right-aligned at 760. The current row has a slip wash; hover a 0.3 white wash.

### Postmark map (signature)
The map is the work. The rim text repeats "Round trips from Kraków · {postal date} · RIPE Atlas mesh 84162223 · N of M anchors answered" around the full circle. Hovering or selecting a city draws a focus ring at the mark: a solid outer ring r9 (selected 2.4 stroke) and a dotted inner ring r13, with the name and ms in focus-label type, flipped to the left of the mark past 0.4R on the right. City labels are placed greedily (focus, origin and ring labels first, then the short list), and any label that would overlap is hidden.

**Motion grammar.**
- **Press:** marks are struck in at scale 2.4 → 0.86 at 62% → 1, opacity 0 → 1, over 300ms on `cubic-bezier(0.2, 0.9, 0.3, 1)`. It runs when a city changes zone on a live refresh.
- **Replay:** each city is pressed at `rtt × 7` ms (no-reply cities 250ms after the slowest). Its label fades in 120ms later over 300ms. An air-blue fibre ring grows on the same clock and fades over its last 300ms.
- **Morph:** switching to Delay moves every city along its bearing to `R·√(rtt / 400)`, shrinks the land plate to √(196/400), and swaps the ring sets. City moves take 1000ms on `--ease-out`, land opacity 700ms, rings 500ms. Detour lines (ink 0.28, each with a ghost dot where light would place the city) fade in over 400ms after a 650ms delay.
- **Reduced motion:** all of this is removed and the page shows final states.

## Do's and Don'ts

### Do:
- **Do** pair every zone ink with its own mark shape (solid, ringed, hollow, barred, double, crossed) wherever a zone appears: map, chart, slip and register.
- **Do** keep the zone edges at 20 / 50 / 100 / 160 / 250 ms, from `lib/atlas.js`, and draw the Delay view rings on those same values.
- **Do** print map layers in the Ink Plate order, with every map label on a `paper-hi` halo.
- **Do** set hierarchy with Anybody's width axis: condensed 64 to 82 for headings and numerals, expanded 110 to 128 for map and switch labels.
- **Do** print provenance beside values: anchor host, AS number, packets returned and postmark time to the second, in UTC.
- **Do** write dates in postal form (`DD ROMAN-MONTH YY · HH:MM UTC`) on the rim.
- **Do** use a 2px dashed air-blue outline at a 3px offset for every focus state.
- **Do** use `--ease-out` (`cubic-bezier(0.16, 1, 0.3, 1)`) for spatial moves, plain `ease` at 160 to 200ms for control colour changes, and drop motion under reduced motion.

### Don't:
- **Don't** use air red for anything except the frame and things that did not come back.
- **Don't** tell zones apart by colour alone. Zones II and III have nearly the same lightness, so only their shapes separate them in greyscale.
- **Don't** add drop shadows, glows or lift. Depth comes from plate order and opacity.
- **Don't** move toward the category default: a dark map, glowing arcs, a stats sidebar.
- **Don't** add a second typeface or turn off tabular figures.
- **Don't** hide filtered-out cities; dim them to 0.18 so you can still see where coverage is thin.
- **Don't** round the slip or the search field; the slip's edge is its perforation.
