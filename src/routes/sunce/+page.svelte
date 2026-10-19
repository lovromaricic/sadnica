<script lang="ts">
	import { onMount } from 'svelte';
	import { goto, replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { SvelteSet } from 'svelte/reactivity';
	import PlantPicker from '#lib/components/sun/PlantPicker.svelte';
	import SunCalibrate from '#lib/components/sun/SunCalibrate.svelte';
	import SunCamera from '#lib/components/sun/SunCamera.svelte';
	import SunHeader from '#lib/components/sun/SunHeader.svelte';
	import SunIntro from '#lib/components/sun/SunIntro.svelte';
	import SunManual from '#lib/components/sun/SunManual.svelte';
	import SunResult from '#lib/components/sun/SunResult.svelte';
	import { coordsForCity } from '#lib/cities.ts';
	import { plantsById } from '#lib/data/index.ts';
	import type { Plant } from '#lib/data/schema.ts';
	import { t } from '#lib/i18n/hr.ts';
	import { MANUAL_HOURS, SUN_HOURS, type ManualAnswer } from '#lib/sun/logic.ts';
	import { hourDirections } from '#lib/sun/arc.ts';
	import {
		cameraUnavailable,
		getLocation,
		requestOrientationPermission,
		startCamera,
		stopStream,
		waitForCompass,
		type Unavailable
	} from '#lib/sun/sensors.ts';
	import { store } from '#lib/store.svelte.ts';
	import { today } from '#lib/today.ts';

	type Step = 'pick' | 'intro' | 'calibrate' | 'camera' | 'manual' | 'result';

	let plant = $state<Plant | null>(null);
	let step = $state<Step>('pick');
	let reason = $state<Unavailable | null>(null);
	let busy = $state(false);
	let stream = $state<MediaStream | null>(null);
	let location = $state<{ lat: number; lng: number } | null>(null);
	let source = $state<'camera' | 'manual'>('camera');
	let manualSunny = $state<number[]>([]);
	/** The plant was chosen on this screen (not passed in the link), so Back returns to the picker. */
	let pickedHere = $state(false);
	const blocked = new SvelteSet<number>();

	const coords = $derived(location ?? coordsForCity(store.state.city, store.state.region));
	const month = today.getMonth() + 1;

	/** Sunny hours measured on the camera screen: above the horizon and not marked as blocked. */
	const cameraSunny = $derived(
		hourDirections(today, coords.lat, coords.lng, SUN_HOURS)
			.filter((h) => h.altitude > 0 && !blocked.has(h.hour))
			.map((h) => h.hour)
	);

	function firstStep(): Step {
		reason = cameraUnavailable();
		return reason ? 'manual' : 'intro';
	}

	onMount(() => {
		const id = new URLSearchParams(window.location.search).get('plant');
		plant = (id && plantsById.get(id)) || null;
		step = plant ? firstStep() : 'pick';
		return () => stopStream(stream);
	});

	function pick(p: Plant) {
		plant = p;
		pickedHere = true;
		replaceState(`?plant=${p.id}`, {});
		step = firstStep();
	}

	function toManual(why: Unavailable | null) {
		stopStream(stream);
		stream = null;
		reason = why;
		step = 'manual';
	}

	/** Every permission prompt starts from this tap, as iOS requires. */
	async function start() {
		busy = true;
		try {
			if (!(await requestOrientationPermission())) return toManual('denied');
			// Location only sharpens the sun path; the city from onboarding is the fallback.
			getLocation().then((loc) => loc && (location = loc));
			try {
				stream = await startCamera();
			} catch (e) {
				return toManual((e as DOMException)?.name === 'NotAllowedError' ? 'denied' : 'noCamera');
			}
			if (!(await waitForCompass())) return toManual('noSensor');
			step = 'calibrate';
		} finally {
			busy = false;
		}
	}

	async function openCamera() {
		if (!stream) {
			try {
				stream = await startCamera();
			} catch {
				return toManual('noCamera');
			}
		}
		step = 'camera';
	}

	function finishCamera() {
		stopStream(stream);
		stream = null;
		source = 'camera';
		step = 'result';
	}

	function answer(a: ManualAnswer) {
		manualSunny = MANUAL_HOURS[a];
		source = 'manual';
		step = 'result';
	}

	function again() {
		if (source === 'manual') {
			step = 'manual';
			return;
		}
		blocked.clear();
		openCamera();
	}

	function closeCamera() {
		stopStream(stream);
		stream = null;
		step = 'intro';
	}

	function back() {
		if (step === 'result') step = source === 'manual' ? 'manual' : firstStep();
		else if (step === 'calibrate') closeCamera();
		else if ((step === 'intro' || step === 'manual') && pickedHere) step = 'pick';
		else if (history.length > 1) history.back();
		else goto(resolve('/'));
	}
</script>

<svelte:head>
	<title>{t.sun.title} · {t.appName}</title>
</svelte:head>

<div class="page sun-page">
	<div class="column">
		{#if step !== 'camera'}
			<SunHeader title={plant ? t.sun.forPlant(plant.forms.acc) : t.sun.title} onBack={back} />
		{/if}

		{#if step === 'pick' || !plant}
			<PlantPicker onPick={pick} />
		{:else if step === 'intro'}
			<SunIntro {busy} onStart={start} onManual={() => toManual(null)} />
		{:else if step === 'calibrate'}
			<SunCalibrate onContinue={openCamera} onSkip={openCamera} />
		{:else if step === 'manual'}
			<SunManual {reason} onAnswer={answer} />
		{:else if step === 'result'}
			<SunResult
				{plant}
				sunny={source === 'manual' ? manualSunny : cameraSunny}
				{month}
				approximate={source === 'camera'}
				onAgain={again}
			/>
		{/if}
	</div>
</div>

{#if step === 'camera' && stream && plant}
	<SunCamera
		{stream}
		date={today}
		lat={coords.lat}
		lng={coords.lng}
		{blocked}
		onDone={finishCamera}
		onClose={closeCamera}
	/>
{/if}

<style>
	.column {
		max-width: 560px;
		margin: 0 auto;
	}
	@media (min-width: 900px) {
		.column {
			padding: 36px;
			border-radius: var(--r-xl);
			background: var(--white);
		}
	}
</style>
