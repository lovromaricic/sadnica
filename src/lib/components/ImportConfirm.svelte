<script lang="ts">
	import { plantsById } from '../data';
	import { t } from '../i18n/hr';
	import { store } from '../store.svelte';
	import type { GardenPayload, ImportMode } from '../transfer';
	import PlantArt from './PlantArt.svelte';

	/** Shows what is about to be imported and asks how; used by links and backup files. */
	let {
		payload,
		onImport,
		onCancel
	}: { payload: GardenPayload; onImport: (mode: ImportMode) => void; onCancel: () => void } = $props();

	const hasGarden = $derived(store.state.garden.length > 0);
	const plants = $derived(payload.garden.map((g) => plantsById.get(g.plantId)).filter((p) => !!p));
</script>

<section class="confirm" aria-labelledby="import-question">
	<h2 id="import-question">{t.importer.question}</h2>
	<p class="summary">{t.importer.summary(payload.garden.length, payload.city)}</p>
	{#if plants.length}
		<ul class="plants">
			{#each plants as plant (plant.id)}
				<li style:--tile={plant.illustration.bg}><PlantArt art={plant.illustration} size={28} />{plant.name}</li>
			{/each}
		</ul>
	{/if}
	{#if hasGarden}
		<p class="hint">{t.importer.mergeText}</p>
		<p class="hint">{t.importer.replaceText}</p>
		<div class="actions">
			<button type="button" class="btn btn-primary btn-block" onclick={() => onImport('merge')}>{t.importer.merge}</button>
			<button type="button" class="btn btn-secondary btn-block" onclick={() => onImport('replace')}>{t.importer.replace}</button>
			<button type="button" class="btn btn-block text-btn" onclick={onCancel}>{t.importer.cancel}</button>
		</div>
	{:else}
		<div class="actions">
			<button type="button" class="btn btn-primary btn-block" onclick={() => onImport('merge')}>{t.importer.importOnly}</button>
			<button type="button" class="btn btn-block text-btn" onclick={onCancel}>{t.importer.cancel}</button>
		</div>
	{/if}
</section>

<style>
	.confirm {
		display: grid;
		gap: 12px;
	}
	.summary {
		font-weight: 700;
		color: var(--muted-2);
	}
	.plants {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.plants li {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 12px 4px 6px;
		border-radius: 999px;
		background: var(--tile);
		font-weight: 600;
		font-size: 0.9375rem;
	}
	.hint {
		font-size: 0.9375rem;
		color: var(--muted-2);
	}
	.actions {
		display: grid;
		gap: 10px;
		margin-top: 4px;
	}
	.text-btn {
		border-color: transparent;
		background: transparent;
		min-height: 48px;
		text-decoration: underline;
		text-underline-offset: 4px;
		color: var(--muted-2);
	}
</style>
