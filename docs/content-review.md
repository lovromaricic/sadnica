# Content review guide

All plant content (85 plants in `data/plants/`), `data/explanations.json` and `data/rules.json` was
written without an expert and is marked `"reviewed": false`. This guide is for the person who checks
it. When a file is checked, set `"reviewed": true` in it; `npm run validate` reports how many are left.

## What the machine already checks

`npm run validate` (also part of `npm run build`) fails or warns on:

- schema errors: missing fields, months outside 1–12, malformed colours, ids not matching file names;
- a plant listed as a good neighbour by one plant and a bad neighbour by the other (fails);
- the same search word used by two plants, apart from deliberate ones like "zelje" (warning);
- fruit trees marked as balcony pot plants, citrus and olive excepted (warning);
- plants without pot information (warning).

It cannot judge whether the advice is right. That is the review.

## What to check in each plant file

1. **Dates.** `sow` (sowing or planting) and `harvest` (flowering, for flowers) months, for both regions:
   `continental` (inland, e.g. Zagreb) and `adriatic` (coast, e.g. Split). Months are whole months on
   purpose. A `note` explains a window ("Sjetva u zatvorenom"); `needsCover` means "only with fleece".
2. **Basics.** `difficulty` (easy / medium / hard for a first-time gardener), `sun`, `water`,
   `spacingText` and its explanation.
3. **Pots.** `containers.ok` means a beginner can grow it on a balcony; `minPotCm` is the smallest pot
   diameter. Be strict: when in doubt, `ok: false`.
4. **Steps** (4 per plant), **problems** (2–3, each with signs and a fix) and **weeklyTip**: correct,
   safe and doable by a beginner.
5. **Neighbours.** Good and bad companions. Names must match catalogue plant names to be linked.
6. **Perennials.** `perennial.yearsToFirstHarvest` for trees, bushes, asparagus and artichoke.
7. **Language.** Croatian grammar and the name forms in `forms` (nominative, genitive, accusative,
   plural). Text never addresses the reader with a gendered past tense ("posadio/posadila").

## Already corrected

An automated read of all 85 files (October 2026) fixed: gendered phrasing (peršin, rajčica), grammar
(bundeva, radič, rikola, kadulja, lavanda, timijan), spacing that contradicted its explanation
(ogrozd, ribiz), grafting steps on plants that are not grafted (smokva, maslina, kivi), risky planting
windows (lavanda inland in autumn, mandarina on the coast in autumn), a better codling-moth fix
(jabuka), no burning advice (šljiva), frost protection for lemon on the coast, and disease names that
were in "signs" instead of "fix". Apple tree, grapevine and artichoke are no longer balcony plants.
This does not replace the expert review.

## Suggested order

Start with what beginners plant most and what the app recommends first in each season:
češnjak, luk ljutika, crveni luk, bob, salata, rotkvica, špinat, matovilac, grašak, mrkva, krumpir,
rajčica, paprika, tikvica, krastavac, mahune, bosiljak, peršin, jagoda, neven.
Then the other vegetables and herbs, then fruit and flowers.

## Known simplifications

- Only two climate regions. Mountain areas (Lika, Gorski kotar) and the warmest coast differ by weeks.
- Broad bean (bob) is sown in October inland because the original design said so; autumn sowing is
  risky in cold winters, and February to March may be the safer advice.
- For lemon, mandarin and olive inland, the "sowing" window means putting the pot outside in spring.
- Typical first-frost dates are in `data/rules.json` (inland: around late October; coast: December).
