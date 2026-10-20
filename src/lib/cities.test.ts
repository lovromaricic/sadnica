import { describe, expect, it } from 'vitest';
import { distanceKm, nearestCity } from './cities';

describe('nearestCity', () => {
	it('measures distance on the globe', () => {
		// Zagreb to Split is about 260 km in a straight line.
		expect(distanceKm({ lat: 45.81, lng: 15.98 }, { lat: 43.51, lng: 16.44 })).toBeGreaterThan(250);
		expect(distanceKm({ lat: 45.81, lng: 15.98 }, { lat: 43.51, lng: 16.44 })).toBeLessThan(270);
		expect(distanceKm({ lat: 45, lng: 15 }, { lat: 45, lng: 15 })).toBe(0);
	});

	it('finds the closest known city and its region', () => {
		// Sesvete, on the east side of Zagreb.
		const sesvete = nearestCity({ lat: 45.83, lng: 16.11 });
		expect(sesvete.city.name).toBe('Zagreb');
		expect(sesvete.km).toBeLessThan(15);
		// Seget, just west of Trogir.
		const seget = nearestCity({ lat: 43.52, lng: 16.23 });
		expect(seget.city.name).toBe('Trogir');
		expect(seget.city.region).toBe('adriatic');
	});

	it('still answers far from every city, with the distance', () => {
		const far = nearestCity({ lat: 42.4, lng: 16.6 }); // open sea south of Korčula
		expect(far.km).toBeGreaterThan(20);
		expect(far.city.region).toBe('adriatic');
	});
});
