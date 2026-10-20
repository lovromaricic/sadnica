<script lang="ts">
	import { addToGarden, gardenPlants } from '#lib/gardenActions.ts';
	import { gardenNeighbours, gardenPlantNamed, listNames } from '#lib/companions.ts';
	import { resolve } from '$app/paths';
	import { SvelteSet } from 'svelte/reactivity';
	import GardenLog from '#lib/components/GardenLog.svelte';
	import { stageLabel } from '#lib/garden.ts';
	import { petLabel, petRisk } from '#lib/pets.ts';
	import GardenStage from '#lib/components/GardenStage.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Modal from '#lib/components/Modal.svelte';
	import PlantingDiagram from '#lib/components/planting/PlantingDiagram.svelte';
	import { headerLabel, headerValue, tipText } from '#lib/planting/content.ts';
	import { hasDiagram } from '#lib/planting/geometry.ts';
	import MonthStrip from '#lib/components/MonthStrip.svelte';
	import PlantArt from '#lib/components/PlantArt.svelte';
	import PlantProblems from '#lib/components/PlantProblems.svelte';
	import { findCity } from '#lib/cities.ts';
	import { explanations, plants, plantsById, rules } from '#lib/data/index.ts';
	import { t } from '#lib/i18n/hr.ts';
	import { buildIcs, downloadFile } from '#lib/ics.ts';
	import { normalize } from '#lib/search.ts';
	import { getSeasonStatus } from '#lib/season.ts';
	import { navContext } from '#lib/navContext.svelte.ts';
	import { store } from '#lib/store.svelte.ts';
	import { toast } from '#lib/toast.svelte.ts';
	import { today } from '#lib/today.ts';
	import { frostSoon } from '#lib/forecast.svelte.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type Fact = 'difficulty' | 'sun' | 'water' | 'spacing';
	const FACT_COLORS: Record<Fact, string> = {
		difficulty: 'var(--mint)',
		sun: 'var(--butter)',
		water: 'var(--sky)',
		spacing: 'var(--pink)'
	};
	const FACTS: Fact[] = ['difficulty', 'sun', 'water', 'spacing'];

	const plant = $derived(plantsById.get(data.id));
	const region = $derived(store.state.region);
	const month = today.getMonth() + 1;
	const season = $derived(plant && getSeasonStatus(plant, region, today, rules));
	const frostNear = $derived(frostSoon(region, today, rules));
	const gardenItem = $derived(plant && store.inGarden(plant.id));
	const city = $derived(store.state.city);
	// Balcony gardeners see the pot size instead of row spacing, or why the plant does not suit a pot.
	const balcony = $derived(store.state.place === 'balcony');
	const potCm = $derived(balcony && plant?.containers?.ok ? plant.containers.minPotCm : undefined);
	const notForPots = $derived(balcony && plant?.containers?.ok === false);

	// Steps are saved with the plant when it is in the garden, otherwise kept for this visit.
	const localSteps = new SvelteSet<number>();
	const stepDone = (i: number) => (gardenItem ? gardenItem.stepsDone.includes(i) : localSteps.has(i));
	function toggleStep(i: number) {
		if (!plant) return;
		if (gardenItem) store.toggleStep(plant.id, i);
		else if (localSteps.has(i)) localSteps.delete(i);
		else localSteps.add(i);
	}

	let openFact = $state<Fact | null>(null);
	let modalOpen = $state(false);
	function showFact(f: Fact) {
		openFact = f;
		modalOpen = true;
	}

	const factValue = (f: Fact) =>
		!plant
			? ''
			: f === 'spacing'
				? potCm
					? t.plant.pot.value(potCm)
					: plant.spacingText
				: f === 'difficulty'
					? t.plant.difficulty[plant.difficulty]
					: f === 'sun'
						? t.plant.sun[plant.sun]
						: t.plant.water[plant.water];

	const modalContent = $derived.by(() => {
		if (!plant || !openFact) return null;
		if (openFact === 'spacing' && potCm) {
			const note = plant.containers?.note;
			return { paragraphs: [t.plant.pot.text(potCm), ...(note ? [note] : [])], tip: t.plant.pot.tip };
		}
		if (openFact === 'spacing') return { paragraphs: plant.spacingExplanation, tip: plant.spacingTip };
		const e =
			openFact === 'difficulty'
				? explanations.difficulty[plant.difficulty]
				: openFact === 'sun'
					? explanations.sun[plant.sun]
					: explanations.water[plant.water];
		return { paragraphs: e.paragraphs, tip: e.tip };
	});

	const factLabel = (f: Fact) => (f === 'spacing' && potCm ? t.plant.pot.label : t.plant.facts[f]);

	// Garden spacing gets the animated planting diagram when the plant has one; pots keep the pot text.
	const diagram = $derived(!potCm && plant?.planting && hasDiagram(plant.planting) ? plant.planting : undefined);
	let diagramOpen = $state(false);
	function openFactModal(f: Fact) {
		if (f === 'spacing' && diagram) diagramOpen = true;
		else showFact(f);
	}

	const badge = $derived.by(() => {
		if (!season) return '';
		// Once it is in the ground, the garden stage matters more than the planting season.
		if (gardenItem && gardenItem.stage !== 'toPlant') return t.plant.gardenBadge(stageLabel(gardenItem.stage, plant!));
		if (season.status === 'now') return t.plant.canPlant;
		if (season.status === 'late') return season.needsCover ? t.plant.coverBadge : t.plant.lateBadge;
		return t.plant.offBadge;
	});

	const todayLine = $derived.by(() => {
		if (!season) return '';
		const end = season.end ? season.end.getMonth() + 1 : month;
		if (season.status === 'now') return t.plant.todayPerfect(month);
		if (season.status === 'late') return season.needsCover ? t.plant.todayCover(month) : t.plant.todayLate(month, end);
		return t.plant.todayNext(month, season.nextMonth ?? month);
	});

	/** Link neighbours that are in the catalogue. */
	const byName = new Map(plants.map((p) => [normalize(p.name), p]));

	/** Neighbours already in the garden (works whether or not this plant is in it yet). */
	const inGardenPlants = $derived(gardenPlants());
	const gardenNb = $derived(plant ? gardenNeighbours(plant, inGardenPlants) : { bad: [], good: [] });

	/** Dogs and cats: a chip under the name, explained in the same kind of popup as the facts. */
	const pet = $derived(plant ? petRisk(plant) : null);
	let petOpen = $state(false);

	/** Back to the tab this page was opened from: real Back when we just came from it, so scroll is kept. */
	const backHref = $derived(navContext.tabHref ?? resolve('/biljke'));
	function goBack(e: MouseEvent) {
		if (navContext.previousHref && navContext.previousHref === navContext.tabHref) {
			e.preventDefault();
			history.back();
		}
	}

	let reminded = $state(false);
	function remind() {
		if (!plant) return;
		const ics = buildIcs(plant, region, today, rules);
		if (!ics) return;
		downloadFile(`${plant.id}-podsjetnik.ics`, ics);
		reminded = true;
	}

	function add() {
		if (!plant) return;
		addToGarden(plant);
	}

	// Notes would be lost with the plant, so ask first when there are any.
	let confirmRemove = $state(false);
	function remove() {
		if (!plant) return;
		if (gardenItem?.log.length && !confirmRemove) {
			confirmRemove = true;
			return;
		}
		confirmRemove = false;
		store.removePlant(plant.id);
		toast.show(t.toast.removed(plant.name));
	}
</script>

<svelte:head>
	<title>{plant?.name ?? t.plant.notFound} · {t.appName}</title>
</svelte:head>

{#snippet actions(where: string)}
	<div class="actions {where}">
		{#if gardenItem && plant}
			<GardenStage {plant} item={gardenItem} />
			{#if confirmRemove}
				<div class="remove-confirm" role="alert">
					<p>{t.log.removeConfirm}</p>
					<div class="remove-row">
						<button type="button" class="btn btn-primary" onclick={remove}>{t.log.removeYes}</button>
						<button type="button" class="btn btn-secondary" onclick={() => (confirmRemove = false)}>{t.log.removeNo}</button>
					</div>
				</div>
			{:else}
				<button type="button" class="btn btn-secondary btn-block" onclick={remove}>{t.plant.removeFromGarden}</button>
			{/if}
		{:else}
			<button type="button" class="btn btn-primary btn-block" onclick={add}>
				<Icon name="plus" size={20} />{t.plant.addToGarden}
			</button>
		{/if}
		<button type="button" class="btn btn-secondary btn-block" onclick={remind}>
			<Icon name="bell" size={20} />{t.plant.remind}
		</button>
		{#if reminded}<p class="reminded" role="status">{t.plant.remindDone}</p>{/if}
	</div>
{/snippet}

{#if plant && season}
	<div class="page plant-page">
		<aside class="hero lime">
			<div class="hero-top">
				<a class="icon-btn back" href={backHref} onclick={goBack} aria-label={t.plant.back}><Icon name="back" size={22} /></a>
				<span class="badge" class:muted={season.status !== 'now' && !(gardenItem && gardenItem.stage !== 'toPlant')}>{badge}</span>
			</div>
			<div class="hero-art"><PlantArt art={plant.illustration} size={200} /></div>
			<div class="hero-text">
				<h1>{plant.name}</h1>
				{#if plant.latin}<p class="latin">{plant.latin}</p>{/if}
				{#if pet}
					<button type="button" class="pet-chip" class:serious={pet.severity === 'serious'} aria-haspopup="dialog" onclick={() => (petOpen = true)}>
						<Icon name="paw" size={18} /><span class="pet-text">{petLabel(pet)}</span>
					</button>
				{/if}
				<p class="summary">{plant.summary}</p>
			</div>
			{@render actions('desktop-only')}
		</aside>

		<div class="details">
			{#if notForPots}
				<p class="pot-note">
					<strong>{t.plant.pot.notTitle}.</strong>
					{plant.containers?.note ?? t.plant.pot.notText}
				</p>
			{/if}
			<ul class="facts">
				{#each FACTS as f (f)}
					<li>
						<button
							type="button"
							class="fact"
							style:background={FACT_COLORS[f]}
							aria-haspopup="dialog"
							onclick={() => openFactModal(f)}
						>
							<span class="i" aria-hidden="true">i</span>
							<span class="fact-label">{factLabel(f)}<span class="sr-only">:</span></span>
							<span class="fact-value">{factValue(f)}</span>
						</button>
					</li>
				{/each}
			</ul>

			<section class="when dark" aria-labelledby="when-title">
				<h2 id="when-title">{t.plant.whenTitle(findCity(city)?.locative, city)}</h2>
				<MonthStrip {plant} {region} {month} />
				<p class="today-line">{todayLine}</p>
				{#if season.window?.note && season.status !== 'off'}
					<p class="window-note">{season.window.note}</p>
				{/if}
			</section>

			<section class="steps-section" aria-labelledby="steps-title">
				<h2 id="steps-title" class="section-title">{t.plant.stepsTitle}</h2>
				<ol class="steps">
					{#each plant.steps as step, i (i)}
						{@const done = stepDone(i)}
						<li>
							<button type="button" class="step" class:done aria-pressed={done} onclick={() => toggleStep(i)}>
								<span class="num" aria-hidden="true">
									{#if done}<Icon name="check" size={18} />{:else}{i + 1}{/if}
								</span>
								<span class="step-text">
									<strong>{step.title}</strong>
									<span>{step.text}</span>
								</span>
							</button>
						</li>
					{/each}
				</ol>
			</section>

			<PlantProblems {plant} />

			{#if gardenItem}
				<GardenLog plantId={plant.id} item={gardenItem} />
			{/if}

			{#if plant.neighbours.good.length || plant.neighbours.bad.length || gardenNb.bad.length}
				<section class="neighbours" aria-labelledby="nb-title">
					<h2 id="nb-title" class="section-title">{t.plant.neighboursTitle}</h2>
					{#if gardenNb.bad.length}
						<div class="nb-warning" role="note">
							<strong><Icon name="x" size={16} />{t.companions.badTitle}</strong>
							<p>{t.companions.badText(plant.forms.acc, listNames(gardenNb.bad))}</p>
						</div>
					{/if}
					{#if gardenNb.good.length}
						<p class="nb-good-note">{t.companions.goodText(listNames(gardenNb.good))}</p>
					{/if}
					{#if plant.neighbours.good.length}
						<h3 class="nb-sub">{t.plant.goodNeighbours}</h3>
						<ul class="nb-list">
							{#each plant.neighbours.good as name (name)}
								{@const linked = byName.get(normalize(name))}
								<li class="nb good">
									<Icon name="check" size={16} />
									{#if linked}<a href={resolve('/biljke/[id]', { id: linked.id })}>{name}</a>{:else}{name}{/if}
									{#if gardenPlantNamed(name, inGardenPlants)}<span class="in-garden-tag">{t.companions.inGarden}</span>{/if}
								</li>
							{/each}
						</ul>
					{/if}
					{#if plant.neighbours.bad.length}
						<h3 class="nb-sub">{t.plant.badNeighbours}</h3>
						<ul class="nb-list">
							{#each plant.neighbours.bad as name (name)}
								{@const linked = byName.get(normalize(name))}
								<li class="nb bad">
									<Icon name="x" size={16} />
									{#if linked}<a href={resolve('/biljke/[id]', { id: linked.id })}>{name}</a>{:else}{name}{/if}
									{#if gardenPlantNamed(name, inGardenPlants)}<span class="in-garden-tag">{t.companions.inGarden}</span>{/if}
								</li>
							{/each}
						</ul>
					{/if}
				</section>
			{/if}

			{@render actions('mobile-only')}
			<p class="footnote">{t.today.footnote}</p>
		</div>
	</div>

	{#if pet}
		<Modal
			bind:open={petOpen}
			label={t.pets.title}
			value={petLabel(pet)}
			color="#b42318"
			ink="var(--white)"
			tip={t.pets.source}
		>
			<p><strong>{t.pets.part}:</strong> {pet.part}</p>
			<p><strong>{t.pets.signs}:</strong> {pet.signs}</p>
			<p>{t.pets.advice}</p>
		</Modal>
	{/if}

	{#if diagram}
		<Modal bind:open={diagramOpen} label={headerLabel(diagram)} value={headerValue(diagram)} color={FACT_COLORS.spacing} tip={tipText(diagram)}>
			<PlantingDiagram {plant} planting={diagram} />
		</Modal>
	{/if}

	{#if openFact && modalContent}
		<Modal
			bind:open={modalOpen}
			label={factLabel(openFact)}
			value={factValue(openFact)}
			color={FACT_COLORS[openFact]}
			tip={modalContent.tip}
		>
			{#each modalContent.paragraphs as p, i (i)}<p>{p}</p>{/each}
			{#if openFact === 'sun'}
				<div class="sun-check">
					<strong>{t.sun.boxTitle}</strong>
					<p>{t.sun.boxText}</p>
					<a class="sun-check-btn" href="{resolve('/sunce')}?plant={plant.id}">
						<Icon name="camera" size={18} />{t.sun.boxCta}
					</a>
				</div>
			{/if}
		</Modal>
	{/if}
{:else}
	<div class="page">
		<div class="panel not-found">
			<h1>{t.plant.notFound}</h1>
			<a class="btn btn-primary" href={resolve('/biljke')}>{t.plant.notFoundLink}</a>
		</div>
	</div>
{/if}

<style>
	.plant-page {
		display: grid;
		gap: 14px;
	}
	.hero {
		display: grid;
		gap: 10px;
		padding: 16px 20px 24px;
		border-radius: var(--r-xl);
	}
	.hero-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}
	.back {
		background: rgb(255 255 255 / 0.75);
	}
	/* White on the hero; out of season it fades, so "Sada" and "Nije sezona" still look different. */
	.badge {
		background: var(--white);
		color: var(--ink);
	}
	.badge.muted {
		background: rgb(255 255 255 / 0.5);
		color: var(--muted-2);
	}
	.hero-art {
		justify-self: center;
	}
	.hero-art :global(svg) {
		width: 160px;
		height: 160px;
	}
	.hero-text {
		display: grid;
		gap: 6px;
	}
	.hero h1 {
		font-size: clamp(2.5rem, 11vw, 4rem);
	}
	.latin {
		font-style: italic;
		color: var(--muted-2);
	}
	/* A quiet text link: only the paw is red, so the warning does not shout over the plant. */
	.pet-chip {
		justify-self: start;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		padding: 0;
		border: 0;
		background: none;
		color: var(--muted-2);
		font-weight: 600;
		font-size: 0.9375rem;
		text-align: left;
	}
	.pet-chip.serious {
		color: var(--ink);
		font-weight: 700;
	}
	.pet-chip :global(svg) {
		flex: none;
		color: #b42318;
	}
	.pet-text {
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
	}
	.summary {
		font-size: 1.0625rem;
		color: var(--muted-2);
		margin-top: 4px;
	}

	.details {
		display: grid;
		gap: 14px;
		min-width: 0;
	}

	.pot-note {
		padding: 16px 18px;
		border-radius: var(--r-md);
		background: var(--peach);
		font-size: 0.9375rem;
	}
	.facts {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}
	.fact {
		position: relative;
		display: grid;
		align-content: end;
		gap: 4px;
		width: 100%;
		min-height: 110px;
		padding: 16px;
		border: 0;
		border-radius: var(--r-md);
		text-align: left;
		transition: transform 0.15s ease;
	}
	.fact:hover {
		transform: translateY(-2px);
	}
	.i {
		position: absolute;
		top: 12px;
		right: 12px;
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: var(--ink);
		color: var(--white);
		font-family: var(--font-head);
		font-weight: 800;
		font-size: 0.9375rem;
	}
	.fact-label {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--muted-2);
	}
	.fact-value {
		font-family: var(--font-head);
		font-weight: 800;
		font-size: 1.375rem;
		letter-spacing: -0.02em;
		line-height: 1.1;
	}

	.when {
		padding: 22px 16px;
		border-radius: var(--r-xl);
	}
	.when h2 {
		margin-bottom: 14px;
		color: var(--white);
	}
	.today-line {
		margin-top: 14px;
		font-weight: 600;
		color: var(--lime);
	}
	.window-note {
		margin-top: 4px;
		font-size: 0.9375rem;
		color: var(--dark-muted);
	}

	.steps-section,
	.neighbours {
		padding: 22px 16px;
		border-radius: var(--r-xl);
		background: var(--white);
	}
	.steps-section .section-title,
	.neighbours .section-title {
		padding: 0 4px;
	}
	.steps {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 8px;
	}
	.step {
		display: flex;
		align-items: flex-start;
		gap: 14px;
		width: 100%;
		min-height: 64px;
		padding: 12px;
		border: 0;
		border-radius: var(--r-sm);
		background: var(--ground);
		text-align: left;
	}
	.num {
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		flex: none;
		border-radius: 50%;
		background: var(--white);
		border: 2px solid var(--ink);
		font-family: var(--font-head);
		font-weight: 800;
	}
	.step.done .num {
		background: var(--ink);
		color: var(--lime);
	}
	.step-text {
		display: grid;
		gap: 2px;
		padding-top: 5px;
	}
	.step-text strong {
		font-size: 1.0625rem;
	}
	.step-text span {
		color: var(--muted-2);
		font-size: 0.9375rem;
	}
	.step.done .step-text strong {
		text-decoration: line-through;
		text-decoration-thickness: 2px;
	}

	.neighbours {
		background: var(--lilac);
		color: var(--lilac-ink);
	}
	.nb-sub {
		font-family: var(--font-body);
		font-size: 0.875rem;
		font-weight: 700;
		letter-spacing: 0;
		margin: 6px 4px 8px;
	}
	.nb-warning {
		display: grid;
		gap: 4px;
		margin: 0 0 12px;
		padding: 14px 16px;
		border-radius: var(--r-sm);
		background: var(--lilac-ink);
		color: var(--white);
	}
	.nb-warning strong {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.nb-warning p {
		font-size: 0.9375rem;
	}
	.nb-good-note {
		margin: 0 4px 10px;
		font-size: 0.9375rem;
		font-weight: 600;
	}
	.in-garden-tag {
		padding: 2px 8px;
		border-radius: 999px;
		background: var(--lime);
		color: var(--ink);
		font-size: 0.75rem;
		font-weight: 700;
	}
	.nb-list {
		list-style: none;
		margin: 0 0 8px;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.nb {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 40px;
		padding: 0 14px 0 12px;
		border-radius: 999px;
		font-weight: 600;
		font-size: 0.9375rem;
	}
	.nb a {
		text-underline-offset: 3px;
	}
	/* The whole chip is the touch target, at least 44px tall. */
	.nb:has(a) {
		position: relative;
	}
	.nb a::after {
		content: '';
		position: absolute;
		inset: -2px 0;
		border-radius: 999px;
	}
	.good {
		background: var(--white);
	}
	.bad {
		background: var(--lilac-ink);
		color: var(--white);
	}

	.actions {
		display: grid;
		gap: 10px;
	}
	.remove-confirm {
		display: grid;
		gap: 10px;
		padding: 14px;
		border-radius: var(--r-md);
		background: var(--white);
		font-weight: 600;
	}
	.remove-row {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.remove-row .btn {
		min-height: 48px;
		padding: 0 18px;
	}
	.reminded {
		font-size: 0.875rem;
		color: var(--muted-2);
		text-align: center;
	}
	.desktop-only {
		display: none;
	}
	.footnote {
		padding: 0 6px;
	}
	.sun-check {
		display: grid;
		gap: 6px;
		padding: 16px;
		border-radius: var(--r-sm);
		/* Same yellow as the sun widget on Danas. */
		background: var(--butter);
		color: var(--ink);
	}
	.sun-check p {
		font-size: 0.9375rem !important;
		color: var(--muted-2);
	}
	.sun-check-btn {
		justify-self: start;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		margin-top: 4px;
		padding: 0 16px;
		border-radius: 999px;
		background: var(--ink);
		color: var(--white);
		font-weight: 700;
		font-size: 0.9375rem;
		text-decoration: none;
	}
	.not-found {
		display: grid;
		justify-items: start;
		gap: 16px;
	}

	@media (min-width: 900px) {
		.plant-page {
			grid-template-columns: minmax(320px, 5fr) 7fr;
			align-items: start;
			gap: 16px;
		}
		.hero {
			position: sticky;
			top: 16px;
			padding: 28px 32px 32px;
			gap: 14px;
		}
		.hero-art :global(svg) {
			width: 220px;
			height: 220px;
		}
		.desktop-only {
			display: grid;
			margin-top: 8px;
		}
		.mobile-only {
			display: none;
		}
		.details {
			padding: 32px;
			border-radius: var(--r-xl);
			background: var(--white);
			gap: 16px;
		}
		.facts {
			grid-template-columns: repeat(4, 1fr);
		}
		.when {
			padding: 28px;
		}
		.steps-section {
			padding: 8px 0;
		}
		.steps-section .section-title {
			padding: 0;
		}
		.neighbours {
			padding: 28px;
		}
		.footnote {
			padding: 0;
		}
	}
</style>
