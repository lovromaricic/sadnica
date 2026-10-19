<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { SvelteSet } from 'svelte/reactivity';
	import AddButton from '#lib/components/AddButton.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import PlantArt from '#lib/components/PlantArt.svelte';
	import StatusChip from '#lib/components/StatusChip.svelte';
	import { plants, rules } from '#lib/data/index.ts';
	import { pluralPlants, t } from '#lib/i18n/hr.ts';
	import { FILTERS, filterCatalog, filtersParam, initialFilters, type FilterKey } from '#lib/catalog.ts';
	import { isFrostNear, withSeason } from '#lib/season.ts';
	import { navContext } from '#lib/navContext.svelte.ts';
	import { store } from '#lib/store.svelte.ts';
	import { chipKind, timingText } from '#lib/timing.ts';
	import { today } from '#lib/today.ts';

	// Search and filters live in the address (?q=…&filtri=…), so Back from a plant restores them.
	const initial = new URLSearchParams(window.location.search);
	let query = $state(initial.get('q') ?? '');
	// Balcony gardeners start with "Za balkon" on.
	const place = store.state.place;
	const active = new SvelteSet<FilterKey>(initialFilters(initial, place));
	// "Vidi sve u sezoni" links here with ?sezona=1.
	if (initial.has('sezona')) active.add('season');

	$effect(() => {
		const params = new URLSearchParams();
		if (query.trim()) params.set('q', query.trim());
		const filters = filtersParam(active, place);
		if (filters !== null) params.set('filtri', filters);
		const href = `${resolve('/biljke')}${params.size ? `?${params}` : ''}`;
		if (href === window.location.pathname + window.location.search) return;
		try {
			replaceState(href, {});
			navContext.replaceTabHref(href);
		} catch {
			// The router is not ready on the very first render; the next change will sync.
		}
	});

	const region = $derived(store.state.region);
	const frostNear = $derived(isFrostNear(region, today, rules));
	const items = $derived(withSeason(plants, region, today, rules));

	const results = $derived(filterCatalog(items, query, active));

	function toggle(key: FilterKey) {
		if (active.has(key)) active.delete(key);
		else active.add(key);
	}

	function clearAll() {
		query = '';
		active.clear();
	}
</script>

<svelte:head>
	<title>{t.catalog.title} · {t.appName}</title>
</svelte:head>

<div class="page catalog">
	<aside class="controls">
		<div class="title">
			<h1>{t.catalog.title}</h1>
			<p class="count" aria-live="polite">{pluralPlants(results.length)}</p>
		</div>

		<label class="search">
			<span class="sr-only">{t.catalog.searchLabel}</span>
			<Icon name="search" size={20} />
			<input type="search" bind:value={query} placeholder={t.catalog.searchPlaceholder} autocomplete="off" />
		</label>

		<div class="filters" role="group" aria-label={t.catalog.filtersLabel}>
			{#each FILTERS as key (key)}
				<button type="button" class="filter" aria-pressed={active.has(key)} onclick={() => toggle(key)}>
					<span class="box" aria-hidden="true"><Icon name="check" size={14} /></span>
					{t.catalog.filters[key]}
				</button>
			{/each}
		</div>

		<div class="tip">
			<strong>{t.catalog.tipTitle}</strong>
			<p>{t.catalog.tip}</p>
		</div>
	</aside>

	<section class="results" aria-label={t.catalog.title}>
		{#if results.length}
			<ul class="grid">
				{#each results as { plant, season } (plant.id)}
					{@const kind = chipKind(season)}
					<li class="card" class:off={kind === 'off'} style:--tile={plant.illustration.bg}>
						<div class="card-top">
							<StatusChip {kind} />
							<AddButton {plant} />
						</div>
						<div class="card-art"><PlantArt art={plant.illustration} size={88} /></div>
						<a class="card-link" href={resolve('/biljke/[id]', { id: plant.id })}>
							<strong>{plant.name}</strong>
							<span>{timingText(season, frostNear)}</span>
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<div class="empty">
				<h2>{t.catalog.emptyTitle}</h2>
				<p>{t.catalog.emptyText}</p>
				<button type="button" class="btn btn-secondary" onclick={clearAll}>{t.catalog.clear}</button>
			</div>
		{/if}
	</section>
</div>

<style>
	.catalog {
		display: grid;
		gap: 16px;
	}
	.controls {
		display: grid;
		gap: 14px;
		min-width: 0;
	}
	.title {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px;
		padding: 4px 4px 0;
	}
	.count {
		color: var(--muted);
		font-weight: 600;
		white-space: nowrap;
	}
	.search {
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 56px;
		padding: 0 20px;
		border-radius: 999px;
		background: var(--white);
		border: 2px solid var(--border);
	}
	.search:focus-within {
		border-color: var(--ink);
	}
	.search:has(input:focus-visible) {
		outline: 3px solid var(--focus);
		outline-offset: 3px;
	}
	.search input {
		flex: 1;
		min-width: 0;
		min-height: 52px;
		border: 0;
		outline: 0;
		background: transparent;
		font-size: 1.0625rem;
	}
	.filters {
		display: flex;
		gap: 8px;
		overflow-x: auto;
		overscroll-behavior-x: contain;
		-webkit-overflow-scrolling: touch;
		margin: 0 calc(-1 * var(--gutter));
		padding: 2px var(--gutter) 6px;
		scrollbar-width: none;
	}
	.filters::-webkit-scrollbar {
		display: none;
	}
	.filter {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		flex: none;
		min-height: 44px;
		padding: 0 18px;
		border-radius: 999px;
		border: 2px solid var(--ink);
		background: transparent;
		font-weight: 700;
		font-size: 0.9375rem;
		white-space: nowrap;
	}
	.filter[aria-pressed='true'] {
		background: var(--ink);
		color: var(--white);
	}
	.box {
		display: none;
	}
	.tip {
		display: none;
	}

	.grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 10px;
	}
	.card {
		position: relative;
		display: grid;
		gap: 6px;
		padding: 12px 12px 16px;
		border-radius: var(--r-md);
		background: var(--tile);
	}
	.card.off {
		background: var(--off);
	}
	.card-top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 6px;
	}
	.card-top :global(.add) {
		width: 44px;
		height: 44px;
	}
	.card-art {
		justify-self: center;
	}
	.card-link {
		display: grid;
		gap: 2px;
		text-decoration: none;
	}
	.card-link::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
	}
	.card-link:focus-visible {
		outline: none;
	}
	.card-link:focus-visible::after {
		outline: 3px solid var(--focus);
		outline-offset: 2px;
	}
	.card-link strong {
		font-family: var(--font-head);
		font-size: 1.25rem;
		letter-spacing: -0.02em;
		line-height: 1.1;
	}
	.card-link span {
		color: var(--muted-2);
		font-size: 0.875rem;
	}

	.empty {
		display: grid;
		justify-items: start;
		gap: 10px;
		padding: 32px 24px;
		border-radius: var(--r-xl);
		background: var(--white);
	}
	.empty p {
		color: var(--muted);
	}

	@media (min-width: 900px) {
		.catalog {
			grid-template-columns: 340px 1fr;
			align-items: start;
			gap: 16px;
		}
		.controls {
			position: sticky;
			top: 16px;
			padding: 32px 28px;
			border-radius: var(--r-xl);
			background: var(--lime);
			gap: 18px;
		}
		.title {
			flex-direction: column;
			gap: 6px;
			padding: 0;
		}
		.title h1 {
			font-size: 3rem;
		}
		.count {
			color: var(--muted-2);
		}
		.search {
			border-color: transparent;
		}
		.filters {
			flex-direction: column;
			margin: 0;
			padding: 0;
			gap: 2px;
			overflow: visible;
		}
		.filter {
			border: 0;
			padding: 0 10px;
			min-height: 44px;
			border-radius: 14px;
			font-size: 1rem;
		}
		.filter:hover {
			background: rgb(255 255 255 / 0.5);
		}
		.filter[aria-pressed='true'] {
			background: transparent;
			color: var(--ink);
		}
		.box {
			display: grid;
			place-items: center;
			width: 24px;
			height: 24px;
			border-radius: 8px;
			border: 2px solid var(--ink);
			color: transparent;
			background: var(--white);
		}
		.filter[aria-pressed='true'] .box {
			background: var(--ink);
			color: var(--lime);
		}
		.tip {
			display: grid;
			gap: 4px;
			padding: 16px;
			border-radius: var(--r-sm);
			background: rgb(255 255 255 / 0.6);
			font-size: 0.9375rem;
		}
		.grid {
			grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
			gap: 14px;
		}
		.card {
			padding: 18px 18px 22px;
			border-radius: var(--r-lg);
			gap: 10px;
		}
		.card-art :global(svg) {
			width: 140px;
			height: 140px;
		}
		.card-link strong {
			font-size: 1.5rem;
		}
		.card-link span {
			font-size: 0.9375rem;
		}
	}
</style>
