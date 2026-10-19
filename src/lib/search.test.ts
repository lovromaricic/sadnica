import { describe, expect, it } from 'vitest';
import { plantsById } from './data';
import { matchesQuery, normalize } from './search';
import { findCity, regionForCity } from './cities';
import { pluralPlants } from './i18n/hr';

describe('search', () => {
	it('normalizes case and diacritics', () => {
		expect(normalize('  ŠPINAT  Đurđica ')).toBe('spinat durdica');
	});

	it('finds plants by synonym and without diacritics', () => {
		const tomato = plantsById.get('rajcica')!;
		for (const q of ['paradajz', 'Rajčica', 'rajcica', 'POMIDOR', 'para']) expect(matchesQuery(tomato, q)).toBe(true);
		expect(matchesQuery(plantsById.get('bosiljak')!, 'bazilika')).toBe(true);
		expect(matchesQuery(plantsById.get('cesnjak')!, 'cesnjak')).toBe(true);
		expect(matchesQuery(tomato, 'mrkva')).toBe(false);
	});
});

describe('cities', () => {
	it('maps cities to regions with a continental fallback', () => {
		expect(regionForCity('split')).toBe('adriatic');
		expect(regionForCity('Šibenik')).toBe('adriatic');
		expect(regionForCity('sibenik')).toBe('adriatic');
		expect(regionForCity('Zagreb')).toBe('continental');
		expect(regionForCity('Nepoznato Selo')).toBe('continental');
		expect(findCity('rijeka')?.locative).toBe('Rijeci');
	});
});

describe('pluralPlants', () => {
	it('uses Croatian plural forms', () => {
		expect([1, 2, 4, 5, 11, 12, 21, 22, 25, 101, 111].map(pluralPlants)).toEqual([
			'1 biljka',
			'2 biljke',
			'4 biljke',
			'5 biljaka',
			'11 biljaka',
			'12 biljaka',
			'21 biljka',
			'22 biljke',
			'25 biljaka',
			'101 biljka',
			'111 biljaka'
		]);
	});
});
