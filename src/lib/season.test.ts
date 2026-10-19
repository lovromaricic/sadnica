import { describe, expect, it } from 'vitest';
import type { Plant, Rules } from './data/schema';
import { getSeasonStatus, isFrostNear, recommend, upcoming, withSeason } from './season';
import { plants, plantsById, rules } from './data';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);
const P = (id: string) => plantsById.get(id)!;

/** Minimal plant with custom windows for edge cases. */
function fake(sow: Plant['sow']['continental']): Plant {
	return { ...P('cesnjak'), id: 'fake', sow: { continental: sow, adriatic: sow } };
}

describe('getSeasonStatus: October in Zagreb (design sample)', () => {
	const date = d(2026, 10, 19);
	const status = (id: string) => getSeasonStatus(P(id), 'continental', date, rules);

	it('garlic, shallot and broad bean are ideal now', () => {
		for (const id of ['cesnjak', 'luk-ljutika', 'bob']) expect(status(id).status).toBe('now');
	});

	it('lamb’s lettuce and spinach only with cover', () => {
		for (const id of ['matovilac', 'spinat']) {
			expect(status(id).status).toBe('late');
			expect(status(id).needsCover).toBe(true);
		}
	});

	it('tomato is upcoming in February, carrot and basil in March', () => {
		expect(status('rajcica')).toMatchObject({ status: 'upcoming', nextMonth: 2 });
		expect(status('rajcica').start).toEqual(d(2027, 2, 1));
		expect(status('mrkva')).toMatchObject({ status: 'upcoming', nextMonth: 3 });
		expect(status('bosiljak')).toMatchObject({ status: 'upcoming', nextMonth: 3 });
	});

	it('reports days left in the current window', () => {
		expect(status('cesnjak').daysLeft).toBe(42);
		expect(status('cesnjak').end).toEqual(d(2026, 11, 30));
	});
});

describe('getSeasonStatus: edges', () => {
	it('becomes "late" within lateDays of the window end', () => {
		expect(getSeasonStatus(P('cesnjak'), 'continental', d(2026, 11, 8), rules)).toMatchObject({
			status: 'now',
			daysLeft: 22
		});
		expect(getSeasonStatus(P('cesnjak'), 'continental', d(2026, 11, 9), rules)).toMatchObject({
			status: 'late',
			daysLeft: 21
		});
		expect(getSeasonStatus(P('cesnjak'), 'continental', d(2026, 11, 30), rules)).toMatchObject({
			status: 'late',
			daysLeft: 0
		});
	});

	it('first and last day of a window count as inside', () => {
		const p = fake([{ from: 3, to: 5 }]);
		expect(getSeasonStatus(p, 'continental', d(2026, 3, 1), rules).status).toBe('now');
		expect(getSeasonStatus(p, 'continental', d(2026, 5, 31), rules).status).toBe('late');
		expect(getSeasonStatus(p, 'continental', d(2026, 6, 1), rules).status).not.toMatch(/now|late/);
	});

	it('handles windows that wrap over the new year', () => {
		const p = fake([{ from: 11, to: 2 }]);
		const dec = getSeasonStatus(p, 'continental', d(2026, 12, 31), rules);
		expect(dec).toMatchObject({ status: 'now', end: d(2027, 2, 28) });
		const jan = getSeasonStatus(p, 'continental', d(2027, 1, 1), rules);
		expect(jan).toMatchObject({ status: 'now', start: d(2026, 11, 1), end: d(2027, 2, 28) });
		const feb = getSeasonStatus(p, 'continental', d(2028, 2, 15), rules);
		expect(feb).toMatchObject({ status: 'late', end: d(2028, 2, 29) });
	});

	it('finds the next window across the year boundary', () => {
		const info = getSeasonStatus(P('rajcica'), 'continental', d(2026, 12, 1), rules);
		expect(info).toMatchObject({ status: 'upcoming', nextMonth: 2, start: d(2027, 2, 1) });
	});

	it('is "off" when the next window is far away', () => {
		const info = getSeasonStatus(P('rajcica'), 'continental', d(2026, 7, 10), rules);
		expect(info).toMatchObject({ status: 'off', nextMonth: 2, start: d(2027, 2, 1) });
	});

	it('picks the nearest of several windows', () => {
		// Spinach: Mar-Apr, Aug-Sep, Oct. In June the next one is August.
		const info = getSeasonStatus(P('spinat'), 'continental', d(2026, 6, 10), rules);
		expect(info).toMatchObject({ status: 'upcoming', nextMonth: 8 });
	});

	it('prefers a window without cover when two overlap', () => {
		const p = fake([
			{ from: 9, to: 11, needsCover: true },
			{ from: 9, to: 10 }
		]);
		expect(getSeasonStatus(p, 'continental', d(2026, 9, 5), rules)).toMatchObject({ status: 'now', needsCover: false });
	});

	it('is "off" with no windows for the region', () => {
		const p = { ...P('cesnjak'), sow: { continental: [], adriatic: [] } };
		expect(getSeasonStatus(p, 'continental', d(2026, 10, 19), rules).status).toBe('off');
	});

	it('uses the region’s own windows', () => {
		// Garlic on the coast can go in until the end of December.
		expect(getSeasonStatus(P('cesnjak'), 'adriatic', d(2026, 12, 5), rules).status).toBe('now');
		expect(getSeasonStatus(P('cesnjak'), 'continental', d(2026, 12, 5), rules).status).not.toBe('now');
	});
});

describe('isFrostNear', () => {
	it('continental: from three weeks before late October until it has passed', () => {
		expect(isFrostNear('continental', d(2026, 9, 28), rules)).toBe(false);
		expect(isFrostNear('continental', d(2026, 9, 29), rules)).toBe(true);
		expect(isFrostNear('continental', d(2026, 10, 19), rules)).toBe(true);
		expect(isFrostNear('continental', d(2026, 11, 10), rules)).toBe(true);
		expect(isFrostNear('continental', d(2026, 11, 11), rules)).toBe(false);
		expect(isFrostNear('continental', d(2026, 6, 1), rules)).toBe(false);
	});

	it('adriatic: a frost period that wraps into January', () => {
		expect(isFrostNear('adriatic', d(2026, 10, 19), rules)).toBe(false);
		expect(isFrostNear('adriatic', d(2026, 11, 15), rules)).toBe(true);
		expect(isFrostNear('adriatic', d(2027, 1, 10), rules)).toBe(true);
		expect(isFrostNear('adriatic', d(2027, 1, 16), rules)).toBe(false);
	});

	it('respects a custom alert distance', () => {
		const r: Rules = { ...rules, frostAlertDays: 3 };
		expect(isFrostNear('continental', d(2026, 10, 16), r)).toBe(false);
		expect(isFrostNear('continental', d(2026, 10, 17), r)).toBe(true);
	});
});

describe('recommend', () => {
	const items = withSeason(plants, 'continental', d(2026, 10, 19), rules);

	it('puts garlic first and cover-only plants last for beginners', () => {
		const ids = recommend(items, 'never').map((i) => i.plant.id);
		expect(ids[0]).toBe('cesnjak');
		expect(ids.slice(0, 3).sort()).toEqual(['bob', 'cesnjak', 'luk-ljutika']);
		expect(ids.slice(-2).sort()).toEqual(['matovilac', 'spinat']);
		expect(ids).not.toContain('rajcica');
	});

	it('lists upcoming plants soonest first', () => {
		const ids = upcoming(items).map((i) => i.plant.id);
		expect(ids[0]).toBe('rajcica');
		expect(ids).toEqual(expect.arrayContaining(['mrkva', 'bosiljak']));
	});
});
