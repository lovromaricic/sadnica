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
/** "u noći na srijedu" */
const WEEKDAYS_ACC = ['nedjelju', 'ponedjeljak', 'utorak', 'srijedu', 'četvrtak', 'petak', 'subotu'];
const WEEKDAYS = ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota'];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const monthName = (m: number) => cap(MONTHS[m - 1]);

/** "ponedjeljak, 19. listopada" */
export function formatDate(date: Date): string {
	return `${WEEKDAYS[date.getDay()]}, ${date.getDate()}. ${MONTHS_GEN[date.getMonth()]}`;
}

/** "19. listopada", or "19. listopada 2025." when not in `currentYear`. */
export function formatDay(date: Date, currentYear: number): string {
	const base = `${date.getDate()}. ${MONTHS_GEN[date.getMonth()]}`;
	return date.getFullYear() === currentYear ? base : `${base} ${date.getFullYear()}.`;
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
		help: 'Odgovori na dva kratka pitanja i pokazat ćemo ti što možeš posaditi ovaj tjedan.',
		cityQ: 'Gdje živiš?',
		cityLabel: 'Grad ili mjesto',
		cityHint: 'Po mjestu biramo podneblje i datume sadnje.',
		regionLabel: 'Podneblje',
		regions: { continental: 'Kontinentalno', adriatic: 'Primorsko' },
		regionAuto: (region: string) => `Prepoznali smo: ${region}. Možeš promijeniti.`,
		placeQ: 'Gdje ćeš saditi?',
		places: {
			garden: { label: 'U vrtu ili gredici', sub: 'U zemlji ili u povišenoj gredici' },
			balcony: { label: 'Na balkonu ili u loncima', sub: 'Biljke u posudama' },
			unsure: { label: 'Još ne znam', sub: 'Samo istražujem' }
		},
		cta: 'Pokaži mi što sada saditi',
		save: 'Spremi promjene',
		next: 'Dalje',
		back: 'Natrag',
		cancel: 'Odustani',
		step: (n: number, total: number) => `Korak ${n} od ${total}`
	},

	today: {
		title: 'Danas',
		headline: (plantAcc: string) => `Ovaj tjedan sadimo ${plantAcc}`,
		headlineNone: 'Ovaj tjedan je mirno u vrtu',
		noneText: 'Trenutno nema ničeg što bi bilo dobro posaditi. Pogledaj što dolazi uskoro.',
		headlineNoneBalcony: 'Ovaj tjedan je mirno na balkonu',
		noneTextBalcony: (others: boolean) =>
			others
				? 'Trenutno nema ničeg što bi bilo dobro posaditi u lonac. Ovo sada raste, ali treba gredicu.'
				: 'Trenutno nema ničeg što bi bilo dobro posaditi u lonac. Pogledaj što dolazi uskoro.',
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
		bloom: (from: number, to: number) =>
			from === to ? `cvate u ${MONTHS_LOC[from - 1]}` : `cvate od ${MONTHS_GEN[from - 1]} do ${MONTHS_GEN[to - 1]}`,
		firstFruit: (years: number) => `prvi plodovi za oko ${pluralYears(years)}`,
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
			balcony: 'Za balkon',
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
		gardenBadge: (stage: string) => `U vrtu · ${stage}`,
		facts: { difficulty: 'Težina', sun: 'Sunce', water: 'Voda', spacing: 'Razmak' },
		pot: {
			label: 'Lonac',
			value: (cm: number) => `Ø ${cm} cm`,
			text: (cm: number) => `Treba ti lonac promjera barem ${cm} cm.`,
			tip: 'lonac mora imati rupe na dnu, da višak vode može oteći.',
			notTitle: 'Nije za lonac',
			notText: 'Ova biljka ne uspijeva dobro na balkonu.'
		},
		difficulty: { easy: 'Lako', medium: 'Srednje', hard: 'Zahtjevno' },
		sun: { full: 'Puno sunca', partial: 'Polusjena', shade: 'Hlad' },
		water: { low: 'Malo', medium: 'Umjereno', high: 'Puno' },
		goodToKnow: 'Dobro je znati:',
		understood: 'Razumijem',
		close: 'Zatvori',
		whenTitle: (cityLoc: string | undefined, city: string) => (cityLoc ? `Kada, u ${cityLoc}` : `Kada, za mjesto ${city}`),
		legendSow: 'Sadnja ili sjetva',
		legendHarvest: 'Berba',
		legendBloom: 'Cvatnja',
		currentMonth: 'Ovaj mjesec',
		monthCell: (month: string, sow: boolean, harvest: boolean, flower = false) =>
			`${month}: ${[sow && 'sadnja', harvest && (flower ? 'cvatnja' : 'berba')].filter(Boolean).join(' i ') || 'ništa'}`,
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
		undo: (previous: string) => `Vrati na: ${previous}`,
		stageDate: {
			toPlant: (day: string) => `Dodano ${day}`,
			sown: (day: string) => `Posijano ${day}`,
			growing: (day: string) => `Raste od ${day}`,
			ready: (day: string) => `Spremno od ${day}`
		},
		harvestAround: (m: number, nextYear: boolean) => `Berba oko ${MONTHS_GEN[m - 1]}${nextYear ? ' iduće godine' : ''}`,
		bloomAround: (m: number, nextYear: boolean) => `Cvatnja oko ${MONTHS_GEN[m - 1]}${nextYear ? ' iduće godine' : ''}`,
		firstFruitIn: (years: number) => `Prvi plodovi za oko ${pluralYears(years)}`,
		readyFlower: 'U cvatu',
		/** Trees and bushes are planted, not sown. */
		planted: 'Posađeno',
		plantedOn: (day: string) => `Posađeno ${day}`,
		changeDate: 'Promijeni datum',
		dateLabel: (stage: string) => `Datum, faza: ${stage}`,
		dateDone: 'Spremi datum',
		stageTitle: 'U tvom vrtu',
		progress: (stage: string) => `Faza: ${stage}`,
		next: {
			toPlantNow: (m: number) => `Sljedeće: posadi do kraja ${MONTHS_GEN[m - 1]}`,
			toPlantLater: (m: number) => `Sljedeće: sadnja ${m ? `u ${MONTHS_LOC[m - 1]}` : 'kad dođe sezona'}`,
			sown: 'Sljedeće: drži zemlju blago vlažnom dok ne nikne',
			growing: (from?: number) => (from ? `Sljedeće: berba od ${MONTHS_GEN[from - 1]}` : 'Sljedeće: zalijevaj i plijevi'),
			growingFlower: (from?: number) => (from ? `Sljedeće: cvatnja od ${MONTHS_GEN[from - 1]}` : 'Sljedeće: zalijevaj i plijevi'),
			growingPerennial: 'Sljedeće: zalijevaj, plijevi i strpi se do prvih plodova',
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
		addedWithWarning: (name: string, bad: string) => `${name} je u tvom vrtu. Ne sadi uz: ${bad}.`,
		close: 'Zatvori obavijest'
	},

	offline: 'Nisi na mreži. Sve radi i dalje, samo se promjene ne dijele nikamo.',
	add: (name: string) => `Dodaj u moj vrt: ${name}`,
	added: (name: string) => `${name} je već u vrtu`,

	ics: {
		summary: (name: string) => `Vrijeme za sadnju: ${name}`,
		description: (name: string) => `Prema ${APP_NAME}, sada je dobro vrijeme za sadnju: ${name}. Datumi su okvirni.`
	},

	weather: {
		frostTitle: 'Mraz je najavljen.',
		frostText: (when: string, temp: string) => `${cap(when)} do ${temp}.`,
		coldTitle: 'Hladna noć.',
		coldText: (when: string, temp: string) => `${cap(when)} do ${temp}, moguć je prizemni mraz.`,
		action: 'Osjetljivo bilje pokrij agrilom ili unesi u kuću.',
		calmButTypical: (typical: string) => `Idućih 7 dana nema mraza, ali prvi mraz je blizu. ${typical}`,
		when: (date: Date, today: Date) =>
			Math.round((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) / 86_400_000) === 1
				? 'sutra ujutro'
				: `u noći na ${WEEKDAYS_ACC[date.getDay()]}`,
		temp: (c: number) => {
			const n = Math.round(c);
			return `${n < 0 ? '−' : ''}${Math.abs(n)} °C`;
		},
		source: 'Prognoza: Open-Meteo'
	},
	problems: {
		title: 'Što nije u redu?',
		lead: 'Najčešći problemi i kako ih riješiti. Dodirni problem za savjet.',
		signs: 'Kako prepoznati',
		fix: 'Što napraviti'
	},
	log: {
		title: 'Bilješke i berba',
		text: 'Zapiši što se događa s biljkom i koliko je ubrano. Ostaje samo na ovom uređaju.',
		label: 'Nova bilješka',
		placeholder: 'Npr. prvi listići su nikli',
		harvestToggle: 'Ovo je berba',
		dateLabel: 'Datum',
		save: 'Spremi',
		empty: 'Još nema bilježaka.',
		delete: (day: string) => `Obriši bilješku od ${day}`,
		harvestBadge: 'Berba',
		harvestCount: (n: number) => `Ubrano ${n}×`,
		removeConfirm: 'Uz biljku će se obrisati i njezine bilješke. Makni je iz vrta?',
		removeYes: 'Da, makni',
		removeNo: 'Odustani'
	},
	calendar: {
		title: 'Kalendar vrta',
		text: 'Što te čeka idućih 12 mjeseci, za tvoje mjesto.',
		caption: 'Mjeseci sadnje i berbe za biljke u tvom vrtu, od ovog mjeseca nadalje',
		plant: 'Biljka',
		cell: (month: string, sow: boolean, harvest: boolean, flower = false) =>
			`${month}: ${[sow && 'sadnja', harvest && (flower ? 'cvatnja' : 'berba')].filter(Boolean).join(' i ') || 'ništa'}`
	},
	companions: {
		badTitle: 'Pazi, loš susjed u vrtu',
		badText: (acc: string, list: string) => `Ne sadi ${acc} uz: ${list}. Neka budu na različitim gredicama.`,
		goodText: (list: string) => `Dobri susjedi iz tvog vrta: ${list}. Posadi ih blizu.`,
		inGarden: 'u vrtu',
		notWith: (list: string) => `Ne uz: ${list}`
	},
	settings: {
		title: 'Postavke',
		open: 'Postavke',
		back: 'Natrag',
		answersTitle: 'Tvoji odgovori',
		city: 'Mjesto',
		region: 'Podneblje',
		place: 'Gdje sadiš',
		change: 'Promijeni odgovore',
		transferTitle: 'Prijenos i kopija',
		transferText: 'Vrt se sprema samo na ovom uređaju. Prenesi ga na drugi uređaj ili spremi kopiju.',
		qrTitle: 'Skeniraj mobitelom',
		qrText: 'Usmjeri kameru mobitela u kod i otvori poveznicu. Vrt će se prenijeti.',
		qrLabel: 'QR kod za prijenos vrta',
		qrTooBig: 'Vrt je prevelik za QR kod. Pošalji poveznicu ili spremi kopiju vrta.',
		copyLink: 'Kopiraj poveznicu',
		copied: 'Poveznica je kopirana.',
		share: 'Pošalji na drugi uređaj',
		shareTitle: 'Moj vrt u aplikaciji Sadnica',
		emptyGarden: 'Vrt je još prazan, pa nema što prenijeti. Kopiju možeš vratiti i u prazan vrt.',
		saveBackup: 'Spremi kopiju vrta',
		restoreBackup: 'Vrati iz kopije',
		badFile: 'Ova datoteka nije kopija vrta iz aplikacije Sadnica.',
		weatherTitle: 'Prognoza mraza',
		weatherText: 'Upozori me na mraz prema stvarnoj prognozi za idućih 7 dana. Servisu Open-Meteo šalju se samo približne koordinate grada. Isključeno: koriste se uobičajeni datumi mraza.',
		weatherToggle: 'Prognoza mraza',
		on: 'Uključeno',
		off: 'Isključeno',
		dataTitle: 'Podaci',
		resetText: 'Briše vrt, odgovore i sve oznake s ovog uređaja.',
		reset: 'Obriši sve podatke',
		resetConfirm: 'Sigurno? Ovo se ne može vratiti.',
		resetYes: 'Da, obriši sve',
		resetNo: 'Odustani',
		aboutTitle: 'O aplikaciji',
		about: [
			'Sadnica ti pokazuje što posaditi ovaj tjedan i kako.',
			'Datumi su okvirni i računaju se za tvoje mjesto. Savjeti su opći, pa za posebne slučajeve pitaj u poljoapoteci ili iskusnijeg vrtlara.',
			'Tvoj vrt i odgovori ostaju na tvom uređaju. Nema računa.',
			'Za prognozu mraza aplikacija servisu Open-Meteo šalje samo približne koordinate tvog grada. To možeš isključiti gore.'
		],
		version: (v: string) => `Verzija ${v}`,
		gardenLink: 'Imaš vrt i na drugom uređaju? Prenesi ga'
	},

	importer: {
		title: 'Prijenos vrta',
		loading: 'Učitavam vrt…',
		question: 'Uvezi ovaj vrt?',
		summary: (n: number, city: string) => `${pluralPlants(n)} · ${city}`,
		mergeText: 'Spoji: zadrži svoje biljke i dodaj ove. Ako je ista biljka na oba mjesta, ostaje ona koja je dalje odmakla.',
		replaceText: 'Zamijeni: ovaj vrt zamjenjuje sve što je sada na uređaju.',
		merge: 'Spoji s mojim vrtom',
		replace: 'Zamijeni moj vrt',
		importOnly: 'Uvezi vrt',
		cancel: 'Odustani',
		invalid: 'Ova poveznica nije ispravna ili je oštećena.',
		invalidHint: 'Zatraži novu poveznicu ili novi kod s drugog uređaja.',
		home: 'Na početnu',
		done: (n: number) => `Vrt je prenesen: ${pluralPlants(n)}.`
	},
	sun: {
		title: 'Provjera sunca',
		forPlant: (acc: string) => `Provjera sunca za ${acc}`,
		back: 'Natrag',

		// Entry points
		boxTitle: 'Želiš provjeriti koliko sunca ima tvoje mjesto?',
		boxText: 'Usmjeri mobitel i vidi putanju sunca na svom mjestu.',
		boxCta: 'Provjeri kamerom',
		widgetTitle: 'Ima li tvoje mjesto dovoljno sunca?',
		widgetText: 'Usmjeri mobitel prema nebu i za minutu vidi koliko sunca dobiva mjesto za sadnju.',
		widgetTextDesktop: 'Odaberi biljku i odgovori na jedno pitanje. Na mobitelu to možeš provjeriti i kamerom.',
		widgetCta: 'Provjeri kamerom',
		widgetCtaDesktop: 'Provjeri sunce',
		qrCaption: 'Ili skeniraj mobitelom',
		qrTitle: 'Otvori na mobitelu',
		qrText: 'Skeniraj kod mobitelom i provjeri sunce kamerom, na samom mjestu.',
		qrLabel: (url: string) => `QR kod koji otvara ${url}`,

		// Plant picker
		pickTitle: 'Za koju biljku provjeravaš?',
		pickText: 'Svaka biljka treba drugačije sunca, pa prvo odaberi jednu.',
		fromGarden: 'Iz tvog vrta',
		allPlants: 'Sve biljke',

		// Intro
		introTitle: 'Koliko sunca ima tvoje mjesto?',
		introSteps: [
			'Stani na mjesto gdje želiš saditi.',
			'Usmjeri mobitel prema nebu. Na ekranu ćeš vidjeti današnji put sunca.',
			'Dodirni sate u kojima sunce zaklanja zgrada ili drvo.'
		],
		privacy: 'Slika ne napušta tvoj mobitel',
		start: 'Počni',
		starting: 'Pokrećem kameru…',
		manualInstead: 'Radije ću odgovoriti ručno',

		// Calibration
		calTitle: 'Kalibriraj kompas',
		calText: 'Pomakni mobitel nekoliko puta u obliku osmice. Tako će smjer sunca biti točniji.',
		calContinue: 'Nastavi',
		calSkip: 'Preskoči kalibraciju',

		// Camera
		cameraHint: 'Dodirni sate kad je sunce zaklonjeno',
		counter: (n: number) => `${n} od 9 sati`,
		hourSunny: (h: number) => `${h}:00, ima sunca. Dodirni ako je zaklonjeno.`,
		hourBlocked: (h: number) => `${h}:00, zaklonjeno. Dodirni ako ima sunca.`,
		hourNight: (h: number) => `${h}:00, sunce je ispod obzora`,
		hoursLabel: 'Sati od 8 do 16',
		turnLeft: 'Put sunca je lijevo. Okreni se polako.',
		turnRight: 'Put sunca je desno. Okreni se polako.',
		tiltUp: 'Podigni mobitel prema nebu.',
		tiltDown: 'Spusti mobitel malo niže.',
		done: 'Gotovo',
		closeCamera: 'Zatvori kameru',

		// Manual fallback
		manualTitle: 'Koliko sunca dobiva to mjesto?',
		manualText: 'Sjeti se sunčanog dana i odaberi što najbolje opisuje mjesto.',
		manualOptions: {
			full: { label: 'Cijeli dan', sub: 'Sunce od jutra do popodneva' },
			morning: { label: 'Samo ujutro', sub: 'Popodne je u sjeni' },
			afternoon: { label: 'Samo popodne', sub: 'Ujutro je u sjeni' },
			never: { label: 'Skoro nikad', sub: 'Zgrada ili drveće ga zaklanjaju' }
		},
		manualCta: 'Pokaži rezultat',
		reasons: {
			desktop: 'Kamera radi samo na mobitelu, pa ovdje odgovori na jedno pitanje.',
			insecure: 'Kamera radi samo preko sigurne veze (https). Možeš odgovoriti ručno.',
			denied: 'Nisi dopustio pristup kameri ili senzorima. Možeš odgovoriti ručno.',
			noCamera: 'Ne možemo pokrenuti kameru na ovom uređaju. Možeš odgovoriti ručno.',
			noSensor: 'Ovaj uređaj nema kompas, pa ne možemo pokazati put sunca. Možeš odgovoriti ručno.'
		},

		// Result
		goodTitle: (acc: string) => `Za ${acc} je ovo dobro mjesto`,
		weakTitle: (acc: string) => `Ovdje je malo sunca za ${acc}`,
		goodText: (hours: string, nom: string, plural: boolean, need: string) =>
			`Imaš oko ${hours} sunca, a ${nom} ${plural ? 'vole' : 'voli'} ${need}.`,
		weakText: (hours: string, nom: string) =>
			`Imaš oko ${hours} sunca. ${cap(nom)} će ovdje rasti slabije i roditi manje.`,
		need: { full: 'puno sunca', partial: 'polusjenu', shade: 'hlad' },
		monthNote: (m: number) =>
			`Rezultat vrijedi za ${MONTHS[m - 1]}. Ljeti je sunce više, a zimi niže, pa se sjena mijenja.`,
		approxNote: 'Kompas mobitela nije savršen, pa su sati okvirni.',
		better: 'Što ovdje uspijeva bolje',
		add: (acc: string) => `Dodaj ${acc} u moj vrt`,
		addAnyway: (acc: string) => `Ipak dodaj ${acc} u moj vrt`,
		inGarden: 'U tvom je vrtu',
		again: 'Provjeri drugo mjesto',
		hourBar: (sunny: number) => `Sunčani sati između 8 i 16 sati: ${sunny} od 9`
	}
};

/** "1 godinu", "2 godine", "5 godina" (accusative after "za"). */
export function pluralYears(n: number): string {
	const mod10 = n % 10;
	const mod100 = n % 100;
	if (mod10 === 1 && mod100 !== 11) return `${n} godinu`;
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} godine`;
	return `${n} godina`;
}

/** 1 sat, 2-4 sata, else sati (with the 11-14 exception). */
export function pluralHours(n: number): string {
	const mod10 = n % 10;
	const mod100 = n % 100;
	if (mod10 === 1 && mod100 !== 11) return `${n} sat`;
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} sata`;
	return `${n} sati`;
}
