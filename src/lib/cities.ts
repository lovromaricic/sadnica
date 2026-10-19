import type { Region } from './data/schema';
import { normalize } from './search';

interface City {
	name: string;
	region: Region;
	/** Locative ("u Zagrebu"), for headings like "Kada, u Zagrebu". */
	locative: string;
}

/** Small hand-made lookup. Anything unknown falls back to continental. */
const CITIES: City[] = [
	{ name: 'Zagreb', region: 'continental', locative: 'Zagrebu' },
	{ name: 'Osijek', region: 'continental', locative: 'Osijeku' },
	{ name: 'Varaždin', region: 'continental', locative: 'Varaždinu' },
	{ name: 'Karlovac', region: 'continental', locative: 'Karlovcu' },
	{ name: 'Slavonski Brod', region: 'continental', locative: 'Slavonskom Brodu' },
	{ name: 'Sisak', region: 'continental', locative: 'Sisku' },
	{ name: 'Velika Gorica', region: 'continental', locative: 'Velikoj Gorici' },
	{ name: 'Samobor', region: 'continental', locative: 'Samoboru' },
	{ name: 'Čakovec', region: 'continental', locative: 'Čakovcu' },
	{ name: 'Koprivnica', region: 'continental', locative: 'Koprivnici' },
	{ name: 'Bjelovar', region: 'continental', locative: 'Bjelovaru' },
	{ name: 'Vukovar', region: 'continental', locative: 'Vukovaru' },
	{ name: 'Vinkovci', region: 'continental', locative: 'Vinkovcima' },
	{ name: 'Požega', region: 'continental', locative: 'Požegi' },
	{ name: 'Virovitica', region: 'continental', locative: 'Virovitici' },
	{ name: 'Krapina', region: 'continental', locative: 'Krapini' },
	{ name: 'Gospić', region: 'continental', locative: 'Gospiću' },
	{ name: 'Split', region: 'adriatic', locative: 'Splitu' },
	{ name: 'Rijeka', region: 'adriatic', locative: 'Rijeci' },
	{ name: 'Zadar', region: 'adriatic', locative: 'Zadru' },
	{ name: 'Pula', region: 'adriatic', locative: 'Puli' },
	{ name: 'Dubrovnik', region: 'adriatic', locative: 'Dubrovniku' },
	{ name: 'Šibenik', region: 'adriatic', locative: 'Šibeniku' },
	{ name: 'Opatija', region: 'adriatic', locative: 'Opatiji' },
	{ name: 'Makarska', region: 'adriatic', locative: 'Makarskoj' },
	{ name: 'Poreč', region: 'adriatic', locative: 'Poreču' },
	{ name: 'Rovinj', region: 'adriatic', locative: 'Rovinju' },
	{ name: 'Umag', region: 'adriatic', locative: 'Umagu' },
	{ name: 'Trogir', region: 'adriatic', locative: 'Trogiru' },
	{ name: 'Kaštela', region: 'adriatic', locative: 'Kaštelima' },
	{ name: 'Solin', region: 'adriatic', locative: 'Solinu' },
	{ name: 'Omiš', region: 'adriatic', locative: 'Omišu' },
	{ name: 'Crikvenica', region: 'adriatic', locative: 'Crikvenici' },
	{ name: 'Krk', region: 'adriatic', locative: 'Krku' },
	{ name: 'Hvar', region: 'adriatic', locative: 'Hvaru' },
	{ name: 'Korčula', region: 'adriatic', locative: 'Korčuli' },
	{ name: 'Biograd na Moru', region: 'adriatic', locative: 'Biogradu na Moru' },
	{ name: 'Vodice', region: 'adriatic', locative: 'Vodicama' },
	{ name: 'Ploče', region: 'adriatic', locative: 'Pločama' },
	{ name: 'Metković', region: 'adriatic', locative: 'Metkoviću' }
];

export const CITY_NAMES = CITIES.map((c) => c.name);

export function findCity(input: string): City | undefined {
	const key = normalize(input);
	return key ? CITIES.find((c) => normalize(c.name) === key) : undefined;
}

export function regionForCity(input: string): Region {
	return findCity(input)?.region ?? 'continental';
}
