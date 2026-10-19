/**
 * Frost from a real forecast (Open-Meteo, free, no key). Only the town's approximate coordinates
 * are sent; the result is cached on the device and the typical frost dates remain the fallback.
 */
import { daysBetween } from './season';

export interface ForecastDay {
	/** Local YYYY-MM-DD. */
	day: string;
	/** Lowest temperature, °C (usually early morning). */
	min: number;
}

export interface Forecast {
	lat: number;
	lng: number;
	fetchedAt: number;
	days: ForecastDay[];
}

/** At or below this the forecast counts as frost. */
export const FROST_C = 0;
/** At or below this (but above freezing) a ground frost is possible. */
export const COLD_C = 2;

/** Town-level precision is plenty for a forecast, and keeps the request vague. */
export const roundCoord = (n: number) => Math.round(n * 10) / 10;

export function forecastUrl(lat: number, lng: number): string {
	const params = new URLSearchParams({
		latitude: String(roundCoord(lat)),
		longitude: String(roundCoord(lng)),
		daily: 'temperature_2m_min',
		timezone: 'auto',
		forecast_days: '7'
	});
	return `https://api.open-meteo.com/v1/forecast?${params}`;
}

export function parseForecast(json: unknown): ForecastDay[] | null {
	const daily = (json as { daily?: { time?: unknown; temperature_2m_min?: unknown } })?.daily;
	if (!daily || !Array.isArray(daily.time) || !Array.isArray(daily.temperature_2m_min)) return null;
	const mins = daily.temperature_2m_min as unknown[];
	const days = (daily.time as unknown[])
		.map((day, i) => ({ day, min: mins[i] }))
		.filter((d): d is ForecastDay => typeof d.day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.day) && typeof d.min === 'number');
	return days.length ? days : null;
}

export type FrostLevel = 'frost' | 'cold' | 'none';

export interface FrostOutlook {
	level: FrostLevel;
	/** The coldest qualifying night. */
	day?: Date;
	min?: number;
}

const toDate = (day: string) => {
	const [y, m, d] = day.split('-').map(Number);
	return new Date(y, m - 1, d);
};

/**
 * The coming nights (tomorrow up to 6 days ahead; this morning is already past): frost if any
 * night is at or below 0 °C, otherwise "cold" if one is at or below 2 °C.
 */
export function frostOutlook(days: ForecastDay[], today: Date): FrostOutlook {
	const coming = days
		.map((d) => ({ ...d, date: toDate(d.day) }))
		.filter((d) => {
			const ahead = daysBetween(today, d.date);
			return ahead >= 1 && ahead <= 6;
		});
	const pick = (limit: number) => {
		const hits = coming.filter((d) => d.min <= limit);
		if (!hits.length) return undefined;
		// The first such night matters most for covering plants in time.
		return hits[0];
	};
	const frost = pick(FROST_C);
	if (frost) return { level: 'frost', day: frost.date, min: frost.min };
	const cold = pick(COLD_C);
	if (cold) return { level: 'cold', day: cold.date, min: cold.min };
	return { level: 'none' };
}

/** A cached forecast is usable for the same place for up to a day; refreshed after three hours. */
export const MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const REFRESH_MS = 3 * 60 * 60 * 1000;

export function cacheState(cache: Forecast | null, lat: number, lng: number, now: number): 'fresh' | 'stale' | 'none' {
	if (!cache || cache.lat !== roundCoord(lat) || cache.lng !== roundCoord(lng)) return 'none';
	const age = now - cache.fetchedAt;
	if (age < 0 || age > MAX_AGE_MS) return 'none';
	return age < REFRESH_MS ? 'fresh' : 'stale';
}
