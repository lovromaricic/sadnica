import type { Plant, Region, SowWindow } from './data/schema';
import { isHarvestMonth, isProtectedWindow, isSowMonth } from './season';

/** The next 12 months, starting with `startMonth` (1-12). */
export function monthsFrom(startMonth: number): number[] {
	return Array.from({ length: 12 }, (_, i) => ((startMonth - 1 + i) % 12) + 1);
}

/** Sowing in a month: not at all, outdoors, or only indoors or under fleece. */
export type SowKind = 'none' | 'open' | 'protected';

export interface StripMonth {
	month: number;
	sow: SowKind;
	harvest: boolean;
}

export { isProtectedWindow } from './season';

/**
 * January to December for one plant: how it is sown and whether it is harvested. A month in both an
 * open and a protected window counts as open.
 */
export function stripMonths(plant: Plant, region: Region): StripMonth[] {
	const windows = plant.sow[region] ?? [];
	return Array.from({ length: 12 }, (_, i) => {
		const month = i + 1;
		const hits = windows.filter((w) => isSowMonth([w], month));
		const sow: SowKind = !hits.length ? 'none' : hits.some((w) => !isProtectedWindow(w)) ? 'open' : 'protected';
		return { month, sow, harvest: isHarvestMonth(plant.harvest[region], month) };
	});
}

/** One row per plant: sowing (open or protected) and harvest months, in the given month order. */
export function calendarRows(plants: Plant[], region: Region, months: number[]) {
	return plants.map((plant) => {
		const strip = stripMonths(plant, region);
		return { plant, cells: months.map((month) => strip[month - 1]) };
	});
}
