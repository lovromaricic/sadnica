import { STORAGE_KEY } from './config';
import { REGIONS, type Region } from './data/schema';
import type { Experience } from './season';

export type Place = 'ground' | 'raised' | 'balcony' | 'none';
export const PLACES: Place[] = ['ground', 'raised', 'balcony', 'none'];
export const EXPERIENCES: Experience[] = ['never', 'little', 'basics'];

export type Stage = 'toPlant' | 'sown' | 'growing' | 'ready';
export const STAGES: Stage[] = ['toPlant', 'sown', 'growing', 'ready'];

export interface GardenItem {
	plantId: string;
	addedAt: string;
	stage: Stage;
	/** Indexes of checked steps on the plant page. */
	stepsDone: number[];
}

export interface AppState {
	version: 1;
	onboarded: boolean;
	city: string;
	region: Region;
	/** The user picked the region by hand instead of from the city. */
	regionManual: boolean;
	place: Place;
	experience: Experience;
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
	place: 'ground',
	experience: 'never',
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
					stepsDone: Array.isArray(g.stepsDone) ? g.stepsDone.filter((n) => Number.isInteger(n)) : []
				}))
		: [];
	return {
		version: 1,
		onboarded: r.onboarded === true,
		city: typeof r.city === 'string' && r.city.trim() ? r.city : DEFAULT_STATE.city,
		region: oneOf(r.region, REGIONS, DEFAULT_STATE.region),
		regionManual: r.regionManual === true,
		place: oneOf(r.place, PLACES, DEFAULT_STATE.place),
		experience: oneOf(r.experience, EXPERIENCES, DEFAULT_STATE.experience),
		garden,
		tasksDone: r.tasksDone && typeof r.tasksDone === 'object' ? { ...r.tasksDone } : {}
	};
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
