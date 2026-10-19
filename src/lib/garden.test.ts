import { describe, expect, it } from 'vitest';
import { plantsById } from './data';
import { datesForStage, harvestEstimate, harvestText, isoDay, parseDay, stageDateText } from './garden';
import { formatDay } from './i18n/hr';
import { sanitize, type GardenItem } from './storage';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);
const P = (id: string) => plantsById.get(id)!;
const item = (stage: GardenItem['stage'], stageDates: GardenItem['stageDates']): GardenItem => ({
	plantId: 'cesnjak',
	addedAt: '',
	stage,
	stepsDone: [],
	stageDates
});

describe('days', () => {
	it('round-trips local days and formats them in Croatian', () => {
		expect(isoDay(d(2026, 10, 9))).toBe('2026-10-09');
		expect(parseDay('2026-10-09')).toEqual(d(2026, 10, 9));
		expect(formatDay(d(2026, 10, 19), 2026)).toBe('19. listopada');
		expect(formatDay(d(2025, 11, 2), 2026)).toBe('2. studenog 2025.');
	});
});

describe('datesForStage', () => {
	it('stamps a stage when moving forward', () => {
		expect(datesForStage(item('toPlant', { toPlant: '2026-10-01' }), 'sown', '2026-10-19')).toEqual({
			toPlant: '2026-10-01',
			sown: '2026-10-19'
		});
	});

	it('forgets undone stages when moving back and keeps the earlier date', () => {
		const growing = item('growing', { toPlant: '2026-10-01', sown: '2026-10-05', growing: '2026-11-01' });
		expect(datesForStage(growing, 'sown', '2026-11-20')).toEqual({ toPlant: '2026-10-01', sown: '2026-10-05' });
	});
});

describe('harvestEstimate', () => {
	it('picks the first harvest month after sowing, across the new year', () => {
		expect(harvestEstimate(P('cesnjak'), 'continental', d(2026, 10, 19))).toEqual({ month: 6, year: 2027 });
		expect(harvestEstimate(P('spinat'), 'continental', d(2026, 8, 20))).toEqual({ month: 10, year: 2026 });
		// Lamb's lettuce is harvested all winter: sown in October, first leaves in November.
		expect(harvestEstimate(P('matovilac'), 'continental', d(2026, 10, 10))).toEqual({ month: 11, year: 2026 });
		expect(harvestEstimate(P('mrkva'), 'continental', d(2027, 3, 15))).toEqual({ month: 6, year: 2027 });
	});
});

describe('date text', () => {
	const today = d(2026, 10, 25);

	it('describes the current stage and the expected harvest', () => {
		const sown = { ...item('sown', { toPlant: '2026-10-01', sown: '2026-10-19' }) };
		expect(stageDateText(sown, today)).toBe('Posijano 19. listopada');
		expect(harvestText(sown, P('cesnjak'), 'continental', today)).toBe('Berba oko lipnja iduće godine');
		expect(stageDateText(item('toPlant', { toPlant: '2026-10-01' }), today)).toBe('Dodano 1. listopada');
	});

	it('shows no harvest before sowing or once ready', () => {
		expect(harvestText(item('toPlant', { toPlant: '2026-10-01' }), P('cesnjak'), 'continental', today)).toBeNull();
		expect(harvestText(item('ready', { sown: '2026-10-01', ready: '2027-06-10' }), P('cesnjak'), 'continental', today)).toBeNull();
	});
});

describe('sanitize stageDates', () => {
	it('keeps valid days and fills the added day for older saves', () => {
		const s = sanitize({
			version: 1,
			garden: [
				{ plantId: 'bob', stage: 'sown', addedAt: '2026-10-02T09:00:00.000Z', stageDates: { sown: '2026-10-05', ready: 'nope' } },
				{ plantId: 'cesnjak', stage: 'toPlant', addedAt: '2026-10-03T09:00:00.000Z' }
			]
		});
		expect(s.garden[0].stageDates).toEqual({ toPlant: '2026-10-02', sown: '2026-10-05' });
		expect(s.garden[1].stageDates).toEqual({ toPlant: '2026-10-03' });
	});
});
