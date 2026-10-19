import type { Plant, Region, Rules } from './data/schema';
import { t } from './i18n/hr';
import { getSeasonStatus, isFrostNear, isHarvestMonth, isInSeason } from './season';
import type { GardenItem } from './storage';

export interface Task {
	id: string;
	plantId: string;
	text: string;
}

/** ISO week key, e.g. "2026-W43". Task check marks reset every week. */
export function weekKey(date: Date): string {
	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	const day = d.getUTCDay() || 7;
	d.setUTCDate(d.getUTCDate() + 4 - day);
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
	return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export const accusative = (plant: Plant) => plant.forms.acc;

/** This week's to-dos, derived from the garden and the date. */
export function generateTasks(
	garden: readonly GardenItem[],
	plantsById: Map<string, Plant>,
	region: Region,
	date: Date,
	rules: Rules,
	/** Task ids already ticked this week; a ticked planting task stays listed after the plant moves on. */
	doneIds: ReadonlySet<string> = new Set(),
	/** Frost expected soon (forecast or typical dates); defaults to the typical dates alone. */
	frostNear: boolean = isFrostNear(region, date, rules)
): Task[] {
	const tasks: Task[] = [];
	const month = date.getMonth() + 1;

	for (const item of garden) {
		const plant = plantsById.get(item.plantId);
		if (!plant) continue;
		const acc = accusative(plant);
		const season = getSeasonStatus(plant, region, date, rules);
		const hasCoverWindow = (plant.sow[region] ?? []).some((w) => w.needsCover);

		const plantId = `plant:${plant.id}`;
		const plantText = season.needsCover ? t.garden.tasks.plantCover(acc) : t.garden.tasks.plant(acc);
		// A planting task ticked this week stays listed (with its wording) after the plant moves to "sown".
		const plantTaskShown =
			(item.stage === 'toPlant' && isInSeason(season)) || (item.stage === 'sown' && doneIds.has(plantId));
		if (plantTaskShown) tasks.push({ id: plantId, plantId: plant.id, text: plantText });
		if (item.stage === 'toPlant') continue;

		const harvests = plant.category !== 'flower';
		const harvestNow = item.stage === 'ready' || (item.stage === 'growing' && !plant.perennial && isHarvestMonth(plant.harvest[region], month));
		if (harvests && harvestNow) {
			tasks.push({ id: `harvest:${plant.id}`, plantId: plant.id, text: t.garden.tasks.harvest(acc) });
		}
		if (frostNear && hasCoverWindow && item.stage !== 'ready' && !(plantTaskShown && season.needsCover)) {
			tasks.push({ id: `cover:${plant.id}`, plantId: plant.id, text: t.garden.tasks.cover(acc) });
		}
		if (plant.water === 'high' && item.stage !== 'ready' && month >= 5 && month <= 9) {
			tasks.push({ id: `water:${plant.id}`, plantId: plant.id, text: t.garden.tasks.water(plant.name) });
		}
	}
	return tasks;
}
