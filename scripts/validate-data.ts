/**
 * Build-time data validation. Fails the build with a readable message when any
 * content file does not match its schema.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { explanationsSchema, plantSchema, rulesSchema, type Plant } from '../src/lib/data/schema';
import { normalize } from '../src/lib/search';

const root = join(import.meta.dirname, '..', 'data');
const errors: string[] = [];
let unreviewed = 0;
const noContainers: string[] = [];

function check(file: string, schema: z.ZodType<{ reviewed: boolean }>) {
	let json: unknown;
	try {
		json = JSON.parse(readFileSync(file, 'utf8'));
	} catch (e) {
		errors.push(`${file}: not valid JSON (${(e as Error).message})`);
		return undefined;
	}
	const result = schema.safeParse(json);
	if (!result.success) {
		errors.push(`${file}:\n${z.prettifyError(result.error)}`);
		return undefined;
	}
	if (!result.data.reviewed) unreviewed++;
	return result.data;
}

const plantDir = join(root, 'plants');
const ids = new Set<string>();
const all: Plant[] = [];
for (const name of readdirSync(plantDir).filter((f) => f.endsWith('.json'))) {
	const plant = check(join(plantDir, name), plantSchema) as z.infer<typeof plantSchema> | undefined;
	if (!plant) continue;
	if (`${plant.id}.json` !== name) errors.push(`${name}: id "${plant.id}" must match the file name`);
	if (ids.has(plant.id)) errors.push(`${name}: duplicate id "${plant.id}"`);
	ids.add(plant.id);
	all.push(plant);
	if (!plant.containers) noContainers.push(plant.id);
	for (const region of ['continental', 'adriatic'] as const) {
		if (!plant.sow[region]) errors.push(`${name}: missing sow windows for region "${region}"`);
		if (!plant.harvest[region]) errors.push(`${name}: missing harvest windows for region "${region}"`);
	}
}
// Cross-file checks: mistakes that are easy to miss when plants are written one at a time.
const warnings: string[] = [];
/** Search words deliberately shared by two plants ("zelje" means cabbage inland, collard greens in Dalmatia). */
const SHARED_ALIASES = new Set(['zelje']);
const owners = new Map<string, Set<string>>();
for (const p of all) {
	for (const word of new Set([p.name, ...p.aliases].map(normalize))) {
		owners.set(word, (owners.get(word) ?? new Set()).add(p.id));
	}
}
for (const [word, plantIds] of owners) {
	if (plantIds.size > 1 && !SHARED_ALIASES.has(word)) warnings.push(`search word "${word}" belongs to ${[...plantIds].join(' and ')}`);
}
const refersTo = (name: string, p: Plant) => {
	const key = normalize(name);
	return normalize(p.name) === key || p.aliases.some((a) => normalize(a) === key);
};
for (const p of all) {
	for (const good of p.neighbours.good) {
		for (const q of all.filter((x) => refersTo(good, x))) {
			if (q.neighbours.bad.some((b) => refersTo(b, p))) {
				errors.push(`${p.id} lists ${q.id} as a good neighbour, but ${q.id} lists ${p.id} as a bad one`);
			}
		}
	}
	if (p.containers?.ok && p.perennial && p.perennial.yearsToFirstHarvest >= 3 && p.category === 'fruit' && !/citrus|olea/i.test(p.latin ?? '')) {
		warnings.push(`${p.id}: a fruit tree marked as a balcony pot plant; is that realistic for a beginner?`);
	}
}

check(join(root, 'explanations.json'), explanationsSchema);
check(join(root, 'rules.json'), rulesSchema);

if (errors.length) {
	console.error(`\nData validation failed (${errors.length} problem${errors.length > 1 ? 's' : ''}):\n`);
	for (const e of errors) console.error(`- ${e}\n`);
	process.exit(1);
}
console.log(`Data OK: ${ids.size} plants, explanations, rules.`);
for (const w of warnings) console.warn(`Check: ${w}`);
if (noContainers.length)
	console.warn(`Note: no "containers" for ${noContainers.join(', ')}. Balcony users will not see them as pot plants.`);
if (unreviewed) console.warn(`Note: ${unreviewed} content file(s) are marked "reviewed": false. Verify before publishing.`);
