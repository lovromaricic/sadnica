import type { Region } from './data/schema';
import { normalize } from './search';

interface City {
	name: string;
	region: Region;
	/** Locative ("u Zagrebu"). */
	locative: string;
	/** Accusative ("za Rijeku") when it differs from the name; masculine and plural names do not change. */
	accusative?: string;
	/** Approximate coordinates, for the sun path when location access is not given. */
	lat: number;
	lng: number;
}

/** Small hand-made lookup. Anything unknown falls back to continental. */
const CITIES: City[] = [
	{ name: 'Zagreb', region: 'continental', locative: 'Zagrebu', lat: 45.81, lng: 15.98 },
	{ name: 'Osijek', region: 'continental', locative: 'Osijeku', lat: 45.55, lng: 18.69 },
	{ name: 'Varaždin', region: 'continental', locative: 'Varaždinu', lat: 46.3, lng: 16.34 },
	{ name: 'Karlovac', region: 'continental', locative: 'Karlovcu', lat: 45.49, lng: 15.55 },
	{ name: 'Slavonski Brod', region: 'continental', locative: 'Slavonskom Brodu', lat: 45.16, lng: 18.02 },
	{ name: 'Sisak', region: 'continental', locative: 'Sisku', lat: 45.47, lng: 16.37 },
	{ name: 'Velika Gorica', region: 'continental', locative: 'Velikoj Gorici', lat: 45.71, lng: 16.08, accusative: 'Veliku Goricu' },
	{ name: 'Samobor', region: 'continental', locative: 'Samoboru', lat: 45.8, lng: 15.71 },
	{ name: 'Čakovec', region: 'continental', locative: 'Čakovcu', lat: 46.38, lng: 16.43 },
	{ name: 'Koprivnica', region: 'continental', locative: 'Koprivnici', lat: 46.16, lng: 16.83, accusative: 'Koprivnicu' },
	{ name: 'Bjelovar', region: 'continental', locative: 'Bjelovaru', lat: 45.9, lng: 16.84 },
	{ name: 'Vukovar', region: 'continental', locative: 'Vukovaru', lat: 45.35, lng: 19.0 },
	{ name: 'Vinkovci', region: 'continental', locative: 'Vinkovcima', lat: 45.29, lng: 18.8 },
	{ name: 'Požega', region: 'continental', locative: 'Požegi', lat: 45.34, lng: 17.69, accusative: 'Požegu' },
	{ name: 'Virovitica', region: 'continental', locative: 'Virovitici', lat: 45.83, lng: 17.38, accusative: 'Viroviticu' },
	{ name: 'Krapina', region: 'continental', locative: 'Krapini', lat: 46.16, lng: 15.88, accusative: 'Krapinu' },
	{ name: 'Gospić', region: 'continental', locative: 'Gospiću', lat: 44.55, lng: 15.37 },
	{ name: 'Split', region: 'adriatic', locative: 'Splitu', lat: 43.51, lng: 16.44 },
	{ name: 'Rijeka', region: 'adriatic', locative: 'Rijeci', lat: 45.33, lng: 14.44, accusative: 'Rijeku' },
	{ name: 'Zadar', region: 'adriatic', locative: 'Zadru', lat: 44.12, lng: 15.23 },
	{ name: 'Pula', region: 'adriatic', locative: 'Puli', lat: 44.87, lng: 13.85, accusative: 'Pulu' },
	{ name: 'Dubrovnik', region: 'adriatic', locative: 'Dubrovniku', lat: 42.65, lng: 18.09 },
	{ name: 'Šibenik', region: 'adriatic', locative: 'Šibeniku', lat: 43.74, lng: 15.9 },
	{ name: 'Opatija', region: 'adriatic', locative: 'Opatiji', lat: 45.34, lng: 14.31, accusative: 'Opatiju' },
	{ name: 'Makarska', region: 'adriatic', locative: 'Makarskoj', lat: 43.3, lng: 17.02, accusative: 'Makarsku' },
	{ name: 'Poreč', region: 'adriatic', locative: 'Poreču', lat: 45.23, lng: 13.59 },
	{ name: 'Rovinj', region: 'adriatic', locative: 'Rovinju', lat: 45.08, lng: 13.64 },
	{ name: 'Umag', region: 'adriatic', locative: 'Umagu', lat: 45.43, lng: 13.52 },
	{ name: 'Trogir', region: 'adriatic', locative: 'Trogiru', lat: 43.52, lng: 16.25 },
	{ name: 'Kaštela', region: 'adriatic', locative: 'Kaštelima', lat: 43.55, lng: 16.38 },
	{ name: 'Solin', region: 'adriatic', locative: 'Solinu', lat: 43.54, lng: 16.49 },
	{ name: 'Omiš', region: 'adriatic', locative: 'Omišu', lat: 43.44, lng: 16.69 },
	{ name: 'Crikvenica', region: 'adriatic', locative: 'Crikvenici', lat: 45.18, lng: 14.69, accusative: 'Crikvenicu' },
	{ name: 'Krk', region: 'adriatic', locative: 'Krku', lat: 45.03, lng: 14.58 },
	{ name: 'Hvar', region: 'adriatic', locative: 'Hvaru', lat: 43.17, lng: 16.44 },
	{ name: 'Korčula', region: 'adriatic', locative: 'Korčuli', lat: 42.96, lng: 17.14, accusative: 'Korčulu' },
	{ name: 'Biograd na Moru', region: 'adriatic', locative: 'Biogradu na Moru', lat: 43.94, lng: 15.45 },
	{ name: 'Vodice', region: 'adriatic', locative: 'Vodicama', lat: 43.76, lng: 15.78 },
	{ name: 'Ploče', region: 'adriatic', locative: 'Pločama', lat: 43.05, lng: 17.43 },
	{ name: 'Metković', region: 'adriatic', locative: 'Metkoviću', lat: 43.05, lng: 17.65 }
];

export const CITY_NAMES = CITIES.map((c) => c.name);

export function findCity(input: string): City | undefined {
	const key = normalize(input);
	return key ? CITIES.find((c) => normalize(c.name) === key) : undefined;
}

export function regionForCity(input: string): Region {
	return findCity(input)?.region ?? 'continental';
}

const REGION_FALLBACK: Record<Region, { lat: number; lng: number }> = {
	continental: { lat: 45.81, lng: 15.98 },
	adriatic: { lat: 43.51, lng: 16.44 }
};

/** Coordinates for a city name, falling back to Zagreb or Split by region. */
export function coordsForCity(input: string, region: Region): { lat: number; lng: number } {
	const city = findCity(input);
	return city ? { lat: city.lat, lng: city.lng } : REGION_FALLBACK[region];
}

/** Distance between two points on Earth in km (haversine). */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
	const rad = Math.PI / 180;
	const dLat = (b.lat - a.lat) * rad;
	const dLng = (b.lng - a.lng) * rad;
	const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
	return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** The known city closest to a position, and how far it is. */
export function nearestCity(pos: { lat: number; lng: number }): { city: City; km: number } {
	let best = { city: CITIES[0], km: Infinity };
	for (const city of CITIES) {
		const km = distanceKm(pos, city);
		if (km < best.km) best = { city, km };
	}
	return best;
}
