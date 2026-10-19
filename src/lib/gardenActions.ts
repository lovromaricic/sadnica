import { resolve } from '$app/paths';
import { gardenNeighbours, listNames } from './companions';
import { plantsById } from './data';
import type { Plant } from './data/schema';
import { t } from './i18n/hr';
import { store } from './store.svelte';
import { toast } from './toast.svelte';

/** Plants currently in the garden. */
export function gardenPlants(): Plant[] {
	return store.state.garden.map((g) => plantsById.get(g.plantId)).filter((p): p is Plant => !!p);
}

/** Add a plant and confirm it, warning when a bad neighbour is already in the garden. */
export function addToGarden(plant: Plant) {
	store.addPlant(plant.id);
	const { bad } = gardenNeighbours(plant, gardenPlants());
	const message = bad.length ? t.toast.addedWithWarning(plant.name, listNames(bad)) : t.toast.added(plant.name);
	toast.show(message, { href: resolve('/moj-vrt'), label: t.toast.open });
}
