import type { Plant } from './data/schema';

/** Lowercase, strip diacritics (č → c, đ → d), collapse spaces. */
export function normalize(text: string): string {
	return text
		.toLowerCase()
		.replace(/đ/g, 'd')
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

export function matchesQuery(plant: Plant, query: string): boolean {
	const q = normalize(query);
	if (!q) return true;
	return [plant.name, plant.latin ?? '', ...plant.aliases].some((t) => normalize(t).includes(q));
}
