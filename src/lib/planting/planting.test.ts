import { describe, expect, it } from 'vitest';
import { plants, plantsById } from '../data';
import { plantingSchema, type Planting } from '../data/schema';
import { ariaLabel, headerLabel, headerValue, showsDepth, tipText, viewText } from './content';
import { formatCm } from './format';
import {
	broadcastSide,
	broadcastTop,
	cloveSide,
	cloveTop,
	fitScale,
	hasDiagram,
	keepEvery,
	rowSeedSide,
	rowSeedTop,
	saplingSide,
	saplingTop,
	SIDE,
	SURFACE,
	TOP,
	transplantSide,
	transplantTop
} from './geometry';
import { seededRandom } from './random';
import { Timeline } from './timeline';
import { plantingProblems } from './validate';

type Of<M extends Planting['method']> = Extract<Planting, { method: M }>;
const base = { reviewed: false };
const clove = (o: Partial<Of<'clove'>> = {}): Of<'clove'> => ({ method: 'clove', ...base, noun: 'clove', spacingCm: 10, rowSpacingCm: 25, depthCm: 5, orientation: 'tip-up', ...o });
const rowSeed = (o: Partial<Of<'row-seed'>> = {}): Of<'row-seed'> => ({ method: 'row-seed', ...base, rowSpacingCm: 25, thinToCm: 5, depthCm: 1, ...o });
const broadcast = (o: Partial<Of<'broadcast'>> = {}): Of<'broadcast'> => ({ method: 'broadcast', ...base, thinToCm: 5, depthCm: 1, ...o });
const transplant = (o: Partial<Of<'transplant'>> = {}): Of<'transplant'> => ({ method: 'transplant', ...base, spacingCm: 50, rowSpacingCm: 70, depthCm: 10, depthMode: 'to-first-leaves', ...o });
const sapling = (o: Partial<Of<'sapling'>> = {}): Of<'sapling'> => ({ method: 'sapling', ...base, spacingCm: 400, rowSpacingCm: 500, holeDepthCm: 50, holeWidthCm: 60, staked: true, graftedAboveSoil: true, ...o });

const inside = (v: number, max: number) => v >= 0 && v <= max;

describe('formatCm', () => {
	it('uses cm below a metre and m from 100 cm, with a decimal comma', () => {
		expect(formatCm(10)).toBe('10 cm');
		expect(formatCm(0.5)).toBe('0,5 cm');
		expect(formatCm(99)).toBe('99 cm');
		expect(formatCm(100)).toBe('1 m');
		expect(formatCm(150)).toBe('1,5 m');
		expect(formatCm(400)).toBe('4 m');
	});
});

describe('fitScale', () => {
	it('takes the tightest fit and respects the maximum', () => {
		expect(fitScale([[25, 125], [20, 220]])).toBe(5);
		expect(fitScale([[1, 80]], 10)).toBe(10);
	});
});

describe('seededRandom', () => {
	it('repeats the same sequence for the same seed', () => {
		const a = seededRandom(7);
		const b = seededRandom(7);
		const seq = [a(), a(), a()];
		expect([b(), b(), b()]).toEqual(seq);
		expect(seq.every((v) => v >= 0 && v < 1)).toBe(true);
		expect(seededRandom(8)()).not.toBe(seq[0]);
	});
});

describe('Timeline', () => {
	it('keeps every element on one loop with start offsets instead of delays', () => {
		const tl = new Timeline('x');
		const style = tl.pop(5);
		expect(style).toBe('animation:x0 10s ease-out infinite;--end:1');
		expect(style).not.toContain('delay');
		expect(tl.css()).toContain('@keyframes x0{0%,5%{opacity:0;transform:scale(.3)}8%');
	});

	it('reuses identical keyframes and names new ones', () => {
		const tl = new Timeline('k');
		expect(tl.fade(10)).toBe(tl.fade(10));
		expect(tl.fade(20)).toContain('k1');
		expect(tl.css().match(/@keyframes/g)).toHaveLength(2);
	});

	it('marks elements that end hidden, and see-through covers, for the still picture', () => {
		const tl = new Timeline('s');
		expect(tl.flash(3, 56)).toContain('--end:0');
		expect(tl.fade(36, { to: 0.92, end: 0.55 })).toContain('--end:0.55');
	});

	it('never starts an element so late that it cannot finish before the loop fades out', () => {
		const tl = new Timeline('c');
		tl.drop(99);
		expect(tl.css()).toContain('0%,85%{');
	});
});

describe('clove geometry', () => {
	it('matches the design for garlic: 5 px per cm, five cloves per row', () => {
		const g = cloveTop(clove());
		expect(g.scale).toBe(5);
		expect(g.rows).toEqual([45, 170]);
		expect(g.xs).toEqual([30, 80, 130, 180, 230]);
	});

	it('shrinks wide spacing so at least three cloves fit a row', () => {
		const g = cloveTop(clove({ spacingCm: 40, rowSpacingCm: 30 }));
		expect(g.xs.length).toBeGreaterThanOrEqual(3);
		expect(g.rows[1] - g.rows[0]).toBeCloseTo(30 * g.scale);
	});

	it('keeps deep bulbs inside the side view', () => {
		const shallow = cloveSide(clove());
		expect(shallow.tipY - SURFACE).toBe(50);
		const deep = cloveSide(clove({ depthCm: 20, spacingCm: 15 }));
		expect(deep.holeBottom).toBeLessThanOrEqual(SIDE.height);
		expect(deep.xs.every((x) => inside(x + 17, SIDE.width))).toBe(true);
	});
});

describe('row-seed geometry', () => {
	it('keeps every third seed by default', () => {
		const p = rowSeed();
		expect(keepEvery(p)).toBe(3);
		const g = rowSeedTop(p);
		expect(g.seeds.filter((s) => s.kept).length).toBe(Math.ceil(g.seeds.length / 3));
		expect(g.kept[1] - g.kept[0]).toBeCloseTo(g.thinPx);
	});

	it('keeps every seed when nothing is thinned (n = 1)', () => {
		const p = rowSeed({ thinToCm: 5, sowCm: 5, rowSpacingCm: 30 });
		expect(keepEvery(p)).toBe(1);
		expect(rowSeedTop(p).seeds.every((s) => s.kept)).toBe(true);
	});

	it('fits wide rows and keeps the side view readable for shallow and deep seed', () => {
		const wide = rowSeedTop(rowSeed({ rowSpacingCm: 60, thinToCm: 40 }));
		expect(wide.rows[1]).toBeLessThanOrEqual(TOP.height);
		expect(wide.kept.length).toBeGreaterThanOrEqual(3);
		expect(rowSeedSide(rowSeed()).depthPx).toBe(20);
		expect(rowSeedSide(rowSeed({ depthCm: 5 })).depthPx).toBe(90);
	});
});

describe('broadcast geometry', () => {
	it('lays out a 7 x 5 grid inside the bed', () => {
		const g = broadcastTop(broadcast());
		expect(g.grid).toHaveLength(35);
		expect(g.grid.every((p) => inside(p.x, TOP.width) && inside(p.y, TOP.height))).toBe(true);
	});

	it('scatters seeds the same way on every render', () => {
		expect(broadcastTop(broadcast()).scattered).toEqual(broadcastTop(broadcast()).scattered);
		expect(broadcastSide(broadcast()).seeds.every((s) => s.y > SURFACE)).toBe(true);
	});
});

describe('transplant geometry', () => {
	it('matches the design scale for tomato (2.4 px per cm)', () => {
		const g = transplantTop(transplant());
		expect(g.scale).toBeCloseTo(2.4, 1);
		expect(g.xs[1] - g.xs[0]).toBeCloseTo(50 * g.scale);
	});

	it('places the root ball by depth mode', () => {
		expect(transplantSide(transplant()).ballTop).toBe(SURFACE + 80);
		expect(transplantSide(transplant({ depthMode: 'same-level' })).ballTop).toBe(SURFACE);
		expect(transplantSide(transplant({ depthMode: 'crown-above-soil' })).leafY).toBeLessThan(SURFACE);
		expect(transplantSide(transplant({ depthCm: 30 })).holeBottom).toBeLessThanOrEqual(SIDE.height);
	});
});

describe('sapling geometry', () => {
	it('fits three trees per row and two rows, crown at 0.4 of the spacing', () => {
		const g = saplingTop(sapling());
		expect(g.xs[0]).toBeCloseTo(48);
		expect(g.ys[1] - g.ys[0]).toBeCloseTo(115);
		expect(g.crown).toBeCloseTo(36.8);
	});

	it('scales the pit to the side view', () => {
		const g = saplingSide(sapling({ holeDepthCm: 100, holeWidthCm: 100 }));
		expect(g.h).toBeLessThanOrEqual(90);
		expect(g.w).toBeLessThanOrEqual(110);
		expect(g.bottom + 34).toBeLessThanOrEqual(SIDE.height);
	});
});

describe('texts', () => {
	const garlic = plantsById.get('cesnjak')!;
	const apple = plantsById.get('jabuka')!;

	it('builds the header and the design texts from data', () => {
		expect(headerValue(clove())).toBe('10 cm · 5 cm');
		expect(headerValue(sapling())).toBe('4 m · 50 cm');
		expect(viewText(garlic, clove(), 'top')).toBe('Zupce sadi oko 10 cm jedan od drugoga, a redove drži oko 25 cm razmaka.');
		expect(viewText(garlic, clove(), 'side')).toBe('Češnjak ide oko 5 cm duboko, vrhom prema gore. Zatim ga prekrij zemljom.');
		expect(viewText(apple, sapling(), 'side')).toBe(
			'Iskopaj jamu duboku oko 50 cm i široku oko 60 cm. Mjesto cijepljenja neka ostane iznad zemlje, a uz biljku zabij kolac.'
		);
	});

	it('drops the clauses whose flags are off', () => {
		expect(viewText(apple, sapling({ staked: false, graftedAboveSoil: false }), 'side')).toBe('Iskopaj jamu duboku oko 50 cm i široku oko 60 cm.');
		expect(ariaLabel(apple, sapling({ staked: false }), 'side')).not.toContain('kolac');
	});

	it('uses the plant tip when named, else the method default', () => {
		expect(tipText(clove({ tipKey: 'garlic' }))).toContain('dlanom');
		expect(tipText(broadcast())).toContain('dva prolaza');
	});
});

describe('plant data', () => {
	it('gives 78 of 85 plants a diagram; hill and special keep the text', () => {
		expect(plants).toHaveLength(85);
		expect(plants.filter((p) => hasDiagram(p.planting))).toHaveLength(78);
		for (const id of ['bundeva', 'tikvica', 'krastavac', 'dinja', 'lubenica', 'krumpir', 'sparoga']) {
			expect(hasDiagram(plantsById.get(id)!.planting)).toBe(false);
		}
		expect(hasDiagram(undefined)).toBe(false);
	});

	it('every plant passes the planting checks and is marked unreviewed', () => {
		for (const p of plants) {
			expect(plantingProblems(p), p.id).toEqual([]);
			expect(p.planting?.reviewed, p.id).toBe(false);
		}
	});
});

describe('planting validation', () => {
	it('accepts each method with its required fields', () => {
		for (const p of [clove(), rowSeed(), broadcast(), transplant(), sapling(), { method: 'hill', reviewed: false }]) {
			expect(plantingSchema.safeParse(p).success, p.method).toBe(true);
		}
	});

	it('rejects missing fields, non-positive numbers, bad enums and stray fields', () => {
		const { depthCm: _, ...noDepth } = clove();
		expect(plantingSchema.safeParse(noDepth).success).toBe(false);
		expect(plantingSchema.safeParse(rowSeed({ thinToCm: 0 })).success).toBe(false);
		expect(plantingSchema.safeParse(transplant({ depthMode: 'deep' as never })).success).toBe(false);
		expect(plantingSchema.safeParse({ ...broadcast(), spacingCm: 10 }).success).toBe(false);
		expect(plantingSchema.safeParse({ method: 'scatter', reviewed: false }).success).toBe(false);
		expect(plantingSchema.safeParse({ ...sapling(), staked: 'yes' }).success).toBe(false);
	});

	it('reports a spacing that contradicts the tile, an unknown tip and impossible sowing', () => {
		const garlic = plantsById.get('cesnjak')!;
		expect(plantingProblems({ ...garlic, planting: clove({ spacingCm: 12 }) })[0]).toContain('12 cm');
		expect(plantingProblems({ ...garlic, planting: clove({ tipKey: 'nope' }) })[0]).toContain('nope');
		expect(plantingProblems({ ...garlic, spacingText: '5 cm', planting: rowSeed({ sowCm: 8 }) })).toContain('sowCm cannot be larger than thinToCm');
	});
});

describe('plants without a depth to show', () => {
	const shallot = plantsById.get('luk-ljutika')!;
	const chamomile = plantsById.get('kamilica')!;

	it('onion sets keep the tip above the soil and the header shows spacing only', () => {
		const p = clove({ depthCm: undefined, tipShowing: true, noun: 'bulb' });
		expect(cloveSide(p).tipY).toBeLessThan(SURFACE);
		expect(showsDepth(p)).toBe(false);
		expect(headerLabel(p)).toBe('Razmak');
		expect(headerValue(p)).toBe('10 cm');
		expect(viewText(shallot, p, 'side')).toContain('vrh malo viri');
	});

	it('light-sprouting seed stays on the surface, uncovered', () => {
		const p = broadcast({ depthCm: undefined, surface: true });
		expect(broadcastSide(p).depthPx).toBe(0);
		expect(broadcastSide(p).seeds.every((s) => s.y <= SURFACE + 3)).toBe(true);
		expect(viewText(chamomile, p, 'side')).toContain('Ne prekrivaj');
		expect(headerValue(p)).toBe('5 cm');
	});

	it('seedlings at pot level show spacing only; buried ones show the depth', () => {
		expect(headerValue(transplant({ depthMode: 'same-level', depthCm: undefined }))).toBe('50 cm');
		expect(headerLabel(transplant())).toBe('Razmak i dubina');
		expect(headerValue(transplant({ depthMode: 'dibber', depthCm: 15 }))).toBe('50 cm · 15 cm');
		expect(transplantSide(transplant({ depthMode: 'dibber', depthCm: 15 })).ballTop).toBeGreaterThan(SURFACE);
	});

	it('uses the deep seed text from 2 cm', () => {
		const chard = plantsById.get('blitva')!;
		expect(viewText(chard, rowSeed({ depthCm: 2 }), 'side')).not.toContain('plitko');
		expect(viewText(chard, rowSeed({ depthCm: 1 }), 'side')).toContain('plitko');
	});
});

describe('sapling forms and supports', () => {
	const currant = plantsById.get('ribiz')!;
	const kiwi = plantsById.get('kivi')!;

	it('talks about bushes and canes, not crowns', () => {
		expect(viewText(currant, sapling({ form: 'bush' }), 'top')).toMatch(/^Grmove sadi .* jedan od drugoga/);
		expect(viewText(kiwi, sapling({ form: 'cane' }), 'top')).toContain('veži uz potporu');
		expect(viewText(kiwi, sapling({ form: 'cane' }), 'top')).not.toContain('Krošnje');
	});

	it('names a pergola or wires instead of a stake', () => {
		const text = viewText(kiwi, sapling({ staked: false, support: 'trellis', graftedAboveSoil: false }), 'side');
		expect(text).toContain('pergolu');
		expect(text).not.toContain('kolac');
		expect(ariaLabel(kiwi, sapling({ staked: false, support: 'wires', graftedAboveSoil: false }), 'side')).toContain('žica');
	});
});

describe('depth rules in the schema', () => {
	it('asks for a depth exactly when the picture uses one', () => {
		expect(plantingSchema.safeParse(clove({ depthCm: undefined })).success).toBe(false);
		expect(plantingSchema.safeParse(clove({ depthCm: undefined, tipShowing: true })).success).toBe(true);
		expect(plantingSchema.safeParse(clove({ tipShowing: true })).success).toBe(false);
		expect(plantingSchema.safeParse(broadcast({ surface: true })).success).toBe(false);
		expect(plantingSchema.safeParse(transplant({ depthMode: 'same-level' })).success).toBe(false);
		expect(plantingSchema.safeParse(transplant({ depthMode: 'same-level', depthCm: undefined })).success).toBe(true);
		expect(plantingSchema.safeParse(transplant({ depthMode: 'dibber', depthCm: undefined })).success).toBe(false);
	});

	it('does not allow a stake and another support together', () => {
		expect(plantingSchema.safeParse(sapling({ support: 'wires' })).success).toBe(false);
		expect(plantingSchema.safeParse(sapling({ support: 'wires', staked: false })).success).toBe(true);
	});

	it('every plant file still parses', () => {
		for (const p of plants) if (p.planting) expect(plantingSchema.safeParse(p.planting).success, p.id).toBe(true);
	});
});
