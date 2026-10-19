import { describe, expect, it } from 'vitest';
import { plantsById, rules } from './data';
import { buildIcs } from './ics';
import { sanitize } from './storage';
import { generateTasks, weekKey } from './tasks';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);
const item = (plantId: string, stage: 'toPlant' | 'sown' | 'growing' | 'ready') => ({
	plantId,
	stage,
	addedAt: '',
	stepsDone: [],
	stageDates: {}
});

describe('generateTasks', () => {
	it('suggests planting in season and covering before frost', () => {
		const tasks = generateTasks(
			[item('cesnjak', 'toPlant'), item('matovilac', 'growing'), item('rajcica', 'toPlant')],
			plantsById,
			'continental',
			d(2026, 10, 19),
			rules
		);
		expect(tasks.map((t) => t.text)).toEqual([
			'Posadi češnjak',
			'Uberi matovilac',
			'Prekrij matovilac agrilom, prije prvog mraza'
		]);
	});
});

describe('generateTasks: ticked planting task', () => {
	it('stays listed after the plant is marked as sown', () => {
		const args = [[item('cesnjak', 'sown')], plantsById, 'continental', d(2026, 10, 19), rules] as const;
		expect(generateTasks(...args).map((t) => t.id)).not.toContain('plant:cesnjak');
		expect(generateTasks(...args, new Set(['plant:cesnjak'])).map((t) => t.id)).toContain('plant:cesnjak');
	});
});

describe('weekKey', () => {
	it('uses ISO weeks, including the year boundary', () => {
		expect(weekKey(d(2026, 10, 19))).toBe('2026-W43');
		expect(weekKey(d(2027, 1, 1))).toBe('2026-W53');
	});
});

describe('buildIcs', () => {
	it('covers the rest of the current window', () => {
		const ics = buildIcs(plantsById.get('cesnjak')!, 'continental', d(2026, 10, 19), rules)!;
		expect(ics).toContain('DTSTART;VALUE=DATE:20261019');
		expect(ics).toContain('DTEND;VALUE=DATE:20261201');
		expect(ics).toContain('SUMMARY:Vrijeme za sadnju: Češnjak');
	});

	it('uses the next window when out of season', () => {
		const ics = buildIcs(plantsById.get('rajcica')!, 'continental', d(2026, 10, 19), rules)!;
		expect(ics).toContain('DTSTART;VALUE=DATE:20270201');
		expect(ics).toContain('DTEND;VALUE=DATE:20270401');
	});
});

describe('sanitize', () => {
	it('falls back to defaults for garbage and drops bad entries', () => {
		expect(sanitize(null).onboarded).toBe(false);
		expect(sanitize({ version: 99 }).city).toBe('Zagreb');
		const s = sanitize({ version: 1, region: 'mars', garden: [{ plantId: 'bob', stage: 'x' }, { nope: 1 }] });
		expect(s.region).toBe('continental');
		expect(s.garden).toEqual([expect.objectContaining({ plantId: 'bob', stage: 'toPlant', stepsDone: [] })]);
	});
});
