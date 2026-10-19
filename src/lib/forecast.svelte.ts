import type { Region, Rules } from './data/schema';
import { isFrostNear } from './season';
import { cacheState, forecastUrl, frostOutlook, parseForecast, roundCoord, type Forecast, type FrostOutlook } from './weather';

const KEY = 'sadnica:prognoza';

function readCache(): Forecast | null {
	try {
		return JSON.parse(localStorage.getItem(KEY) ?? 'null');
	} catch {
		return null;
	}
}

function writeCache(f: Forecast) {
	try {
		localStorage.setItem(KEY, JSON.stringify(f));
	} catch {
		// Storage full or blocked: the forecast just is not kept.
	}
}

class ForecastStore {
	/** Forecast in use (live or cached), or null when there is none for this place. */
	data = $state<Forecast | null>(null);
	private inFlight = '';

	/** Make sure a forecast for these coordinates is loaded; cheap to call often. */
	async ensure(lat: number, lng: number, enabled: boolean) {
		if (!enabled) {
			this.data = null;
			return;
		}
		const cache = readCache();
		const state = cacheState(cache, lat, lng, Date.now());
		this.data = state === 'none' ? null : cache;
		if (state === 'fresh' || !navigator.onLine) return;

		const key = `${roundCoord(lat)},${roundCoord(lng)}`;
		if (this.inFlight === key) return;
		this.inFlight = key;
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), 8000);
		try {
			const res = await fetch(forecastUrl(lat, lng), { signal: controller.signal });
			const days = res.ok ? parseForecast(await res.json()) : null;
			if (days) {
				const fresh = { lat: roundCoord(lat), lng: roundCoord(lng), fetchedAt: Date.now(), days };
				writeCache(fresh);
				this.data = fresh;
			}
		} catch {
			// Offline or the service is down: keep whatever cache we had, else typical dates apply.
		} finally {
			clearTimeout(timer);
			this.inFlight = '';
		}
	}

	outlook(today: Date): FrostOutlook | null {
		return this.data ? frostOutlook(this.data.days, today) : null;
	}
}

export const forecast = new ForecastStore();

/** Frost worth acting on: forecast frost in the coming nights, or the typical frost period. */
export function frostSoon(region: Region, date: Date, rules: Rules): boolean {
	return forecast.outlook(date)?.level === 'frost' || isFrostNear(region, date, rules);
}
