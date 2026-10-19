import { describe, expect, it } from 'vitest';
import { filterCatalog, filtersParam, initialFilters, type FilterKey } from './catalog';
import { plants, rules } from './data';
import { withSeason } from './season';

const items = withSeason(plants, 'continental', new Date(2026, 9, 19), rules);
const ids = (active: FilterKey[], query = '') => filterCatalog(items, query, new Set(active)).map((i) => i.plant.id).sort();

describe('filterCatalog', () => {
	it('"Za balkon" keeps only plants that suit a pot', () => {
		expect(ids(['balcony'])).toEqual(['bosiljak', 'cesnjak', 'luk-ljutika', 'matovilac', 'mrkva', 'rajcica', 'spinat']);
	});

	it('combines "Za balkon" with season and search as AND', () => {
		expect(ids(['balcony', 'season'])).toEqual(['cesnjak', 'luk-ljutika', 'matovilac', 'spinat']);
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
		expect(initialFilters(params(''), 'ground')).toEqual([]);
		expect(initialFilters(params('filtri=season'), 'balcony')).toEqual(['season']);
		expect(initialFilters(params('filtri='), 'balcony')).toEqual([]);
		expect(initialFilters(params('filtri=season,bogus,balcony'), 'none')).toEqual(['season', 'balcony']);
	});

	it('remembers that a balcony gardener cleared the filters', () => {
		expect(filtersParam(new Set(), 'balcony')).toBe('');
		expect(filtersParam(new Set(), 'ground')).toBeNull();
		expect(filtersParam(new Set<FilterKey>(['balcony', 'season']), 'ground')).toBe('season,balcony');
	});
});
