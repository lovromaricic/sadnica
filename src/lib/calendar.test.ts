import { describe, expect, it } from 'vitest';
import { calendarRows, monthsFrom } from './calendar';
import { plantsById } from './data';

describe('garden calendar', () => {
	it('starts at the current month and wraps the year', () => {
		expect(monthsFrom(10)).toEqual([10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
		expect(monthsFrom(1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
	});

	it('marks sowing and harvest months per plant and region', () => {
		const [row] = calendarRows([plantsById.get('cesnjak')!], 'continental', monthsFrom(10));
		const sow = row.cells.filter((c) => c.sow).map((c) => c.month);
		const harvest = row.cells.filter((c) => c.harvest).map((c) => c.month);
		expect(sow).toEqual([10, 11]);
		expect(harvest).toEqual([6, 7]);
		// Lamb's lettuce is harvested across the new year.
		const [mat] = calendarRows([plantsById.get('matovilac')!], 'continental', monthsFrom(10));
		expect(mat.cells.filter((c) => c.harvest).map((c) => c.month)).toEqual([10, 11, 12, 1, 2, 3]);
	});
});
