import type { Plant } from './data/schema';
import { normalize } from './search';

/** Does a neighbour name from the data ("Luk ljutika") refer to this plant? */
function refersTo(name: string, plant: Plant): boolean {
	const key = normalize(name);
	return normalize(plant.name) === key || plant.aliases.some((a) => normalize(a) === key);
}

/** Bad neighbours count both ways: either plant listing the other is enough. */
export function areBadNeighbours(a: Plant, b: Plant): boolean {
	return a.neighbours.bad.some((n) => refersTo(n, b)) || b.neighbours.bad.some((n) => refersTo(n, a));
}

export function areGoodNeighbours(a: Plant, b: Plant): boolean {
	if (areBadNeighbours(a, b)) return false;
	return a.neighbours.good.some((n) => refersTo(n, b)) || b.neighbours.good.some((n) => refersTo(n, a));
}

/** Plants already in the garden that do not get on with `plant` (and good ones to put near it). */
export function gardenNeighbours(plant: Plant, garden: Plant[]): { bad: Plant[]; good: Plant[] } {
	const others = garden.filter((p) => p.id !== plant.id);
	return {
		bad: others.filter((p) => areBadNeighbours(plant, p)),
		good: others.filter((p) => areGoodNeighbours(plant, p))
	};
}

/** Which plant in the garden a neighbour name refers to, if any. */
export function gardenPlantNamed(name: string, garden: Plant[]): Plant | undefined {
	return garden.find((p) => refersTo(name, p));
}

/** "Bob", "Bob i Grašak", "Bob, Grah i Grašak" */
export function listNames(plants: Plant[]): string {
	const names = plants.map((p) => p.name);
	return names.length <= 1 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} i ${names.at(-1)}`;
}
