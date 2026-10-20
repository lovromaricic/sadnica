/**
 * Garden weather from a real forecast (Open-Meteo, free, no key): frost, wind, heat, rain, soil
 * temperature. Only the town's approximate coordinates are sent; the result is cached on the device
 * and the typical frost dates remain the fallback.
 */
import { daysBetween } from './season';

export interface ForecastDay {
	/** Local YYYY-MM-DD. */
	day: string;
	/** Lowest temperature, °C (usually early morning). */
	min: number;
	/** Highest temperature, °C. The fields below may be missing in an older cached forecast. */
	max?: number;
	/** Rain (all precipitation), mm. */
	rain?: number;
	/** Highest chance of rain during the day, %. */
	rainChance?: number;
	/** Strongest wind gust, km/h. */
	gusts?: number;
	/** Average cloud cover, %. */
	cloud?: number;
	/** Average soil temperature at 6 cm, °C. */
	soil?: number;
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
		daily: 'temperature_2m_min,temperature_2m_max,precipitation_sum,precipitation_probability_max,wind_gusts_10m_max,cloud_cover_mean',
		hourly: 'soil_temperature_6cm',
		timezone: 'auto',
		forecast_days: '7'
	});
	return `https://api.open-meteo.com/v1/forecast?${params}`;
}

type Daily = Record<string, unknown[] | undefined> & { time?: unknown[] };

/** Days with at least a date and a minimum temperature; the other values are kept when present. */
export function parseForecast(json: unknown): ForecastDay[] | null {
	const data = json as { daily?: Daily; hourly?: { time?: unknown[]; soil_temperature_6cm?: unknown[] } };
	const daily = data?.daily;
	if (!daily || !Array.isArray(daily.time) || !Array.isArray(daily.temperature_2m_min)) return null;
	const num = (key: string, i: number) => {
		const v = daily[key]?.[i];
		return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
	};
	const soil = dailySoil(data.hourly);
	const days: ForecastDay[] = [];
	daily.time.forEach((day, i) => {
		const min = num('temperature_2m_min', i);
		if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day) || min === undefined) return;
		const entry: ForecastDay = { day, min };
		const fields: [keyof ForecastDay, string][] = [
			['max', 'temperature_2m_max'],
			['rain', 'precipitation_sum'],
			['rainChance', 'precipitation_probability_max'],
			['gusts', 'wind_gusts_10m_max'],
			['cloud', 'cloud_cover_mean']
		];
		for (const [field, key] of fields) {
			const v = num(key, i);
			if (v !== undefined) (entry as unknown as Record<string, number>)[field] = v;
		}
		if (soil.has(day)) entry.soil = soil.get(day);
		days.push(entry);
	});
	return days.length ? days : null;
}

/** Average of the hourly soil temperatures per day. */
function dailySoil(hourly: { time?: unknown[]; soil_temperature_6cm?: unknown[] } | undefined): Map<string, number> {
	const sums = new Map<string, { total: number; count: number }>();
	if (!hourly || !Array.isArray(hourly.time) || !Array.isArray(hourly.soil_temperature_6cm)) return new Map();
	hourly.time.forEach((t, i) => {
		const v = hourly.soil_temperature_6cm![i];
		if (typeof t !== 'string' || typeof v !== 'number') return;
		const day = t.slice(0, 10);
		const s = sums.get(day) ?? { total: 0, count: 0 };
		sums.set(day, { total: s.total + v, count: s.count + 1 });
	});
	return new Map([...sums].map(([day, s]) => [day, s.total / s.count]));
}

export type FrostLevel = 'frost' | 'cold' | 'none';

export interface FrostOutlook {
	level: FrostLevel;
	/** The coldest qualifying night. */
	day?: Date;
	min?: number;
}

export const toDate = (day: string) => {
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
