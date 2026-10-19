/**
 * All user-facing text (Croatian). Keep every UI string here so the app can be
 * translated later.
 */
import { APP_NAME } from '../config';

export const MONTHS = [
	'siječanj', 'veljača', 'ožujak', 'travanj', 'svibanj', 'lipanj',
	'srpanj', 'kolovoz', 'rujan', 'listopad', 'studeni', 'prosinac'
];
/** "do kraja studenog", "19. listopada" */
export const MONTHS_GEN = [
	'siječnja', 'veljače', 'ožujka', 'travnja', 'svibnja', 'lipnja',
	'srpnja', 'kolovoza', 'rujna', 'listopada', 'studenog', 'prosinca'
];
/** "u veljači" */
export const MONTHS_LOC = [
	'siječnju', 'veljači', 'ožujku', 'travnju', 'svibnju', 'lipnju',
	'srpnju', 'kolovozu', 'rujnu', 'listopadu', 'studenom', 'prosincu'
];
export const MONTHS_SHORT = ['Sij', 'Vel', 'Ožu', 'Tra', 'Svi', 'Lip', 'Srp', 'Kol', 'Ruj', 'Lis', 'Stu', 'Pro'];
const WEEKDAYS = ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota'];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const monthName = (m: number) => cap(MONTHS[m - 1]);

/** "ponedjeljak, 19. listopada" */
export function formatDate(date: Date): string {
	return `${WEEKDAYS[date.getDay()]}, ${date.getDate()}. ${MONTHS_GEN[date.getMonth()]}`;
}

/** 1 biljka, 2-4 biljke, else biljaka (with the 11-14 exception). */
export function pluralPlants(n: number): string {
	const mod10 = n % 10;
	const mod100 = n % 100;
	if (mod10 === 1 && mod100 !== 11) return `${n} biljka`;
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} biljke`;
	return `${n} biljaka`;
}

export const t = {
	appName: APP_NAME,
	nav: { today: 'Danas', plants: 'Biljke', garden: 'Moj vrt', main: 'Glavna navigacija' },
	locationLabel: (city: string) => `Mjesto: ${city}. Promijeni`,

	onboarding: {
		title: 'Početak',
		headline: 'Što danas posaditi, bez predznanja.',
		help: 'Odgovori na tri kratka pitanja i pokazat ćemo ti što možeš posaditi ovaj tjedan.',
		cityQ: 'Gdje živiš?',
		cityLabel: 'Grad ili mjesto',
		cityHint: 'Po mjestu biramo podneblje i datume sadnje.',
		regionLabel: 'Podneblje',
		regions: { continental: 'Kontinentalno', adriatic: 'Primorsko' },
		regionAuto: (region: string) => `Prepoznali smo: ${region}. Možeš promijeniti.`,
		placeQ: 'Gdje ćeš saditi?',
		places: {
			ground: { label: 'Direktno u zemlji', sub: 'Gredica u vrtu ili na polju' },
			raised: { label: 'Povišena gredica', sub: 'Okvir napunjen zemljom' },
			balcony: { label: 'Balkon ili lonci', sub: 'Biljke u posudama' },
			none: { label: 'Još ništa', sub: 'Samo istražujem' }
		},
		experienceQ: 'Koliko znaš o vrtlarenju?',
		experience: { never: 'Nikad nisam sadio', little: 'Malo sam probao', basics: 'Znam osnove' },
		cta: 'Pokaži mi što sada saditi',
		save: 'Spremi promjene',
		next: 'Dalje',
		back: 'Natrag',
		step: (n: number, total: number) => `Korak ${n} od ${total}`
	},

	today: {
		title: 'Danas',
		headline: (plantAcc: string) => `Ovaj tjedan sadimo ${plantAcc}`,
		headlineNone: 'Ovaj tjedan je mirno u vrtu',
		noneText: 'Trenutno nema ničeg što bi bilo dobro posaditi. Pogledaj što dolazi uskoro.',
		frostTitle: 'Prvi mraz je blizu.',
		frostAction: 'Osjetljivo bilje pokrij agrilom ili unesi u kuću.',
		badge: 'Preporuka tjedna',
		tipTitle: 'Savjet tjedna',
		howTo: 'Kako saditi',
		more: 'I još ovo stigneš',
		seeAll: (n: number) => `Vidi sve u sezoni (${n})`,
		soon: 'Uskoro',
		footnote: 'Datumi su okvirni i računaju se za tvoje mjesto.',
		easyLine: 'Jedna od najlakših biljaka za početak.'
	},

	timing: {
		until: (m: number) => `do kraja ${MONTHS_GEN[m - 1]}`,
		untilSentence: (m: number) => `Posadi do kraja ${MONTHS_GEN[m - 1]}`,
		harvest: (from: number, to: number) =>
			from === to ? `berba u ${MONTHS_LOC[from - 1]}` : `berba od ${MONTHS_GEN[from - 1]} do ${MONTHS_GEN[to - 1]}`,
		withCover: 'samo uz pokrov',
		from: (m: number) => `od ${MONTHS_GEN[m - 1]}`,
		off: 'Nije sezona'
	},

	status: { now: 'Sada', late: 'Još stigneš', off: 'Nije sezona' },

	catalog: {
		title: 'Sve biljke',
		searchLabel: 'Traži biljku',
		searchPlaceholder: 'Traži, npr. paradajz',
		filtersLabel: 'Filtri',
		filters: {
			season: 'Sada u sezoni',
			easy: 'Lako za početnike',
			veg: 'Povrće',
			herb: 'Začinsko bilje',
			flower: 'Cvijeće',
			fruit: 'Voće'
		},
		emptyTitle: 'Ovdje još nema biljaka',
		emptyText: 'Isprobaj drugi naziv ili makni neki filter.',
		clear: 'Makni filtre',
		tipTitle: 'Savjet',
		tip: 'Ako tek počinješ, uključi "Lako za početnike" i "Sada u sezoni". To su biljke koje možeš posaditi ovaj tjedan.'
	},

	plant: {
		back: 'Natrag',
		canPlant: 'Sada možeš saditi',
		lateBadge: 'Još stigneš',
		coverBadge: 'Samo uz pokrov',
		offBadge: 'Nije sezona',
		facts: { difficulty: 'Težina', sun: 'Sunce', water: 'Voda', spacing: 'Razmak' },
		difficulty: { easy: 'Lako', medium: 'Srednje', hard: 'Zahtjevno' },
		sun: { full: 'Puno sunca', partial: 'Polusjena', shade: 'Hlad' },
		water: { low: 'Malo', medium: 'Umjereno', high: 'Puno' },
		goodToKnow: 'Dobro je znati:',
		understood: 'Razumijem',
		close: 'Zatvori',
		whenTitle: (cityLoc: string | undefined, city: string) => (cityLoc ? `Kada, u ${cityLoc}` : `Kada, za mjesto ${city}`),
		legendSow: 'Sadnja ili sjetva',
		legendHarvest: 'Berba',
		currentMonth: 'Ovaj mjesec',
		monthCell: (month: string, sow: boolean, harvest: boolean) =>
			`${month}: ${[sow && 'sadnja', harvest && 'berba'].filter(Boolean).join(' i ') || 'ništa'}`,
		todayPerfect: (m: number) => `Danas je ${MONTHS[m - 1]}, savršeno vrijeme.`,
		todayLate: (m: number, end: number) => `Danas je ${MONTHS[m - 1]}. Stigneš još do kraja ${MONTHS_GEN[end - 1]}.`,
		todayCover: (m: number) => `Danas je ${MONTHS[m - 1]}. Sada samo uz pokrov od agrila.`,
		todayNext: (m: number, next: number) => `Danas je ${MONTHS[m - 1]}. Sadnja kreće u ${MONTHS_LOC[next - 1]}.`,
		stepsTitle: 'Korak po korak',
		stepDone: 'Gotovo',
		neighboursTitle: 'Susjedi u gredici',
		goodNeighbours: 'Dobro rastu uz',
		badNeighbours: 'Ne sadi uz',
		addToGarden: 'Dodaj u moj vrt',
		inGarden: 'U tvom je vrtu',
		removeFromGarden: 'Makni iz vrta',
		remind: 'Podsjeti me kad dođe vrijeme',
		remindDone: 'Podsjetnik je preuzet. Otvori datoteku da ga dodaš u kalendar.',
		notFound: 'Ne znamo tu biljku.',
		notFoundLink: 'Natrag na sve biljke'
	},

	garden: {
		title: 'Moj vrt',
		subtitle: (n: number, city: string) => `${pluralPlants(n)} · ${city}`,
		tasksTitle: 'Za napraviti ovaj tjedan',
		tasksProgress: (done: number, total: number) => `${done} od ${total} završeno`,
		tasksEmpty: 'Ovaj tjedan nema posla. Uživaj.',
		plantsTitle: 'Biljke u vrtu',
		add: 'Dodaj biljku',
		emptyTitle: 'Tvoj vrt je još prazan',
		emptyText: 'Dodaj prvu biljku i ovdje ćeš svaki tjedan vidjeti što treba napraviti.',
		emptyCta: 'Odaberi prvu biljku',
		stages: { toPlant: 'Za posaditi', sown: 'Posijano', growing: 'Raste', ready: 'Spremno za berbu' },
		advance: (next: string) => `Označi: ${next}`,
		progress: (stage: string) => `Faza: ${stage}`,
		next: {
			toPlantNow: (m: number) => `Sljedeće: posadi do kraja ${MONTHS_GEN[m - 1]}`,
			toPlantLater: (m: number) => `Sljedeće: sadnja ${m ? `u ${MONTHS_LOC[m - 1]}` : 'kad dođe sezona'}`,
			sown: 'Sljedeće: drži zemlju blago vlažnom dok ne nikne',
			growing: (from?: number) => (from ? `Sljedeće: berba od ${MONTHS_GEN[from - 1]}` : 'Sljedeće: zalijevaj i plijevi'),
			ready: 'Uberi i uživaj'
		},
		tasks: {
			plant: (acc: string) => `Posadi ${acc}`,
			plantCover: (acc: string) => `Posadi ${acc} i prekrij agrilom`,
			cover: (acc: string) => `Prekrij ${acc} agrilom, prije prvog mraza`,
			water: (acc: string) => `Provjeri vlagu zemlje kod biljke: ${acc}`,
			harvest: (acc: string) => `Uberi ${acc}`
		}
	},

	toast: {
		added: (name: string) => `${name} je u tvom vrtu.`,
		open: 'Otvori moj vrt',
		removed: (name: string) => `${name} je maknut iz vrta.`,
		close: 'Zatvori obavijest'
	},

	offline: 'Nisi na mreži. Sve radi i dalje, samo se promjene ne dijele nikamo.',
	add: (name: string) => `Dodaj u moj vrt: ${name}`,
	added: (name: string) => `${name} je već u vrtu`,

	ics: {
		summary: (name: string) => `Vrijeme za sadnju: ${name}`,
		description: (name: string) => `Prema ${APP_NAME}, sada je dobro vrijeme za sadnju: ${name}. Datumi su okvirni.`
	}
};
