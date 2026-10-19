import type { Plant } from './data/schema';
import { matchesQuery } from './search';
import { isInSeason, potFriendly, type PlantWithSeason } from './season';
import type { Place } from './storage';

export const FILTERS = ['season', 'balcony', 'easy', 'veg', 'herb', 'flower', 'fruit'] as const;
export type FilterKey = (typeof FILTERS)[number];
const CATEGORIES: Plant['category'][] = ['veg', 'herb', 'flower', 'fruit'];

/**
 * Filters from the address (`?filtri=season,balcony`). Without `filtri` at all, balcony gardeners start
 * with "Za balkon" on; an empty `filtri=` means they turned everything off, so nothing is preselected.
 */
export function initialFilters(params: URLSearchParams, place: Place): FilterKey[] {
	const raw = params.get('filtri');
	if (raw === null) return place === 'balcony' ? ['balcony'] : [];
	return FILTERS.filter((f) => raw.split(',').includes(f));
}

/** Filters for the address. Returns '' (keep `filtri=`) when a balcony gardener cleared the default. */
export function filtersParam(active: ReadonlySet<FilterKey>, place: Place): string | null {
	const list = FILTERS.filter((f) => active.has(f));
	if (list.length) return list.join(',');
	return place === 'balcony' ? '' : null;
}

/** Categories combine as OR; the other filters and the search as AND. */
export function filterCatalog(items: PlantWithSeason[], query: string, active: ReadonlySet<FilterKey>): PlantWithSeason[] {
	const cats = CATEGORIES.filter((c) => active.has(c));
	return items.filter(
		({ plant, season }) =>
			matchesQuery(plant, query) &&
			(!active.has('season') || isInSeason(season)) &&
			(!active.has('easy') || plant.difficulty === 'easy') &&
			(!active.has('balcony') || potFriendly(plant)) &&
			(cats.length === 0 || cats.includes(plant.category))
	);
}
