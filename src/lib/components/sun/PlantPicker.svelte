<script lang="ts">
	import { plants, plantsById } from '../../data';
	import type { Plant } from '../../data/schema';
	import { t } from '../../i18n/hr';
	import { matchesQuery } from '../../search';
	import { store } from '../../store.svelte';
	import Icon from '../Icon.svelte';
	import PlantArt from '../PlantArt.svelte';

	let { onPick }: { onPick: (plant: Plant) => void } = $props();

	const garden = $derived(
		store.state.garden.map((g) => plantsById.get(g.plantId)).filter((p): p is Plant => !!p)
	);
	const others = $derived(plants.filter((p) => !garden.includes(p)));

	// Same search as the catalogue: case, diacritics and synonyms ("paradajz") all match.
	let query = $state('');
	const gardenHits = $derived(garden.filter((p) => matchesQuery(p, query)));
	const otherHits = $derived(others.filter((p) => matchesQuery(p, query)));
</script>

{#snippet list(items: Plant[])}
	<ul class="grid">
		{#each items as plant (plant.id)}
			<li>
				<button type="button" class="tile" style:--tile={plant.illustration.bg} onclick={() => onPick(plant)}>
					<PlantArt art={plant.illustration} size={56} />
					<strong>{plant.name}</strong>
					<span>{t.plant.sun[plant.sun]}</span>
				</button>
			</li>
		{/each}
	</ul>
{/snippet}

<h1>{t.sun.pickTitle}</h1>
<p class="lead">{t.sun.pickText}</p>
<label class="search">
	<span class="sr-only">{t.sun.searchLabel}</span>
	<Icon name="search" size={20} />
	<input type="search" bind:value={query} placeholder={t.catalog.searchPlaceholder} autocomplete="off" />
</label>
{#if gardenHits.length}
	<h2>{t.sun.fromGarden}</h2>
	{@render list(gardenHits)}
{/if}
{#if otherHits.length}
	<h2>{t.sun.allPlants}</h2>
	{@render list(otherHits)}
{/if}
{#if !gardenHits.length && !otherHits.length}
	<p class="empty" role="status">{t.sun.noMatch}</p>
{/if}

<style>
	h1 {
		font-size: clamp(1.75rem, 7vw, 2.5rem);
	}
	.lead {
		margin: 8px 0 20px;
		color: var(--muted-2);
		font-size: 1.0625rem;
	}
	.search {
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 56px;
		margin-bottom: 4px;
		padding: 0 20px;
		border-radius: 999px;
		background: var(--white);
		border: 2px solid var(--border);
	}
	.search:focus-within {
		border-color: var(--ink);
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
	.empty {
		margin-top: 16px;
		color: var(--muted);
	}
	h2 {
		font-size: 1.125rem;
		margin: 16px 0 10px;
	}
	.grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 10px;
	}
	.tile {
		display: grid;
		justify-items: start;
		gap: 4px;
		width: 100%;
		min-height: 140px;
		padding: 14px;
		border: 2px solid transparent;
		border-radius: var(--r-md);
		background: var(--tile);
		text-align: left;
	}
	.tile:hover {
		border-color: var(--ink);
	}
	.tile strong {
		font-family: var(--font-head);
		font-size: 1.125rem;
		letter-spacing: -0.02em;
	}
	.tile span {
		font-size: 0.875rem;
		color: var(--muted-2);
	}
</style>
