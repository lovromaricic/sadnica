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
7. **Pets.** `pets` follows the ASPCA toxic plant list: check each risk and each `safe: true`. Only
   mark a plant safe when a reliable source says so; leave it out when unsure.
8. **Language.** Croatian grammar and the name forms in `forms` (nominative, genitive, accusative,
   plural). Text never addresses the reader with a gendered past tense ("posadio/posadila").

## Already corrected

An automated read of all 85 files (October 2026) fixed: gendered phrasing (peršin, rajčica), grammar
(bundeva, radič, rikola, kadulja, lavanda, timijan), spacing that contradicted its explanation
(ogrozd, ribiz), grafting steps on plants that are not grafted (smokva, maslina, kivi), risky planting
windows (lavanda inland in autumn, mandarina on the coast in autumn), a better codling-moth fix
(jabuka), no burning advice (šljiva), frost protection for lemon on the coast, and disease names that
were in "signs" instead of "fix". Apple tree, grapevine and artichoke are no longer balcony plants.
This does not replace the expert review.

A second, deeper read (three reviewers by category) then fixed:

- **Safety**: daffodil bulbs are poisonous and can be mistaken for onions; tulip bulbs harm cats and
  dogs; buy true bay laurel (Laurus nobilis), not the poisonous cherry laurel sold as "lovor".
- **Fixes that could do harm**: potato blight (wait two weeks before lifting), grapevine mildew
  (sulphur and copper), asparagus (short harvest in the first cutting year), beetroot boron deficiency,
  olive fly (bait traps), apricot frost (avoid frost pockets; a south wall makes bloom earlier).
- **Dates**: tomato and eggplant inland harvest into October; overwintered spinach harvested from
  March; cabbage and broccoli got their planting-out windows; early coastal potatoes from May; spring
  planting inland for peach, apricot and kiwi; frost-tender marigolds and cosmos no earlier than May
  inland (or indoors); basil outdoors on the coast from May; no autumn calendula sowing inland;
  autumn herb windows marked as nursery plants; cherry, fig and chamomile seasons widened.
- **Accuracy**: raspberry summer vs autumn varieties and their pruning, black currant pruning, peach
  pruned in spring, satsuma (Citrus unshiu) for the Neretva mandarin, maraska needs a pollinator,
  marigolds only suppress nematodes when planted densely, tulips decline after the first year, sweet
  corn row spacing, and watering advice for pots in summer and winter.

Judgment calls left as they are (for the expert to decide):

- Companion planting follows common folk lists; much of it is not well proven.
- "Polusjena" means 3–5 hours of sun, so it matches the app's sun check (6 or more hours is full sun),
  although some sources say 3–6.
- Trees inland: bare-root planting is really March, April is for potted plants.
- Olive inland is shown with a harvest window although the fruit rarely ripens in a pot (the summary
  says so).

## Suggested order

Start with what beginners plant most and what the app recommends first in each season:
češnjak, luk ljutika, crveni luk, bob, salata, rotkvica, špinat, matovilac, grašak, mrkva, krumpir,
rajčica, paprika, tikvica, krastavac, mahune, bosiljak, peršin, jagoda, neven.
Then the other vegetables and herbs, then fruit and flowers.

## Known simplifications

- Only two climate regions. Mountain areas (Lika, Gorski kotar) and the warmest coast differ by weeks.
- Broad bean (bob) is sown in February to April inland and in autumn on the coast. The original design
  had it sown in October in Zagreb, but autumn-sown broad beans often do not survive inland winters.
- For lemon, mandarin and olive inland, the "sowing" window means putting the pot outside in spring.
- Typical first-frost dates are in `data/rules.json` (inland: around late October; coast: December).
