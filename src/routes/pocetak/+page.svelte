<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { MediaQuery } from 'svelte/reactivity';
	import Icon, { type IconName } from '#lib/components/Icon.svelte';
	import Logo from '#lib/components/Logo.svelte';
	import PlantArt from '#lib/components/PlantArt.svelte';
	import { CITY_NAMES, regionForCity } from '#lib/cities.ts';
	import { plantsById } from '#lib/data/index.ts';
	import { REGIONS } from '#lib/data/regions.ts';
	import type { Region } from '#lib/data/schema.ts';
	import { t } from '#lib/i18n/hr.ts';
	import { store } from '#lib/store.svelte.ts';
	import { EXPERIENCES, PLACES, type Place } from '#lib/storage.ts';
	import type { Experience } from '#lib/season.ts';

	const desktop = new MediaQuery('min-width: 900px');
	const s = store.state;
	const editing = s.onboarded;

	let city = $state(s.city);
	let manualRegion = $state<Region | null>(s.regionManual ? s.region : null);
	let place = $state<Place>(s.place);
	let experience = $state<Experience>(s.experience);
	let step = $state(0);

	const region = $derived(manualRegion ?? regionForCity(city));
	const garlic = plantsById.get('cesnjak');

	const PLACE_STYLE: Record<Place, { icon: IconName; bg: string }> = {
		ground: { icon: 'ground', bg: 'var(--mint)' },
		raised: { icon: 'raised', bg: 'var(--butter)' },
		balcony: { icon: 'pot', bg: 'var(--sky)' },
		none: { icon: 'compass', bg: 'var(--lilac)' }
	};

	/** The icon grows with experience: seed, sprout, plant. */
	const EXPERIENCE_STYLE: Record<Experience, { icon: IconName; bg: string }> = {
		never: { icon: 'seed', bg: 'var(--apricot)' },
		little: { icon: 'sprout', bg: 'var(--peach)' },
		basics: { icon: 'plant', bg: 'var(--pink)' }
	};

	function finish(e?: SubmitEvent) {
		e?.preventDefault();
		store.completeOnboarding({
			city: city.trim() || 'Zagreb',
			region,
			regionManual: manualRegion !== null,
			place,
			experience
		});
		goto(resolve('/'));
	}

	function next(e: SubmitEvent) {
		e.preventDefault();
		if (step < 2) step++;
		else finish();
	}
</script>

<svelte:head>
	<title>{t.onboarding.title} · {t.appName}</title>
</svelte:head>

{#snippet cityQuestion()}
	<fieldset class="q">
		<legend><h2>{t.onboarding.cityQ}</h2></legend>
		<label class="field">
			<span class="sr-only">{t.onboarding.cityLabel}</span>
			<Icon name="pin" size={20} />
			<input
				type="text"
				bind:value={city}
				list="cities"
				autocomplete="address-level2"
				placeholder="Zagreb"
				aria-describedby="city-hint"
			/>
		</label>
		<datalist id="cities">
			{#each CITY_NAMES as name (name)}<option value={name}></option>{/each}
		</datalist>
		<p id="city-hint" class="hint">{t.onboarding.cityHint}</p>
		<div class="region" role="group" aria-label={t.onboarding.regionLabel}>
			{#each REGIONS as r (r)}
				<button type="button" class="seg" aria-pressed={region === r} onclick={() => (manualRegion = r)}>
					{t.onboarding.regions[r]}
				</button>
			{/each}
		</div>
	</fieldset>
{/snippet}

{#snippet placeQuestion()}
	<fieldset class="q">
		<legend><h2>{t.onboarding.placeQ}</h2></legend>
		<div class="places">
			{#each PLACES as p (p)}
				<button
					type="button"
					class="place"
					style:--tile={PLACE_STYLE[p].bg}
					aria-pressed={place === p}
					onclick={() => (place = p)}
				>
					<span class="place-icon"><Icon name={PLACE_STYLE[p].icon} size={26} /></span>
					<span class="place-text">
						<strong>{t.onboarding.places[p].label}</strong>
						<span>{t.onboarding.places[p].sub}</span>
					</span>
					<span class="tick" aria-hidden="true"><Icon name="check" size={16} /></span>
				</button>
			{/each}
		</div>
	</fieldset>
{/snippet}

{#snippet experienceQuestion()}
	<fieldset class="q">
		<legend><h2>{t.onboarding.experienceQ}</h2></legend>
		<div class="places levels">
			{#each EXPERIENCES as x (x)}
				<button
					type="button"
					class="place"
					style:--tile={EXPERIENCE_STYLE[x].bg}
					aria-pressed={experience === x}
					onclick={() => (experience = x)}
				>
					<span class="place-icon"><Icon name={EXPERIENCE_STYLE[x].icon} size={26} /></span>
					<span class="place-text">
						<strong>{t.onboarding.experience[x].label}</strong>
						<span>{t.onboarding.experience[x].sub}</span>
					</span>
					<span class="tick" aria-hidden="true"><Icon name="check" size={16} /></span>
				</button>
			{/each}
		</div>
	</fieldset>
{/snippet}

<div class="onboarding">
	<section class="intro lime" class:compact={!desktop.current && step > 0}>
		{#if !editing}<Logo href={false} large />{/if}
		<div class="intro-text">
			<h1>{t.onboarding.headline}</h1>
			<p>{t.onboarding.help}</p>
		</div>
		{#if garlic && !(!desktop.current && step > 0)}
			<div class="intro-art"><PlantArt art={garlic.illustration} size={desktop.current ? 260 : 84} /></div>
		{/if}
	</section>

	{#if desktop.current}
		<form class="questions panel" onsubmit={finish}>
			{@render cityQuestion()}
			{@render placeQuestion()}
			{@render experienceQuestion()}
			<button class="btn btn-primary btn-block cta" type="submit">{t.onboarding.cta}</button>
		</form>
	{:else}
		<form class="questions mobile" onsubmit={next}>
			<p class="sr-only" aria-live="polite">{t.onboarding.step(step + 1, 3)}</p>
			<div class="dots" aria-hidden="true">
				{#each [0, 1, 2] as i (i)}<span class:on={i <= step}></span>{/each}
			</div>
			{#if step === 0}
				{@render cityQuestion()}
			{:else if step === 1}
				{@render placeQuestion()}
			{:else}
				{@render experienceQuestion()}
			{/if}
			<div class="step-actions">
				<button class="btn btn-primary btn-block" type="submit">
					{step < 2 ? t.onboarding.next : t.onboarding.cta}
				</button>
				{#if step > 0}
					<button class="btn btn-secondary btn-block" type="button" onclick={() => step--}>{t.onboarding.back}</button>
				{/if}
			</div>
		</form>
	{/if}
</div>

<style>
	.onboarding {
		display: grid;
		gap: 12px;
		max-width: var(--max);
		margin: 0 auto;
		padding: 12px var(--gutter) 32px;
	}
	.intro {
		position: relative;
		display: grid;
		gap: 18px;
		padding: 22px;
		border-radius: var(--r-xl);
		overflow: hidden;
	}
	.compact {
		padding: 16px 20px;
	}
	.compact p {
		display: none;
	}
	.compact h1 {
		font-size: 1.375rem;
		padding-right: 0;
	}
	.intro-text {
		display: grid;
		gap: 10px;
		max-width: 30ch;
		position: relative;
		z-index: 1;
	}
	.intro h1 {
		font-size: clamp(1.75rem, 7vw, 2.25rem);
		padding-right: 48px;
	}
	.intro p {
		color: var(--muted-2);
		font-size: 1.0625rem;
	}
	.intro-art {
		position: absolute;
		right: 12px;
		top: 12px;
	}

	.questions {
		display: grid;
		gap: 28px;
		align-content: start;
	}
	.mobile {
		padding: 8px 0 0;
		gap: 22px;
	}
	.q {
		border: 0;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 12px;
		min-width: 0;
	}
	legend {
		padding: 0;
		margin-bottom: 12px;
	}
	.field {
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 60px;
		padding: 0 20px;
		border-radius: 999px;
		background: var(--white);
		border: 2px solid var(--border);
	}
	.field:focus-within {
		border-color: var(--ink);
	}
	.field:has(input:focus-visible) {
		outline: 3px solid var(--focus);
		outline-offset: 3px;
	}
	.field input {
		flex: 1;
		min-width: 0;
		border: 0;
		outline: 0;
		background: transparent;
		font-size: 1.125rem;
		font-weight: 600;
		min-height: 56px;
	}
	.panel .field {
		background: var(--ground);
	}
	.hint {
		color: var(--muted);
		font-size: 0.9375rem;
		padding-left: 6px;
	}
	.region {
		display: inline-flex;
		justify-self: start;
		padding: 4px;
		border-radius: 999px;
		background: var(--off);
	}
	.seg {
		min-height: 44px;
		padding: 0 18px;
		border: 0;
		border-radius: 999px;
		background: transparent;
		font-weight: 700;
		color: var(--muted-2);
	}
	.seg[aria-pressed='true'] {
		background: var(--ink);
		color: var(--white);
	}

	.places {
		display: grid;
		grid-template-columns: 1fr;
		gap: 10px;
	}
	.place {
		position: relative;
		display: flex;
		align-items: center;
		gap: 14px;
		min-height: 76px;
		padding: 14px 18px;
		border-radius: var(--r-md);
		border: 2px solid transparent;
		background: var(--tile);
		text-align: left;
	}
	.place[aria-pressed='true'] {
		border-color: var(--ink);
	}
	.place-icon {
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
		flex: none;
		border-radius: 50%;
		background: rgb(255 255 255 / 0.7);
	}
	.place-text {
		display: grid;
		gap: 2px;
	}
	.place-text strong {
		font-size: 1.0625rem;
	}
	.place-text span {
		color: var(--muted-2);
		font-size: 0.9375rem;
	}
	.tick {
		display: grid;
		place-items: center;
		width: 26px;
		height: 26px;
		margin-left: auto;
		flex: none;
		border-radius: 50%;
		border: 2px solid rgb(20 32 26 / 0.25);
		color: transparent;
	}
	.place[aria-pressed='true'] .tick {
		background: var(--ink);
		border-color: var(--ink);
		color: var(--lime);
	}

	.dots {
		display: flex;
		gap: 6px;
	}
	.dots span {
		height: 6px;
		flex: 1;
		border-radius: 999px;
		background: var(--border);
	}
	.dots span.on {
		background: var(--ink);
	}
	.step-actions {
		display: grid;
		gap: 10px;
		margin-top: 6px;
	}

	@media (min-width: 900px) {
		.onboarding {
			grid-template-columns: 1fr 1fr;
			gap: 16px;
			min-height: calc(100dvh - 40px);
			padding-top: 20px;
		}
		.intro {
			align-content: space-between;
			padding: 40px;
			min-height: 640px;
		}
		.intro h1 {
			font-size: clamp(2.75rem, 4.5vw, 4rem);
			padding-right: 0;
		}
		.intro-text {
			max-width: 16ch;
			gap: 18px;
		}
		.intro p {
			max-width: 34ch;
			font-size: 1.125rem;
		}
		.intro-art {
			position: static;
			justify-self: end;
		}
		.places {
			grid-template-columns: 1fr 1fr;
		}
		/* Experience: one row of three, same tiles as the place question. */
		.places.levels {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
		.levels .place {
			min-height: 168px;
		}
		.levels .place-text span {
			font-size: 0.875rem;
		}
		.place {
			align-items: flex-start;
			flex-direction: column;
			min-height: 150px;
		}
		.tick {
			position: absolute;
			top: 14px;
			right: 14px;
		}
		.cta {
			margin-top: 4px;
		}
	}
</style>
