import { describe, expect, it } from 'vitest';
import { plantsById } from './data';
import { areBadNeighbours, areGoodNeighbours, gardenNeighbours, gardenPlantNamed, listNames } from './companions';

const P = (id: string) => plantsById.get(id)!;

describe('companions', () => {
	it('treats bad neighbours as mutual', () => {
		// Garlic lists broad bean, and broad bean lists garlic.
		expect(areBadNeighbours(P('cesnjak'), P('bob'))).toBe(true);
		expect(areBadNeighbours(P('bob'), P('cesnjak'))).toBe(true);
		// Only shallot's list names broad bean; still a conflict from either side.
		expect(areBadNeighbours(P('bob'), P('luk-ljutika'))).toBe(true);
		expect(areBadNeighbours(P('cesnjak'), P('rajcica'))).toBe(false);
	});

	it('finds good neighbours, never when they are also bad', () => {
		expect(areGoodNeighbours(P('rajcica'), P('bosiljak'))).toBe(true);
		expect(areGoodNeighbours(P('cesnjak'), P('mrkva'))).toBe(true);
		expect(areGoodNeighbours(P('cesnjak'), P('bob'))).toBe(false);
	});

	it('checks a plant against the garden, ignoring itself', () => {
		const garden = [P('cesnjak'), P('mrkva'), P('luk-ljutika')];
		const r = gardenNeighbours(P('bob'), garden);
		expect(r.bad.map((p) => p.id).sort()).toEqual(['cesnjak', 'luk-ljutika']);
		expect(gardenNeighbours(P('cesnjak'), garden).bad).toEqual([]);
		expect(gardenNeighbours(P('cesnjak'), garden).good.map((p) => p.id)).toEqual(['mrkva']);
	});

	it('matches names from the data to garden plants, and lists names in Croatian', () => {
		expect(gardenPlantNamed('Luk ljutika', [P('luk-ljutika')])?.id).toBe('luk-ljutika');
		expect(gardenPlantNamed('Grah', [P('luk-ljutika')])).toBeUndefined();
		expect(listNames([P('bob')])).toBe('Bob');
		expect(listNames([P('bob'), P('cesnjak'), P('mrkva')])).toBe('Bob, Češnjak i Mrkva');
	});
});
