import { describe, expect, it } from 'vitest';
import { gardenAdvice } from './gardenWeather';
import type { ForecastDay } from './weather';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);
const today = d(2026, 6, 10);
/** Seven calm days from the 10th; `over` changes single days by offset. */
function week(over: Record<number, Partial<ForecastDay>> = {}, base: Partial<ForecastDay> = {}): ForecastDay[] {
	return Array.from({ length: 7 }, (_, i) => ({
		day: `2026-06-${String(10 + i).padStart(2, '0')}`,
		min: 14,
		max: 24,
		rain: 3,
		rainChance: 40,
		gusts: 25,
		cloud: 30,
		soil: 18,
		...base,
		...over[i]
	}));
}
const garden = { place: 'garden' as const };

describe('gardenAdvice', () => {
	it('says nothing on an ordinary week', () => {
		expect(gardenAdvice(week(), today, garden)).toBeNull();
	});

	it('warns about strong wind first, then heat', () => {
		expect(gardenAdvice(week({ 1: { gusts: 70 }, 0: { max: 33 } }), today, garden)).toMatchObject({ kind: 'wind', value: 70, day: d(2026, 6, 11) });
		expect(gardenAdvice(week({ 2: { max: 31 } }), today, garden)).toMatchObject({ kind: 'heat', value: 31 });
		// Too far ahead to act on yet.
		expect(gardenAdvice(week({ 5: { gusts: 80, max: 35 } }), today, garden)).toBeNull();
	});

	it('says the beds need no water when proper rain is likely today or tomorrow', () => {
		expect(gardenAdvice(week({ 1: { rain: 8, rainChance: 80 } }), today, garden)).toMatchObject({ kind: 'rain', value: 8 });
		expect(gardenAdvice(week({ 1: { rain: 8, rainChance: 30 } }), today, garden)).toBeNull();
		expect(gardenAdvice(week({ 3: { rain: 12, rainChance: 90 } }), today, garden)).toBeNull();
	});

	it('asks to water after five warm, dry days, but not in cool weather', () => {
		expect(gardenAdvice(week({}, { rain: 0 }), today, garden)).toMatchObject({ kind: 'dry' });
		expect(gardenAdvice(week({}, { rain: 0, max: 15 }), today, garden)).toBeNull();
	});

	it('flags cold soil only in spring', () => {
		const april = d(2026, 4, 10);
		const cold = week({}, { soil: 7, max: 16 }).map((x, i) => ({ ...x, day: `2026-04-${String(10 + i).padStart(2, '0')}` }));
		expect(gardenAdvice(cold, april, garden)).toMatchObject({ kind: 'coldSoil' });
		expect(gardenAdvice(week({}, { soil: 7 }), today, garden)?.kind).not.toBe('coldSoil');
	});

	it('suggests a mild overcast day for planting out, not for balconies', () => {
		const mild = week({ 2: { cloud: 85, rain: 0, max: 19, gusts: 15 } });
		expect(gardenAdvice(mild, today, garden)).toMatchObject({ kind: 'plantingDay', day: d(2026, 6, 12) });
		expect(gardenAdvice(mild, today, { place: 'balcony' })).toBeNull();
	});

	it('copes with an older cached forecast that only has minimums', () => {
		const old = week().map(({ day, min }) => ({ day, min }));
		expect(gardenAdvice(old, today, garden)).toBeNull();
	});
});
