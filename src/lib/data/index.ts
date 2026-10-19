import type { Explanations, Plant, Rules } from './schema';
import explanationsJson from '#data/explanations.json';
import rulesJson from '#data/rules.json';

// Content is validated against the zod schemas at build time (`npm run validate`, part of
// `npm run build`), so the app trusts it here and zod stays out of the client bundle.
const plantFiles = import.meta.glob<Plant>('/data/plants/*.json', { eager: true, import: 'default' });

export const plants: Plant[] = Object.values(plantFiles).sort((a, b) => a.name.localeCompare(b.name, 'hr'));
export const plantsById = new Map(plants.map((p) => [p.id, p]));
export const explanations = explanationsJson as Explanations;
export const rules = rulesJson as Rules;
