import { describe, expect, it } from 'vitest';
import { cacheState, forecastUrl, frostOutlook, parseForecast, roundCoord } from './weather';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);
const sample = {
	daily: {
		time: ['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25'],
		temperature_2m_min: [-3, 6.1, 8.9, 1.5, -1.2, -2.5, 2.2]
	}
};

describe('forecast request', () => {
	it('asks only for daily minimums at town-level precision', () => {
		const url = new URL(forecastUrl(45.8132, 15.9775));
		expect(url.origin).toBe('https://api.open-meteo.com');
		expect(url.searchParams.get('latitude')).toBe('45.8');
		expect(url.searchParams.get('longitude')).toBe('16');
		expect(url.searchParams.get('daily')).toBe('temperature_2m_min');
		expect(roundCoord(43.5081)).toBe(43.5);
	});
});

describe('parseForecast', () => {
	it('reads days and minimums and rejects anything else', () => {
		expect(parseForecast(sample)?.[3]).toEqual({ day: '2026-10-22', min: 1.5 });
		expect(parseForecast({ daily: { time: ['2026-10-19'], temperature_2m_min: [null] } })).toBeNull();
		expect(parseForecast({ error: true })).toBeNull();
		expect(parseForecast(null)).toBeNull();
	});
});

describe('frostOutlook', () => {
	const days = parseForecast(sample)!;

	it('ignores this morning and reports the first frost night ahead', () => {
		// -3 °C on the 19th is today, already past; the first frost ahead is the 23rd.
		expect(frostOutlook(days, d(2026, 10, 19))).toEqual({ level: 'frost', day: d(2026, 10, 23), min: -1.2 });
	});

	it('reports a cold night when nothing freezes', () => {
		const mild = days.map((x) => ({ ...x, min: x.min < 0 ? 4 : x.min }));
		expect(frostOutlook(mild, d(2026, 10, 19))).toEqual({ level: 'cold', day: d(2026, 10, 22), min: 1.5 });
	});

	it('is calm when every night stays above 2 °C, or the forecast is old', () => {
		expect(frostOutlook(days.map((x) => ({ ...x, min: 5 })), d(2026, 10, 19)).level).toBe('none');
		expect(frostOutlook(days, d(2026, 11, 30)).level).toBe('none');
	});
});

describe('cacheState', () => {
	const cache = { lat: 45.8, lng: 16, fetchedAt: 1_000_000, days: [] };
	it('is fresh for three hours, usable for a day, and only for the same place', () => {
		expect(cacheState(cache, 45.81, 15.98, 1_000_000 + 60_000)).toBe('fresh');
		expect(cacheState(cache, 45.81, 15.98, 1_000_000 + 4 * 3600_000)).toBe('stale');
		expect(cacheState(cache, 45.81, 15.98, 1_000_000 + 25 * 3600_000)).toBe('none');
		expect(cacheState(cache, 43.51, 16.44, 1_000_000 + 60_000)).toBe('none');
		expect(cacheState(null, 45.8, 16, 0)).toBe('none');
	});
});
