import type { Plant, Region, Rules } from './data/schema';
import { formatDay, t } from './i18n/hr';
import { getSeasonStatus, isHarvestMonth, isInSeason } from './season';
import { STAGES, type GardenItem, type Stage } from './storage';

/** Progress bar fill per stage, in percent. */
export const STAGE_PROGRESS: Record<Stage, number> = { toPlant: 8, sown: 35, growing: 68, ready: 100 };

export const nextStage = (stage: Stage): Stage | undefined => STAGES[STAGES.indexOf(stage) + 1];
export const previousStage = (stage: Stage): Stage | undefined => STAGES[STAGES.indexOf(stage) - 1];

/** The "Sljedeće: …" line for a plant in the garden. */
export function nextStepText(stage: Stage, plant: Plant, region: Region, date: Date, rules: Rules): string {
	switch (stage) {
		case 'toPlant': {
			const season = getSeasonStatus(plant, region, date, rules);
			return isInSeason(season)
				? t.garden.next.toPlantNow(season.end!.getMonth() + 1)
				: t.garden.next.toPlantLater(season.nextMonth ?? 0);
		}
		case 'sown':
			return t.garden.next.sown;
		case 'growing':
			return t.garden.next.growing(plant.harvest[region]?.[0]?.from);
		case 'ready':
			return t.garden.next.ready;
	}
}

/** Local calendar day as YYYY-MM-DD. */
export function isoDay(date: Date): string {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function parseDay(day: string): Date {
	const [y, m, d] = day.split('-').map(Number);
	return new Date(y, m - 1, d);
}

/**
 * Stage dates after moving to `stage` on `day`: moving forward stamps the new stage,
 * moving back forgets the dates of the stages that were undone.
 */
export function datesForStage(item: Pick<GardenItem, 'stage' | 'stageDates'>, stage: Stage, day: string) {
	const target = STAGES.indexOf(stage);
	const dates: GardenItem['stageDates'] = {};
	for (const s of STAGES.slice(0, target)) if (item.stageDates[s]) dates[s] = item.stageDates[s];
	dates[stage] = target > STAGES.indexOf(item.stage) || !item.stageDates[stage] ? day : item.stageDates[stage];
	return dates;
}

/**
 * Approximate harvest: the first harvest month after the month it was sown, counting up to a
 * year ahead. Null when the plant has no harvest window in the region.
 */
export function harvestEstimate(plant: Plant, region: Region, sown: Date): { month: number; year: number } | null {
	const start = sown.getMonth() + 1;
	for (let ahead = 1; ahead <= 12; ahead++) {
		const month = ((start - 1 + ahead) % 12) + 1;
		if (isHarvestMonth(plant.harvest[region], month)) {
			return { month, year: sown.getFullYear() + (start + ahead > 12 ? 1 : 0) };
		}
	}
	return null;
}

/** "Posijano 19. listopada" for the current stage, if its day is known. */
export function stageDateText(item: GardenItem, today: Date): string | null {
	const day = item.stageDates[item.stage];
	return day ? t.garden.stageDate[item.stage](formatDay(parseDay(day), today.getFullYear())) : null;
}

/** "Berba oko lipnja" once something is in the ground and not yet ready. */
export function harvestText(item: GardenItem, plant: Plant, region: Region, today: Date): string | null {
	if (item.stage !== 'sown' && item.stage !== 'growing') return null;
	const sownDay = item.stageDates.sown ?? item.stageDates.growing;
	if (!sownDay) return null;
	const estimate = harvestEstimate(plant, region, parseDay(sownDay));
	return estimate ? t.garden.harvestAround(estimate.month, estimate.year > today.getFullYear()) : null;
}
