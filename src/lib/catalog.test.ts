import { describe, expect, it } from 'vitest';
import { filterCatalog, filtersParam, initialFilters, type FilterKey } from './catalog';
import { plants, rules } from './data';
import { withSeason } from './season';

const items = withSeason(plants, 'continental', new Date(2026, 9, 19), rules);
const ids = (active: FilterKey[], query = '') => filterCatalog(items, query, new Set(active)).map((i) => i.plant.id).sort();

describe('filterCatalog', () => {
	const pot = (id: string) => plants.find((p) => p.id === id)?.containers?.ok === true;

	it('"Za balkon" keeps only plants that suit a pot', () => {
		const balcony = ids(['balcony']);
		expect(balcony.length).toBeGreaterThan(0);
		expect(balcony.every(pot)).toBe(true);
		expect(balcony).toEqual(expect.arrayContaining(['bosiljak', 'cesnjak', 'rajcica']));
		expect(balcony).not.toContain('bob');
	});

	it('combines "Za balkon" with season and search as AND', () => {
		const both = ids(['balcony', 'season']);
		expect(both).toEqual(expect.arrayContaining(['cesnjak', 'luk-ljutika']));
		expect(both.every((id) => pot(id) && ids(['season']).includes(id))).toBe(true);
		expect(ids(['season'])).toContain('bob');
		expect(ids(['balcony'], 'bob')).toEqual([]);
		expect(ids(['balcony'], 'cesnjak')).toEqual(['cesnjak']);
	});

	it('shows everything without filters', () => {
		expect(ids([])).toHaveLength(plants.length);
	});
});

describe('initialFilters and filtersParam', () => {
	const params = (s: string) => new URLSearchParams(s);

	it('preselects "Za balkon" for balcony gardeners on a plain visit only', () => {
		expect(initialFilters(params(''), 'balcony')).toEqual(['balcony']);
		expect(initialFilters(params(''), 'garden')).toEqual([]);
		expect(initialFilters(params('filtri=season'), 'balcony')).toEqual(['season']);
		expect(initialFilters(params('filtri='), 'balcony')).toEqual([]);
		expect(initialFilters(params('filtri=season,bogus,balcony'), 'unsure')).toEqual(['season', 'balcony']);
	});

	it('remembers that a balcony gardener cleared the filters', () => {
		expect(filtersParam(new Set(), 'balcony')).toBe('');
		expect(filtersParam(new Set(), 'garden')).toBeNull();
		expect(filtersParam(new Set<FilterKey>(['balcony', 'season']), 'garden')).toBe('season,balcony');
	});
});
