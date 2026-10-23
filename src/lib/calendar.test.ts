import { describe, expect, it } from 'vitest';
import { calendarRows, isProtectedWindow, monthsFrom, stripMonths } from './calendar';
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

describe('stripMonths', () => {
	it('marks indoor sowing apart from planting out (tomato inland)', () => {
		const months = stripMonths(plantsById.get('rajcica')!, 'continental');
		expect(months.find((m) => m.month === 2)?.sow).toBe('protected');
		expect(months.find((m) => m.month === 3)?.sow).toBe('protected');
		expect(months.find((m) => m.month === 5)?.sow).toBe('open');
		expect(months.find((m) => m.month === 8)?.harvest).toBe(true);
		expect(months).toHaveLength(12);
	});

	it("marks the fleece-only months (lamb's lettuce inland)", () => {
		const months = stripMonths(plantsById.get('matovilac')!, 'continental');
		expect(months.find((m) => m.month === 10)?.sow).toBe('protected');
		expect(months.some((m) => m.sow === 'open')).toBe(true);
	});

	it('shows plain windows for most plants (garlic)', () => {
		const months = stripMonths(plantsById.get('cesnjak')!, 'continental');
		expect(months.some((m) => m.sow === 'protected')).toBe(false);
		expect(months.filter((m) => m.sow === 'open').map((m) => m.month)).toEqual([10, 11]);
	});

	it('treats "buy nursery plants" notes as normal windows', () => {
		expect(isProtectedWindow({ from: 4, to: 5, note: 'Sadnice iz rasadnika.' })).toBe(false);
		expect(isProtectedWindow({ from: 10, to: 10, needsCover: true })).toBe(true);
	});
});
