/**
 * Garden advice from the forecast, besides frost (see frostOutlook), most important first. Thresholds are deliberately cautious, round numbers; the wording stays modest
 * because a forecast can be wrong.
 */
import type { Place } from './storage';
import { daysBetween } from './season';
import { toDate, type ForecastDay } from './weather';

export type AdviceKind = 'wind' | 'heat' | 'rain' | 'dry' | 'coldSoil' | 'plantingDay';

export interface Advice {
	kind: AdviceKind;
	/** The day it is about. */
	day: Date;
	/** The number worth quoting: km/h, °C or mm. */
	value: number;
}

/** Gusts at or above this, km/h, can break tall plants and tip over pots. */
export const WIND_KMH = 60;
/** A day this hot or hotter, °C. */
export const HEAT_C = 30;
/** Rain worth skipping the watering for, mm in a day. */
export const RAIN_MM = 5;
/** Below this the soil is too cold for beans, cucumbers and squash, °C. */
export const WARM_SOIL_C = 10;

interface Options {
	place: Place;
}

/** The single most important piece of advice, or null on an ordinary week. */
export function gardenAdvice(days: ForecastDay[], today: Date, options: Options): Advice | null {
	return allAdvice(days, today, options)[0] ?? null;
}

/** Every piece of advice that applies, in priority order. */
export function allAdvice(days: ForecastDay[], today: Date, { place }: Options): Advice[] {
	const out: Advice[] = [];
	const ahead = days
		.map((d) => ({ ...d, date: toDate(d.day), offset: daysBetween(today, toDate(d.day)) }))
		.filter((d) => d.offset >= 0 && d.offset <= 6);
	const within = (n: number) => ahead.filter((d) => d.offset <= n);
	const month = today.getMonth() + 1;

	// Strong wind in the next three days.
	const windy = within(2).find((d) => (d.gusts ?? 0) >= WIND_KMH);
	if (windy) out.push({ kind: 'wind', day: windy.date, value: windy.gusts! });

	// Heat in the next three days.
	const hot = within(2).find((d) => (d.max ?? -Infinity) >= HEAT_C);
	if (hot) out.push({ kind: 'heat', day: hot.date, value: hot.max! });

	// Proper rain today or tomorrow: no need to water beds.
	const wet = within(1).find((d) => (d.rain ?? 0) >= RAIN_MM && (d.rainChance ?? 100) >= 60);
	if (wet) out.push({ kind: 'rain', day: wet.date, value: wet.rain! });

	// Five warm days without rain: water. In cool weather the soil stays moist, so not then.
	const next5 = within(4);
	if (next5.length === 5 && next5.every((d) => d.rain !== undefined && d.max !== undefined)) {
		const total = next5.reduce((sum, d) => sum + d.rain!, 0);
		const warm = next5.reduce((sum, d) => sum + d.max!, 0) / 5;
		if (total < 2 && warm >= 20) out.push({ kind: 'dry', day: next5[0].date, value: Math.round(warm) });
	}

	// Spring: soil still cold for warm-season sowing.
	if (month >= 3 && month <= 5) {
		const soil = within(2).filter((d) => d.soil !== undefined);
		if (soil.length) {
			const mean = soil.reduce((sum, d) => sum + d.soil!, 0) / soil.length;
			if (mean < WARM_SOIL_C) out.push({ kind: 'coldSoil', day: soil[0].date, value: mean });
		}
	}

	// A mild, overcast, calm and dry day helps seedlings settle in. Only in the planting season,
	// not for balcony pots (planted indoors or in the shade anyway), and not in a week of storms or heat.
	const rough = out.some((a) => a.kind === 'wind' || a.kind === 'heat');
	if (month >= 3 && month <= 10 && place !== 'balcony' && !rough) {
		const good = within(3).find(
			(d) =>
				(d.cloud ?? 0) >= 60 &&
				(d.rain ?? Infinity) < 1 &&
				(d.max ?? 0) >= 12 &&
				(d.max ?? 99) <= 25 &&
				(d.gusts ?? Infinity) < 40
		);
		if (good) out.push({ kind: 'plantingDay', day: good.date, value: good.max! });
	}
	return out;
}
