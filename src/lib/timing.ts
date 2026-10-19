import type { Plant, Region } from './data/schema';
import { t } from './i18n/hr';
import type { SeasonInfo } from './season';

/** Short timing line for tiles and rows: "do kraja studenog", "samo uz pokrov", "od veljače". */
export function timingText(season: SeasonInfo, frostNear: boolean): string {
	if (season.status === 'now' || season.status === 'late') {
		if (season.needsCover && frostNear) return t.timing.withCover;
		return t.timing.until(season.end!.getMonth() + 1);
	}
	return season.nextMonth ? t.timing.from(season.nextMonth) : t.timing.off;
}

/** Hero line on Danas: "Posadi do kraja studenog, berba od lipnja do srpnja. Jedna od najlakših…" */
export function heroReason(plant: Plant, region: Region, season: SeasonInfo): string {
	const parts: string[] = [];
	const harvest = plant.harvest[region]?.[0];
	const until = t.timing.untilSentence(season.end!.getMonth() + 1);
	const after = plant.perennial
		? t.timing.firstFruit(plant.perennial.yearsToFirstHarvest)
		: harvest && (plant.category === 'flower' ? t.timing.bloom(harvest.from, harvest.to) : t.timing.harvest(harvest.from, harvest.to));
	parts.push(after ? `${until}, ${after}.` : `${until}.`);
	if (plant.difficulty === 'easy') parts.push(t.today.easyLine);
	return parts.join(' ');
}

export type ChipKind = 'now' | 'late' | 'off';

export function chipKind(season: SeasonInfo): ChipKind {
	return season.status === 'now' || season.status === 'late' ? season.status : 'off';
}
