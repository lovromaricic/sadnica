import type { HarvestWindow, Plant, Region, Rules, SowWindow } from './data/schema';
import type { Place } from './storage';

export type SeasonStatus = 'now' | 'late' | 'upcoming' | 'off';

export interface SeasonInfo {
	status: SeasonStatus;
	/** The window we are in, or the next one (for `upcoming` and `off`). */
	window?: SowWindow;
	/** First day of that window. */
	start?: Date;
	/** Last day of that window. */
	end?: Date;
	/** Days until the current window closes (only when inside one). */
	daysLeft?: number;
	/** The current window only works with frost cover. */
	needsCover: boolean;
	/** Month (1-12) when the next window opens, for `upcoming` and `off`. */
	nextMonth?: number;
}

type SeasonRules = Pick<Rules, 'lateDays' | 'upcomingMonths'>;

const DAY = 86_400_000;

/** Calendar day number, immune to time of day and DST. */
function dayNumber(date: Date): number {
	return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY);
}

export function daysBetween(from: Date, to: Date): number {
	return dayNumber(to) - dayNumber(from);
}

function lastDayOf(year: number, month: number): Date {
	return new Date(year, month, 0);
}

export function monthInWindow(month: number, w: { from: number; to: number }): boolean {
	return w.from <= w.to ? month >= w.from && month <= w.to : month >= w.from || month <= w.to;
}

/** Start and end dates of a window that contains `date`. */
function currentWindowDates(w: SowWindow, date: Date): { start: Date; end: Date } {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	if (w.from <= w.to) {
		return { start: new Date(year, w.from - 1, 1), end: lastDayOf(year, w.to) };
	}
	// Window wraps over the new year (e.g. Nov - Feb).
	return month >= w.from
		? { start: new Date(year, w.from - 1, 1), end: lastDayOf(year + 1, w.to) }
		: { start: new Date(year - 1, w.from - 1, 1), end: lastDayOf(year, w.to) };
}

/**
 * Where a plant stands in its sowing calendar on a given date.
 * Pure: depends only on its arguments.
 */
export function getSeasonStatus(
	plant: Plant,
	region: Region,
	date: Date,
	rules: SeasonRules
): SeasonInfo {
	const windows = plant.sow[region] ?? [];
	if (windows.length === 0) return { status: 'off', needsCover: false };

	const month = date.getMonth() + 1;
	const current = windows
		.filter((w) => monthInWindow(month, w))
		// Prefer a window that does not need cover.
		.sort((a, b) => Number(!!a.needsCover) - Number(!!b.needsCover))[0];

	if (current) {
		const { start, end } = currentWindowDates(current, date);
		const daysLeft = daysBetween(date, end);
		const needsCover = !!current.needsCover;
		const status = needsCover || daysLeft <= rules.lateDays ? 'late' : 'now';
		return { status, window: current, start, end, daysLeft, needsCover };
	}

	let next: SowWindow = windows[0];
	let monthsAway = 13;
	for (const w of windows) {
		const d = (w.from - month + 12) % 12;
		if (d < monthsAway) {
			monthsAway = d;
			next = w;
		}
	}
	const startYear = month + monthsAway > 12 ? date.getFullYear() + 1 : date.getFullYear();
	const start = new Date(startYear, next.from - 1, 1);
	const end = next.from <= next.to ? lastDayOf(startYear, next.to) : lastDayOf(startYear + 1, next.to);
	return {
		status: monthsAway <= rules.upcomingMonths ? 'upcoming' : 'off',
		window: next,
		start,
		end,
		needsCover: !!next.needsCover,
		nextMonth: next.from
	};
}

export function isInSeason(info: SeasonInfo): boolean {
	return info.status === 'now' || info.status === 'late';
}

/** Is the given month a harvest month? */
export function isHarvestMonth(windows: HarvestWindow[] | undefined, month: number): boolean {
	return (windows ?? []).some((w) => monthInWindow(month, w));
}

/** Is the given month a sowing month? */
/** A window that only works indoors (sown on a windowsill) or under fleece. */
export function isProtectedWindow(w: SowWindow): boolean {
	return !!w.needsCover || /zatvoren/i.test(w.note ?? '');
}

export function isSowMonth(windows: SowWindow[] | undefined, month: number): boolean {
	return (windows ?? []).some((w) => monthInWindow(month, w));
}

/** Whether the typical first frost is near (from `frostAlertDays` before it until it has passed). */
export function isFrostNear(region: Region, date: Date, rules: Rules): boolean {
	const frost = rules.frost[region];
	if (!frost) return false;
	const year = date.getFullYear();
	// Check the frost period that started last year and the one starting this year (Dec - Jan wrap).
	for (const y of [year - 1, year]) {
		const from = new Date(y, frost.from.month - 1, frost.from.day);
		const toYear = frost.to.month < frost.from.month ? y + 1 : y;
		const to = new Date(toYear, frost.to.month - 1, frost.to.day);
		const days = daysBetween(from, date);
		if (days >= -rules.frostAlertDays && daysBetween(date, to) >= 0) return true;
	}
	return false;
}

const DIFFICULTY_ORDER = { easy: 0, medium: 1, hard: 2 } as const;

export interface PlantWithSeason {
	plant: Plant;
	season: SeasonInfo;
}

export function withSeason(plants: Plant[], region: Region, date: Date, rules: SeasonRules): PlantWithSeason[] {
	return plants.map((plant) => ({ plant, season: getSeasonStatus(plant, region, date, rules) }));
}

/** Known to grow well in a pot. Plants without `containers` data count as not suitable. */
export function potFriendly(plant: Plant): boolean {
	return plant.containers?.ok === true;
}

/**
 * Plants to plant now, best first: for balcony gardeners pot-friendly plants come first; then ones
 * that do not need cover, then easy before harder (the app is for beginners), then the ones whose
 * window closes soonest.
 */
export function recommend(items: PlantWithSeason[], place?: Place): PlantWithSeason[] {
	const pots = place === 'balcony';
	return items
		.filter((i) => isInSeason(i.season))
		.sort(
			(a, b) =>
				(pots ? Number(potFriendly(b.plant)) - Number(potFriendly(a.plant)) : 0) ||
				// Trees and bushes are a long project; quick crops come first in "this week" lists.
				Number(!!a.plant.perennial) - Number(!!b.plant.perennial) ||
				Number(a.season.needsCover) - Number(b.season.needsCover) ||
				// Plants in their prime come before ones you can only just still sow ("Još stigneš").
				Number(a.season.status === 'late') - Number(b.season.status === 'late') ||
				DIFFICULTY_ORDER[a.plant.difficulty] - DIFFICULTY_ORDER[b.plant.difficulty] ||
				(a.season.daysLeft ?? 0) - (b.season.daysLeft ?? 0) ||
				(a.plant.rank ?? 100) - (b.plant.rank ?? 100) ||
				a.plant.name.localeCompare(b.plant.name, 'hr')
		);
}

/** How many of the best quick crops take turns as the plant of the week (easy fruit bushes join them). */
export const HERO_ROTATION = 4;
/** A Monday, so the plant of the week changes on Mondays. */
const ROTATION_START = new Date(2024, 0, 1);

/** Raspberries, currants and the like: easy for a beginner and fruiting within a year or two. */
export function isEasyFruitBush(plant: Plant): boolean {
	const form = plant.planting && 'form' in plant.planting ? plant.planting.form : undefined;
	return plant.category === 'fruit' && plant.difficulty === 'easy' && (form === 'bush' || form === 'cane');
}

/**
 * The plant of the week, never one that does not suit a pot for balcony gardeners. With a date,
 * outdoor plants take turns week by week, so the pick does not sit on one plant for its whole season:
 * the best few quick crops plus the easy fruit bushes, those in their prime first, otherwise those in
 * their last weeks. Without any outdoor plant in season it is simply the first pick.
 */
export function heroPick(picks: PlantWithSeason[], place?: Place, date?: Date): PlantWithSeason | undefined {
	// Trees are a long project, not "this week's" pick for a beginner; easy fruit bushes are not.
	const eligible = picks.filter(
		(p) => (!p.plant.perennial || isEasyFruitBush(p.plant)) && (place !== 'balcony' || potFriendly(p.plant))
	);
	// Indoor sowing (tomatoes in February) is not what "this week we plant" promises.
	const outdoor = eligible.filter((p) => !(p.season.window && isProtectedWindow(p.season.window)));
	const rotation = (status: SeasonStatus) => {
		const now = outdoor.filter((p) => p.season.status === status);
		return [...now.filter((p) => !p.plant.perennial).slice(0, HERO_ROTATION), ...now.filter((p) => p.plant.perennial)];
	};
	const pool = rotation('now').length ? rotation('now') : rotation('late');
	if (!date || pool.length === 0) return eligible[0];
	const week = Math.floor(daysBetween(ROTATION_START, date) / 7);
	return pool[week % pool.length];
}

/** Plants whose next window opens soon, soonest first. */
export function upcoming(items: PlantWithSeason[]): PlantWithSeason[] {
	return items
		.filter((i) => i.season.status === 'upcoming')
		.sort(
			(a, b) =>
				a.season.start!.getTime() - b.season.start!.getTime() ||
				(a.plant.rank ?? 100) - (b.plant.rank ?? 100)
		);
}
