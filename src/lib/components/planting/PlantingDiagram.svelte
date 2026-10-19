<script lang="ts" module>
	let instances = 0;
</script>

<script lang="ts">
	import type { Plant } from '../../data/schema';
	import { t } from '../../i18n/hr';
	import { ariaLabel, viewText, type View } from '../../planting/content';
	import type { DiagramPlanting } from '../../planting/geometry';
	import BroadcastPlanting from './BroadcastPlanting.svelte';
	import ClovePlanting from './ClovePlanting.svelte';
	import RowSeedPlanting from './RowSeedPlanting.svelte';
	import SaplingPlanting from './SaplingPlanting.svelte';
	import TransplantPlanting from './TransplantPlanting.svelte';

	/** Top and side view of how a plant goes into the ground, as a looping animation. */
	let { plant, planting }: { plant: Plant; planting: DiagramPlanting } = $props();

	const VIEWS: View[] = ['top', 'side'];
	const id = `planting-${++instances}`;
	let view = $state<View>('top');
	const tabs: HTMLButtonElement[] = [];

	// Keyframe names are unique per diagram and view; the old view's styles leave with its picture.
	const prefix = $derived(`${id.replace('-', '')}${view}k`);
	const label = $derived(ariaLabel(plant, planting, view));

	function onkeydown(e: KeyboardEvent) {
		if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return;
		e.preventDefault();
		const i = VIEWS.indexOf(view);
		const next = e.key === 'Home' ? 0 : e.key === 'End' ? VIEWS.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + VIEWS.length) % VIEWS.length;
		view = VIEWS[next];
		tabs[next]?.focus();
	}
</script>

<div class="diagram">
	<div class="tabs" role="tablist" aria-label={t.planting.tabs}>
		{#each VIEWS as v, i (v)}
			<button
				type="button"
				role="tab"
				id="{id}-tab-{v}"
				aria-selected={view === v}
				aria-controls="{id}-panel"
				tabindex={view === v ? 0 : -1}
				bind:this={tabs[i]}
				onclick={() => (view = v)}
				{onkeydown}>{t.planting[v]}</button
			>
		{/each}
	</div>
	<div class="panel" id="{id}-panel" role="tabpanel" aria-labelledby="{id}-tab-{view}">
		<!-- Switching views remounts the picture, so its animation starts from the beginning. -->
		{#key view}
			<div class="art">
				{#if planting.method === 'clove'}
					<ClovePlanting {planting} {view} {label} {prefix} />
				{:else if planting.method === 'row-seed'}
					<RowSeedPlanting {planting} {view} {label} {prefix} />
				{:else if planting.method === 'broadcast'}
					<BroadcastPlanting {planting} {view} {label} {prefix} />
				{:else if planting.method === 'transplant'}
					<TransplantPlanting {planting} {view} {label} {prefix} />
				{:else}
					<SaplingPlanting {planting} {view} {label} {prefix} />
				{/if}
			</div>
		{/key}
		<p class="text">{viewText(plant, planting, view)}</p>
	</div>
</div>

<style>
	.diagram {
		display: grid;
		gap: 14px;
	}
	.tabs {
		display: flex;
		gap: 4px;
		padding: 4px;
		border-radius: 26px;
		background: var(--off);
	}
	.tabs button {
		flex: 1;
		min-height: 44px;
		border: 0;
		border-radius: 22px;
		background: transparent;
		color: var(--ink);
		font: inherit;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
	}
	.tabs button[aria-selected='true'] {
		background: var(--ink);
		color: var(--white);
	}
	.panel {
		display: grid;
		gap: 14px;
	}
	.art :global(svg) {
		display: block;
		width: 100%;
		height: auto;
	}
	.art :global(text) {
		font-family: var(--font-body);
		font-size: 13px;
		font-weight: 700;
		fill: var(--ink);
	}
	.art :global(text.small) {
		font-size: 12px;
		font-weight: 600;
	}
	.art :global(.an) {
		opacity: 0;
	}
	.art :global(.pop) {
		transform-box: fill-box;
		transform-origin: center;
	}
	.text {
		min-height: 3lh;
		color: var(--ink);
	}
	@media (prefers-reduced-motion: reduce) {
		/* The finished picture: everything that stays, with every label. */
		.art :global(.an) {
			animation: none !important;
			opacity: var(--end, 1);
		}
	}
</style>
