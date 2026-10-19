# Sadnica

A beginner-friendly planting app: what to plant this week where you live, and how. Croatian UI,
static site, no accounts, works offline. "Sadnica" is a placeholder name (`src/lib/config.ts`).

## Commands

```bash
npm install
npm run dev        # http://localhost:5173
npm run dev:phone  # https on your network, for testing the camera sun check on a phone
npm test           # unit tests (season logic, search, tasks, storage)
npm run validate   # check data/ against the schema
npm run build      # validate, then build the static site into build/
npm run preview    # serve build/ locally
npm run check      # type-check
npm run icons      # regenerate static/icons
```

## Layout

| Path | What |
| --- | --- |
| `data/plants/*.json` | One file per plant. Add a file to add a plant; nothing else to change. |
| `data/explanations.json` | Text for the Težina / Sunce / Voda modals. |
| `data/rules.json` | Frost dates per region and season thresholds. |
| `src/lib/data/schema.ts` | Zod schema for all content. `scripts/validate-data.ts` fails the build on bad data. |
| `src/lib/season.ts` | `getSeasonStatus(plant, region, date, rules)` and the recommendation order. |
| `src/lib/i18n/hr.ts` | Every UI string. |
| `src/lib/cities.ts` | City → region lookup. |
| `src/lib/storage.ts`, `store.svelte.ts` | Versioned localStorage state. |
| `src/routes/` | `/` Danas, `/pocetak` onboarding, `/biljke`, `/biljke/[id]`, `/moj-vrt`. |
| `src/service-worker/` | Offline cache. |
| `docs/decisions.md` | Choices made where the spec was silent. |

## Content status

All gardening text is generated placeholder content and marked `"reviewed": false`. It must be checked
by a person before publishing.
