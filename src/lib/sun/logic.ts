import type { Plant } from '../data/schema';
import { pluralHours, t } from '../i18n/hr';

export type SunLevel = Plant['sun'];

/** Hours checked on the camera screen and shown in the hour bar. */
export const SUN_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16] as const;

const LEVEL_RANK: Record<SunLevel, number> = { shade: 0, partial: 1, full: 2 };

/** >= 6 sunny hours: Puno sunca, 3-5: Polusjena, < 3: Hlad. */
export function categoryFromHours(sunnyHours: number): SunLevel {
	if (sunnyHours >= 6) return 'full';
	if (sunnyHours >= 3) return 'partial';
	return 'shade';
}

/** The measured spot gives at least as much sun as the plant needs. */
export function isEnough(measured: SunLevel, required: SunLevel): boolean {
	return LEVEL_RANK[measured] >= LEVEL_RANK[required];
}

export interface Verdict {
	good: boolean;
	category: SunLevel;
	sunnyHours: number;
	title: string;
	text: string;
}

/** Sentence-level verdict for one plant, generated from its name forms. */
export function verdict(plant: Plant, sunnyHours: number): Verdict {
	const category = categoryFromHours(sunnyHours);
	const good = isEnough(category, plant.sun);
	const hours = pluralHours(sunnyHours);
	const { nom, acc, plural } = plant.forms;
	return good
		? { good, category, sunnyHours, title: t.sun.goodTitle(acc), text: t.sun.goodText(hours, nom, plural, t.sun.need[plant.sun]) }
		: { good, category, sunnyHours, title: t.sun.weakTitle(acc), text: t.sun.weakText(hours, nom) };
}

/**
 * Plants that suit the measured spot better: same sun need first, then plants that need
 * less sun. Easiest and highest-ranked first.
 */
export function betterPlants(all: Plant[], category: SunLevel, excludeId: string, limit = 3): Plant[] {
	const order = (p: Plant) => [p.sun === category ? 0 : 1, p.difficulty === 'easy' ? 0 : 1, p.rank ?? 100] as const;
	return all
		.filter((p) => p.id !== excludeId && isEnough(category, p.sun))
		.sort((a, b) => {
			const [x, y] = [order(a), order(b)];
			return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
		})
		.slice(0, limit);
}

export type ManualAnswer = 'full' | 'morning' | 'afternoon' | 'never';
export const MANUAL_ANSWERS: ManualAnswer[] = ['full', 'morning', 'afternoon', 'never'];

/** Sunny hours assumed for each manual answer, so the result screen can draw the same hour bar. */
export const MANUAL_HOURS: Record<ManualAnswer, number[]> = {
	full: [...SUN_HOURS],
	morning: [8, 9, 10, 11],
	afternoon: [13, 14, 15, 16],
	never: [12]
};
