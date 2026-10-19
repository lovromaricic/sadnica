import { z } from 'zod';
import { explanationsSchema, plantSchema, rulesSchema, type Plant } from './schema';
import explanationsJson from '#data/explanations.json';
import rulesJson from '#data/rules.json';

const plantFiles = import.meta.glob<unknown>('/data/plants/*.json', { eager: true, import: 'default' });

/** Parse every plant file; throws with the file name on the first invalid one. */
export function parsePlants(files: Record<string, unknown>): Plant[] {
	return Object.entries(files)
		.map(([file, json]) => {
			const result = plantSchema.safeParse(json);
			if (!result.success) {
				throw new Error(`Invalid plant data in ${file}:\n${z.prettifyError(result.error)}`);
			}
			const expectedId = file.split('/').pop()!.replace(/\.json$/, '');
			if (result.data.id !== expectedId) {
				throw new Error(`Plant id "${result.data.id}" does not match file name ${file}`);
			}
			return result.data;
		})
		.sort((a, b) => a.name.localeCompare(b.name, 'hr'));
}

export const plants: Plant[] = parsePlants(plantFiles);
export const plantsById = new Map(plants.map((p) => [p.id, p]));
export const explanations = explanationsSchema.parse(explanationsJson);
export const rules = rulesSchema.parse(rulesJson);
