import { STORAGE_KEY } from './config';
import { REGIONS } from './data/regions';
import type { Region } from './data/schema';

export type Place = 'garden' | 'balcony' | 'unsure';
export const PLACES: Place[] = ['garden', 'balcony', 'unsure'];

/** Answers saved before the question had three options. */
const OLD_PLACES: Record<string, Place> = { ground: 'garden', raised: 'garden', none: 'unsure' };

export type Stage = 'toPlant' | 'sown' | 'growing' | 'ready';
export const STAGES: Stage[] = ['toPlant', 'sown', 'growing', 'ready'];

export interface GardenItem {
	plantId: string;
	addedAt: string;
	stage: Stage;
	/** Indexes of checked steps on the plant page. */
	stepsDone: number[];
	/** Day each stage was reached, as local YYYY-MM-DD. The user can correct these. */
	stageDates: Partial<Record<Stage, string>>;
	/** Notes and harvests, oldest first. */
	log: LogEntry[];
}

export interface LogEntry {
	id: string;
	/** Local YYYY-MM-DD. */
	day: string;
	text: string;
	harvest: boolean;
}

export const LOG_TEXT_MAX = 500;

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface AppState {
	version: 1;
	onboarded: boolean;
	city: string;
	region: Region;
	/** The user picked the region by hand instead of from the city. */
	regionManual: boolean;
	place: Place;
	garden: GardenItem[];
	/** Done weekly tasks, keyed `${weekKey}:${taskId}`. */
	tasksDone: Record<string, true>;
}

export const DEFAULT_STATE: AppState = {
	version: 1,
	onboarded: false,
	city: 'Zagreb',
	region: 'continental',
	regionManual: false,
	place: 'garden',
	garden: [],
	tasksDone: {}
};

const oneOf = <T>(value: unknown, options: readonly T[], fallback: T): T =>
	options.includes(value as T) ? (value as T) : fallback;

/** Turn whatever is in storage into a valid state, dropping anything malformed. */
export function sanitize(raw: unknown): AppState {
	if (!raw || typeof raw !== 'object' || (raw as { version?: unknown }).version !== 1) {
		return structuredClone(DEFAULT_STATE);
	}
	const r = raw as Partial<AppState>;
	const garden = Array.isArray(r.garden)
		? r.garden
				.filter((g) => g && typeof g.plantId === 'string')
				.map((g) => ({
					plantId: g.plantId,
					addedAt: typeof g.addedAt === 'string' ? g.addedAt : new Date().toISOString(),
					stage: oneOf(g.stage, STAGES, 'toPlant'),
					stepsDone: Array.isArray(g.stepsDone) ? g.stepsDone.filter((n) => Number.isInteger(n)) : [],
					stageDates: sanitizeStageDates(g.stageDates, g.addedAt),
					log: sanitizeLog((g as { log?: unknown }).log)
				}))
		: [];
	return {
		version: 1,
		onboarded: r.onboarded === true,
		city: typeof r.city === 'string' && r.city.trim() ? r.city : DEFAULT_STATE.city,
		region: oneOf(r.region, REGIONS, DEFAULT_STATE.region),
		regionManual: r.regionManual === true,
		place: oneOf(OLD_PLACES[r.place as string] ?? r.place, PLACES, DEFAULT_STATE.place),
		garden,
		tasksDone: r.tasksDone && typeof r.tasksDone === 'object' ? { ...r.tasksDone } : {}
	};
}

/** Drop malformed entries, trim overly long text, keep date order. */
function sanitizeLog(raw: unknown): LogEntry[] {
	if (!Array.isArray(raw)) return [];
	return raw
		.filter((e) => e && typeof e.id === 'string' && typeof e.text === 'string' && typeof e.day === 'string' && DAY_RE.test(e.day))
		.map((e) => ({ id: e.id, day: e.day, text: e.text.trim().slice(0, LOG_TEXT_MAX), harvest: e.harvest === true }))
		.filter((e) => e.text)
		.sort((a, b) => a.day.localeCompare(b.day));
}

/** Keep only valid days for known stages. Older saves get their "added" day from addedAt. */
function sanitizeStageDates(raw: unknown, addedAt: unknown): GardenItem['stageDates'] {
	const out: GardenItem['stageDates'] = {};
	if (raw && typeof raw === 'object') {
		for (const stage of STAGES) {
			const day = (raw as Record<string, unknown>)[stage];
			if (typeof day === 'string' && DAY_RE.test(day)) out[stage] = day;
		}
	}
	if (!out.toPlant && typeof addedAt === 'string' && DAY_RE.test(addedAt.slice(0, 10))) out.toPlant = addedAt.slice(0, 10);
	return out;
}

export function loadState(): AppState {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return sanitize(raw ? JSON.parse(raw) : null);
	} catch {
		return structuredClone(DEFAULT_STATE);
	}
}

export function saveState(state: AppState): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {
		// Storage can be full or blocked (private mode). The app keeps working in memory.
	}
}
