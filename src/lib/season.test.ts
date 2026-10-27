import { describe, expect, it } from 'vitest';
import type { Plant, Rules } from './data/schema';
import { getSeasonStatus, HERO_ROTATION, heroPick, isFrostNear, recommend, upcoming, withSeason } from './season';
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

	it('garlic and shallot are ideal now; onion sets close at the end of October', () => {
		for (const id of ['cesnjak', 'luk-ljutika']) expect(status(id).status).toBe('now');
		expect(status('crveni-luk').status).toBe('late');
	});

	it('broad bean waits for February inland but is sown now on the coast', () => {
		expect(status('bob')).toMatchObject({ status: 'upcoming', nextMonth: 2 });
		expect(getSeasonStatus(P('bob'), 'adriatic', date, rules).status).toBe('now');
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

	it('puts garlic first and cover-only plants last among annuals', () => {
		const ids = recommend(items).map((i) => i.plant.id);
		expect(ids[0]).toBe('cesnjak');
		expect(ids.slice(0, 2).sort()).toEqual(['cesnjak', 'luk-ljutika']);
		const annuals = recommend(items).filter((i) => !i.plant.perennial).map((i) => i.plant.id);
		expect(annuals.slice(-2).sort()).toEqual(['matovilac', 'spinat']);
		expect(ids).not.toContain('rajcica');
	});

	it('puts trees and bushes after every annual plant', () => {
		const list = recommend(items);
		const perennial = list.map((i) => !!i.plant.perennial);
		expect(perennial.indexOf(true)).toBeGreaterThan(perennial.lastIndexOf(false));
		expect(list.slice(1, 5).some((i) => i.plant.perennial)).toBe(false);
	});

	it('puts plants in their prime before ones that only just still fit', () => {
		// Rocket's window ends this month ("Još stigneš"); garlic is in its prime until the end of November.
		const ids = recommend(items).map((i) => i.plant.id);
		expect(ids.indexOf('cesnjak')).toBeLessThan(ids.indexOf('rikola'));
		expect(getSeasonStatus(P('rikola'), 'continental', d(2026, 10, 19), rules).status).toBe('late');
	});

	it('puts easy plants before harder ones, even when those close sooner', () => {
		// May: basil (easy) is in season, carrot and tomato (medium) too, tomato closes soonest.
		const may = recommend(withSeason(plants, 'continental', d(2026, 5, 10), rules)).map((i) => i.plant.id);
		expect(may.indexOf('bosiljak')).toBeLessThan(may.indexOf('rajcica'));
		expect(may.indexOf('bosiljak')).toBeLessThan(may.indexOf('mrkva'));
	});

	it('lists upcoming plants soonest first', () => {
		const ids = upcoming(items).map((i) => i.plant.id);
		// Broad bean and tomato both start in February; broad bean ranks first for beginners.
		expect(ids.slice(0, 2)).toEqual(['bob', 'rajcica']);
		expect(ids).toEqual(expect.arrayContaining(['mrkva', 'bosiljak']));
	});
});

describe('recommend for balcony gardeners', () => {
	const items = withSeason(plants, 'continental', d(2026, 10, 19), rules);
	const ids = (place?: Parameters<typeof recommend>[1]) => recommend(items, place).map((i) => i.plant.id);

	it('puts pot-friendly plants first, even before cover-free ones', () => {
		const list = ids('balcony');
		const pots = list.map((id) => P(id).containers?.ok === true);
		// Every pot plant comes before every plant that does not suit a pot.
		expect(pots.indexOf(false)).toBeGreaterThan(pots.lastIndexOf(true));
		expect(list[0]).toBe('cesnjak');
		// An apple tree does not suit a pot, so it drops below the cover-only lamb's lettuce and spinach.
		expect(list.indexOf('jabuka')).toBeGreaterThan(list.indexOf('spinat'));
	});

	it('keeps the usual order for every other place', () => {
		for (const place of ['garden', 'unsure', undefined] as const) {
			expect(ids(place)).toEqual(ids());
		}
		expect(ids().indexOf('crveni-luk')).toBeLessThan(ids().indexOf('matovilac'));
	});

	it('treats plants without container data as not for pots', () => {
		const { containers: _, ...unknown } = { ...P('cesnjak'), id: 'unknown', rank: 0 };
		const mixed = withSeason([unknown, P('luk-ljutika')], 'continental', d(2026, 10, 19), rules);
		expect(recommend(mixed, 'balcony').map((i) => i.plant.id)).toEqual(['luk-ljutika', 'unknown']);
	});

	it('never makes a plant that does not suit a pot the hero', () => {
		// On the coast broad bean is sown in October.
		const onlyBob = withSeason([P('bob')], 'adriatic', d(2026, 10, 19), rules);
		expect(heroPick(recommend(onlyBob, 'balcony'), 'balcony')).toBeUndefined();
		expect(heroPick(recommend(onlyBob, 'garden'), 'garden')?.plant.id).toBe('bob');
		expect(heroPick(recommend(items, 'balcony'), 'balcony')?.plant.id).toBe('cesnjak');
		expect(heroPick([], 'balcony')).toBeUndefined();
	});
});

describe('heroPick: plant of the week', () => {
	const pick = (date: Date, region: 'continental' | 'adriatic' = 'continental') =>
		heroPick(recommend(withSeason(plants, region, date, rules)), undefined, date)?.plant.id;

	it('takes turns among the best plants in their prime, one per week', () => {
		const weeks = [d(2026, 10, 12), d(2026, 10, 19), d(2026, 10, 26), d(2026, 11, 2)].map((date) => pick(date));
		expect(new Set(weeks).size).toBeGreaterThan(1);
		for (const id of weeks) expect(P(id!).perennial).toBeUndefined();
		const prime = recommend(withSeason(plants, 'continental', d(2026, 10, 19), rules))
			.filter((p) => p.season.status === 'now')
			.slice(0, HERO_ROTATION)
			.map((p) => p.plant.id);
		expect(prime).toContain(pick(d(2026, 10, 19)));
	});

	it('keeps the same plant from Monday to Sunday', () => {
		const monday = pick(d(2026, 10, 26));
		for (let day = 27; day <= 31; day++) expect(pick(d(2026, 10, day))).toBe(monday);
		expect(pick(d(2026, 11, 1))).toBe(monday);
	});

	it('never picks indoor sowing, so February inland stays on broad bean', () => {
		for (const day of [2, 9, 16, 23]) expect(pick(d(2026, 2, day))).toBe('bob');
	});

	it('picks nothing when nothing can be planted', () => {
		expect(pick(d(2026, 12, 21))).toBeUndefined();
	});
});
