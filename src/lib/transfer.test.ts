import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, type AppState, type GardenItem } from './storage';
import {
	applyImport,
	backupFileContent,
	decodePayload,
	encodePayload,
	mergeGardens,
	parseBackupFile,
	payloadFromHash,
	payloadFromState,
	transferLink
} from './transfer';

const known = new Set(['cesnjak', 'bob', 'rajcica', 'mrkva']);
const item = (plantId: string, stage: GardenItem['stage'], extra: Partial<GardenItem> = {}): GardenItem => ({
	plantId,
	addedAt: '2026-10-01T08:00:00.000Z',
	stage,
	stepsDone: [],
	stageDates: { toPlant: '2026-10-01' },
	...extra
});
const state = (over: Partial<AppState> = {}): AppState => ({ ...structuredClone(DEFAULT_STATE), onboarded: true, ...over });

describe('link round trip', () => {
	it('packs and unpacks a garden, compressed', async () => {
		const s = state({
			city: 'Split',
			region: 'adriatic',
			place: 'balcony',
			garden: [item('cesnjak', 'sown', { stepsDone: [0, 2], stageDates: { toPlant: '2026-10-01', sown: '2026-10-05' } })]
		});
		const text = await encodePayload(payloadFromState(s));
		expect(text.startsWith('z')).toBe(true);
		expect(text).toMatch(/^[zj][A-Za-z0-9_-]+$/);
		expect(await decodePayload(text, known)).toEqual(payloadFromState(s));
	});

	it('stays short enough for a QR code with a full garden', async () => {
		const garden = [...known].map((id) => item(id, 'growing', { stageDates: { toPlant: '2026-10-01', sown: '2026-10-05', growing: '2026-11-01' } }));
		const link = await transferLink('https://sadnica.hr', '/uvoz', payloadFromState(state({ garden })));
		expect(link.length).toBeLessThan(800);
		expect(payloadFromHash(new URL(link).hash)).not.toBeNull();
	});

	it('rejects broken links and drops unknown plants', async () => {
		expect(await decodePayload('zNOT-REAL', known)).toBeNull();
		expect(await decodePayload('x123', known)).toBeNull();
		const text = await encodePayload(payloadFromState(state({ garden: [item('cesnjak', 'toPlant'), item('banana', 'ready')] })));
		expect((await decodePayload(text, known))?.garden.map((g) => g.plantId)).toEqual(['cesnjak']);
	});

	it('reads only well-formed hashes', () => {
		expect(payloadFromHash('#g=zAbC_-1')).toBe('zAbC_-1');
		expect(payloadFromHash('#g=')).toBeNull();
		expect(payloadFromHash('#other')).toBeNull();
	});
});

describe('mergeGardens', () => {
	it('keeps the plant that is further along and adds new ones at the end', () => {
		const merged = mergeGardens(
			[item('cesnjak', 'growing'), item('bob', 'toPlant')],
			[item('cesnjak', 'sown'), item('bob', 'sown'), item('mrkva', 'toPlant')]
		);
		expect(merged.map((g) => `${g.plantId}:${g.stage}`)).toEqual(['cesnjak:growing', 'bob:sown', 'mrkva:toPlant']);
	});
});

describe('applyImport', () => {
	const incoming = payloadFromState(state({ city: 'Split', region: 'adriatic', place: 'balcony', garden: [item('bob', 'sown')] }));

	it('merge keeps this device answers when it is set up', () => {
		const after = applyImport(state({ garden: [item('cesnjak', 'toPlant')] }), incoming, 'merge');
		expect(after.city).toBe('Zagreb');
		expect(after.garden.map((g) => g.plantId)).toEqual(['cesnjak', 'bob']);
	});

	it('a fresh device takes the incoming answers and skips onboarding', () => {
		const after = applyImport(state({ onboarded: false }), incoming, 'merge');
		expect(after).toMatchObject({ onboarded: true, city: 'Split', region: 'adriatic', place: 'balcony' });
	});

	it('replace takes everything from the import', () => {
		const after = applyImport(state({ garden: [item('cesnjak', 'ready')], tasksDone: { 'x:y': true } }), incoming, 'replace');
		expect(after).toMatchObject({ city: 'Split', place: 'balcony', tasksDone: {} });
		expect(after.garden.map((g) => g.plantId)).toEqual(['bob']);
	});
});

describe('backup file', () => {
	it('round trips and refuses other files', () => {
		const payload = payloadFromState(state({ garden: [item('rajcica', 'sown')] }));
		const text = backupFileContent(payload, new Date('2026-10-19T10:00:00Z'));
		expect(JSON.parse(text)).toMatchObject({ app: 'sadnica', exportedAt: '2026-10-19T10:00:00.000Z' });
		expect(parseBackupFile(text, known)).toEqual(payload);
		expect(parseBackupFile('{"garden": []}', known)).toBeNull();
		expect(parseBackupFile('not json', known)).toBeNull();
	});
});
