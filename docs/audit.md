# Audit

Lighthouse, keyboard and contrast audit of the production build (`npm run build && npm run preview`),
done 2026-10-19 with Chrome 155. Routes: `/`, `/pocetak`, `/biljke`, `/biljke/cesnjak`, `/moj-vrt`, each
at Lighthouse's mobile preset (Moto G Power, simulated slow 4G, 4x CPU slowdown) and desktop preset.
Every run started from cleared storage with `sadnica:v1` set to an onboarded state (Zagreb,
continental, češnjak in Moj vrt) before any page script ran, so no route redirected to `/pocetak`.
The final scores and keyboard checks include the phone app-shell layout (`main[data-scroller]` is the
scroll container below 900px).

## Scores

Lighthouse 12.8. Performance is before → after the fixes below; accessibility and best practices were
100 before and after.

| Preset / route          | Performance | Accessibility | Best practices |
| ----------------------- | ----------- | ------------- | -------------- |
| mobile `/`              | 87 → 99     | 100           | 100            |
| mobile `/pocetak`       | 98 → 99     | 100           | 100            |
| mobile `/biljke`        | 97 → 99     | 100           | 100            |
| mobile `/biljke/cesnjak`| 87 → 87–99  | 100           | 100            |
| mobile `/moj-vrt`       | 98 → 99     | 100           | 100            |
| desktop `/`             | 100 → 100   | 100           | 100            |
| desktop `/pocetak`      | 100 → 100   | 100           | 100            |
| desktop `/biljke`       | 100 → 100   | 100           | 100            |
| desktop `/biljke/cesnjak` | 99 → 99   | 100           | 100            |
| desktop `/moj-vrt`      | 98 → 100    | 100           | 100            |

The plant page on mobile is noisy: four runs of the final build scored 87, 93, 99 and 99. The rest
varied by a point at most. Mobile metrics after the fixes: FCP = LCP = 1.7 s on every route except
the plant page (1.7–3.2 s); total
blocking time 0 ms everywhere; CLS at most 0.009.

**PWA / installability.** Lighthouse 12 no longer has a PWA category, so it was run with Lighthouse
11.7, the last version that has it: **100 on all ten runs** (installable manifest, service worker
controls the start URL, offline 200, themed omnibox, maskable icon, viewport, content sized
correctly). Offline was also checked after the font change: with the network off, a reload of
`/biljke/cesnjak` renders with both web fonts from the service worker cache.

## Fixed

- **Zod shipped to every page (performance).** `src/lib/data/index.ts` re-validated all content with
  zod in the browser, adding about 100 KB of JavaScript to the critical path, although
  `npm run build` already validates the same files (`npm run validate`). The app now imports the JSON
  as-is; the schemas are only used by the build-time check. `REGIONS` moved to
  `src/lib/data/regions.ts` so importing it no longer pulls in zod.
- **Render-blocking Google Fonts stylesheet (performance).** It cost about 800 ms on mobile. It now
  loads with `rel="preload"` and switches to a stylesheet on load. The app renders from JavaScript
  after that anyway, and `display=swap` was already set, so the only visible difference on a slow
  first visit is the fallback font for a moment (CLS stayed under 0.01).
- **Fact tiles on the plant page: accessible name did not contain the visible text** (Lighthouse
  `label-content-name-mismatch`, WCAG 2.5.3). The `aria-label` ("Težina: Lako. Objasni: Težina")
  replaced the visible text, so voice control users saying "Težina" or "Lako" could miss it. The
  name now comes from the visible text ("Težina: Lako", with a screen-reader-only colon) and
  `aria-haspopup="dialog"` says it opens an explanation. The unused `t.plant.explain` string is gone.
- **Modal name.** The dialog was labelled by the value only ("Lako"); it is now labelled by both
  lines ("Težina Lako").
- **Modal focus trap gap.** Clicking non-interactive text in the dialog focuses the dialog itself;
  Shift+Tab from there left the dialog. It now wraps to the last button like Shift+Tab from the
  first one.
- **Neighbour links on the plant page were 22px tall** (spec: 44px targets). The link now covers the
  whole chip, extended to 44px tall with an invisible pseudo-element. Nothing changes visually.
- **Text fields had no focus ring.** The search field (`/biljke`) and city field (`/pocetak`) only
  darkened their border on focus. They now get the same 3px blue ring as every other control.
- **Focus hidden behind the bottom nav (phones).** Tabbing to controls near the end of a page ("Kako
  saditi", the last catalogue cards, the last step, "Podsjeti me") scrolled them only to the bottom
  edge, half under the floating nav (WCAG 2.4.11). The scroll container now has
  `scroll-padding-bottom: var(--nav-space)`; every focused element on `/`, `/biljke`,
  `/biljke/cesnjak` and `/moj-vrt` now stops above the nav.
- **Placeholder contrast.** Placeholders used the browser default `#757575`, which is 4.31:1 on the
  ground-coloured city field on `/pocetak` (below AA). They now use `--muted` (6.85:1 there).

## Keyboard pass

Scripted with Puppeteer, Tab through each route at 390px and 1350px wide, then checked by
screenshot.

- **Tab order** follows reading order on every route: desktop header (logo, nav, location) → page
  content → mobile bottom nav last. On the desktop plant page the left column (back, add/remove,
  reminder) comes before the facts on the right, which matches the two-column layout.
- **Visible focus** on every stop: 3px `--focus` blue ring (at least 3.4:1 against every background, including ink), lime
  ring on the dark navs and task list. Card links (Danas list, catalogue, Moj vrt) put the ring
  around the whole card through their stretched `::after`.
- **Modal** (plant page fact tiles): Enter opens it; focus moves to "Razumijem"; Tab and Shift+Tab
  cycle between "Zatvori" and "Razumijem" only; Esc closes it and focus returns to the tile that
  opened it. `role="dialog"`, `aria-modal="true"`, body scroll locked.
- **`aria-pressed` toggles** all report and update state: catalogue filters, region / place /
  experience choices on `/pocetak`, add-to-garden buttons, step check marks, weekly tasks (Space
  toggles and keeps focus).
- `prefers-reduced-motion` is honoured globally in `app.css` (modal, toast and button animations).

## Contrast (WCAG AA)

Every rendered text node on all five routes, both widths, was checked against its actual background
(including the pastel tiles and the pressed / in-garden states): no failures, nothing within 0.3 of
the threshold. Token pairs:

| Text                | Lowest background | Ratio  |
| ------------------- | ----------------- | ------ |
| `--muted` #4a5a50   | peach #fad9cc     | 5.53:1 |
| `--muted-2` #2e3b33 | peach             | 8.86:1 |
| `--lilac-ink`       | lilac             | 11.3:1 |
| `--dark-muted`      | ink #14201a       | 9.52:1 |
| `--lime`            | ink               | 13.8:1 |

Muted text on the pastel tiles is comfortably AA (5.5–6.4:1).

## Remaining

- **Plant page mobile performance (87–99, run to run).** LCP is the summary paragraph; about 85% of it is render
  delay while the client-side app boots (`ssr = false`, see decisions.md). Prerendering real HTML
  would fix it but conflicts with the localStorage-and-today design; not changed.
- **Same-origin CSS is still render-blocking** (three small SvelteKit stylesheets, ~150 ms estimated
  on mobile). That is how SvelteKit emits page CSS; left alone.
- **No skip link.** Desktop keyboard users tab through 5 header links before the content. Not in the
  spec and the header is short; worth adding if the nav grows.
- **Neighbour chips** are 40px tall visually; their tap area is 44px but the chips themselves were
  left at the designed size.
- The audits were run against `vite preview` on localhost, so TTFB (~450 ms simulated) is not
  representative of a real static host with HTTP/2 and caching.
