import type { Plant, Region, Rules } from './data/schema';
import { t } from './i18n/hr';
import { getSeasonStatus, isInSeason } from './season';
import { STAGES, type Stage } from './storage';

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
