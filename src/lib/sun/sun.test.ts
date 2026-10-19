import { describe, expect, it } from 'vitest';
import { plants, plantsById } from '../data';
import type { Plant } from '../data/schema';
import { pluralHours } from '../i18n/hr';
import { angleDiff, cameraPitch, compassHeading, hourDirections, project, smoothAngle, sunDirection } from './arc';
import { MANUAL_HOURS, betterPlants, categoryFromHours, isEnough, verdict } from './logic';

const P = (id: string) => plantsById.get(id)!;
/** A plural-named plant, like the strawberries in the design. */
const jagode: Plant = {
	...P('cesnjak'),
	id: 'jagode',
	name: 'Jagode',
	forms: { nom: 'jagode', gen: 'jagoda', acc: 'jagode', plural: true },
	sun: 'full'
};

describe('categoryFromHours', () => {
	it('maps sunny hours to sun levels at the 3 and 6 hour edges', () => {
		expect([0, 1, 2, 3, 4, 5, 6, 7, 9].map(categoryFromHours)).toEqual([
			'shade', 'shade', 'shade', 'partial', 'partial', 'partial', 'full', 'full', 'full'
		]);
	});
});

describe('isEnough', () => {
	it('accepts equal or more sun than required', () => {
		expect(isEnough('full', 'full')).toBe(true);
		expect(isEnough('full', 'shade')).toBe(true);
		expect(isEnough('partial', 'partial')).toBe(true);
		expect(isEnough('partial', 'full')).toBe(false);
		expect(isEnough('shade', 'partial')).toBe(false);
	});
});

describe('verdict', () => {
	it('builds the design copy for a plural plant', () => {
		expect(verdict(jagode, 6)).toMatchObject({
			good: true,
			category: 'full',
			title: 'Za jagode je ovo dobro mjesto',
			text: 'Imaš oko 6 sati sunca, a jagode vole puno sunca.'
		});
		expect(verdict(jagode, 3)).toMatchObject({
			good: false,
			category: 'partial',
			title: 'Ovdje je malo sunca za jagode',
			text: 'Imaš oko 3 sata sunca. Jagode će ovdje rasti slabije i roditi manje.'
		});
	});

	it('uses accusative and singular agreement from the plant data', () => {
		expect(verdict(P('rajcica'), 7).title).toBe('Za rajčicu je ovo dobro mjesto');
		expect(verdict(P('rajcica'), 7).text).toBe('Imaš oko 7 sati sunca, a rajčica voli puno sunca.');
		expect(verdict(P('spinat'), 4).text).toBe('Imaš oko 4 sata sunca, a špinat voli polusjenu.');
		expect(verdict(P('mrkva'), 1)).toMatchObject({ good: false, title: 'Ovdje je malo sunca za mrkvu' });
		expect(verdict(P('mrkva'), 1).text).toBe('Imaš oko 1 sat sunca. Mrkva će ovdje rasti slabije i roditi manje.');
	});

	it('manual answers give the expected category', () => {
		expect(categoryFromHours(MANUAL_HOURS.full.length)).toBe('full');
		expect(categoryFromHours(MANUAL_HOURS.morning.length)).toBe('partial');
		expect(categoryFromHours(MANUAL_HOURS.afternoon.length)).toBe('partial');
		expect(categoryFromHours(MANUAL_HOURS.never.length)).toBe('shade');
	});
});

describe('betterPlants', () => {
	it('suggests plants that fit the measured sun, never the checked plant', () => {
		const partial = betterPlants(plants, 'partial', 'rajcica');
		expect(partial).toHaveLength(3);
		// Exact matches for the measured sun come first, easy ones before harder.
		expect(partial.every((p) => p.sun === 'partial' && p.difficulty === 'easy')).toBe(true);
		expect(betterPlants(plants, 'full', 'cesnjak')).toHaveLength(3);
		expect(betterPlants(plants, 'full', 'cesnjak').map((p) => p.id)).not.toContain('cesnjak');
		expect(betterPlants(plants, 'shade', 'rajcica')).toEqual([]);
	});
});

describe('pluralHours', () => {
	it('uses Croatian plural forms', () => {
		expect([0, 1, 2, 4, 5, 11, 21, 22].map(pluralHours)).toEqual([
			'0 sati', '1 sat', '2 sata', '4 sata', '5 sati', '11 sati', '21 sat', '22 sata'
		]);
	});
});

describe('sun path', () => {
	// Zagreb on the June solstice: solar noon around 13:04 CEST, altitude about 67.6°.
	const zagreb = { lat: 45.81, lng: 15.98 };

	it('puts the noon sun in the south, high in summer', () => {
		const noon = sunDirection(new Date('2026-06-21T11:04:00Z'), zagreb.lat, zagreb.lng);
		expect(noon.bearing).toBeGreaterThan(175);
		expect(noon.bearing).toBeLessThan(185);
		expect(noon.altitude).toBeCloseTo(67.6, 0);
	});

	it('moves east to west through the day', () => {
		const dirs = hourDirections(new Date(2026, 9, 19), zagreb.lat, zagreb.lng, [8, 12, 16]);
		expect(dirs[0].bearing).toBeLessThan(dirs[1].bearing);
		expect(dirs[1].bearing).toBeLessThan(dirs[2].bearing);
		expect(dirs.every((d) => d.altitude > 0)).toBe(true);
	});
});

describe('camera math', () => {
	it('wraps angles', () => {
		expect(angleDiff(10, 350)).toBe(20);
		expect(angleDiff(350, 10)).toBe(-20);
		expect(smoothAngle(350, 10, 0.5)).toBeCloseTo(0);
	});

	it('pitch is 0 upright and positive when tilted to the sky', () => {
		expect(cameraPitch(90, 0)).toBeCloseTo(0);
		expect(cameraPitch(120, 0)).toBeCloseTo(30);
		expect(cameraPitch(60, 0)).toBeCloseTo(-30);
	});

	it('heading follows alpha for an upright phone', () => {
		expect(compassHeading(0, 90, 0)).toBeCloseTo(0);
		expect(compassHeading(270, 90, 0)).toBeCloseTo(90);
		expect(compassHeading(90, 90, 0)).toBeCloseTo(270);
	});

	it('projects the point the camera looks at to the centre', () => {
		const p = project({ bearing: 180, altitude: 30 }, 180, 30, 390, 844);
		expect(p).toMatchObject({ visible: true, ahead: true });
		expect(p.x).toBeCloseTo(195);
		expect(p.y).toBeCloseTo(422);
	});

	it('puts points clockwise of the view to the right, higher points up, and hides points behind', () => {
		const right = project({ bearing: 190, altitude: 30 }, 180, 30, 390, 844);
		const higher = project({ bearing: 180, altitude: 40 }, 180, 30, 390, 844);
		expect(right.x).toBeGreaterThan(195);
		expect(higher.y).toBeLessThan(422);
		expect(project({ bearing: 0, altitude: 30 }, 180, 30, 390, 844).ahead).toBe(false);
	});
});
