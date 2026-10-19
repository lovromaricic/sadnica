/**
 * Build-time data validation. Fails the build with a readable message when any
 * content file does not match its schema.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { explanationsSchema, plantSchema, rulesSchema } from '../src/lib/data/schema';

const root = join(import.meta.dirname, '..', 'data');
const errors: string[] = [];
let unreviewed = 0;

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
for (const name of readdirSync(plantDir).filter((f) => f.endsWith('.json'))) {
	const plant = check(join(plantDir, name), plantSchema) as z.infer<typeof plantSchema> | undefined;
	if (!plant) continue;
	if (`${plant.id}.json` !== name) errors.push(`${name}: id "${plant.id}" must match the file name`);
	if (ids.has(plant.id)) errors.push(`${name}: duplicate id "${plant.id}"`);
	ids.add(plant.id);
	for (const region of ['continental', 'adriatic'] as const) {
		if (!plant.sow[region]) errors.push(`${name}: missing sow windows for region "${region}"`);
		if (!plant.harvest[region]) errors.push(`${name}: missing harvest windows for region "${region}"`);
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
if (unreviewed) console.warn(`Note: ${unreviewed} content file(s) are marked "reviewed": false. Verify before publishing.`);
