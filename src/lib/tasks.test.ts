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
	stageDates: {},
	log: []
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

	it('cleans up the notes log', () => {
		const s = sanitize({
			version: 1,
			garden: [{
				plantId: 'bob',
				log: [
					{ id: 'b', day: '2026-10-09', text: '  zalijevano  ', harvest: 'yes' },
					{ id: 'a', day: '2026-10-01', text: 'posijano', harvest: true },
					{ id: 'c', day: 'jučer', text: 'loš datum' },
					{ id: 'd', day: '2026-10-02', text: '   ' },
					{ day: '2026-10-03', text: 'bez id-a' },
					{ id: 'e', day: '2026-10-04', text: 'x'.repeat(900) }
				]
			}]
		});
		const log = s.garden[0].log;
		expect(log.map((e) => e.id)).toEqual(['a', 'e', 'b']);
		expect(log[2]).toEqual({ id: 'b', day: '2026-10-09', text: 'zalijevano', harvest: false });
		expect(log[1].text).toHaveLength(500);
		expect(sanitize({ version: 1, garden: [{ plantId: 'bob' }] }).garden[0].log).toEqual([]);
	});

	it('carries old place answers over to the three current ones', () => {
		expect(sanitize({ version: 1, place: 'ground' }).place).toBe('garden');
		expect(sanitize({ version: 1, place: 'raised' }).place).toBe('garden');
		expect(sanitize({ version: 1, place: 'none' }).place).toBe('unsure');
		expect(sanitize({ version: 1, place: 'balcony' }).place).toBe('balcony');
		expect(sanitize({ version: 1, place: 'moon' }).place).toBe('garden');
	});
});
