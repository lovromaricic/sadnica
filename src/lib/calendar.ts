import type { Plant, Region } from './data/schema';
import { isHarvestMonth, isSowMonth } from './season';

export interface CalendarCell {
	month: number;
	sow: boolean;
	harvest: boolean;
}

/** The next 12 months, starting with `startMonth` (1-12). */
export function monthsFrom(startMonth: number): number[] {
	return Array.from({ length: 12 }, (_, i) => ((startMonth - 1 + i) % 12) + 1);
}

/** One row per plant: sowing and harvest months for the region, in the given month order. */
export function calendarRows(plants: Plant[], region: Region, months: number[]) {
	return plants.map((plant) => ({
		plant,
		cells: months.map(
			(month): CalendarCell => ({
				month,
				sow: isSowMonth(plant.sow[region], month),
				harvest: isHarvestMonth(plant.harvest[region], month)
			})
		)
	}));
}
