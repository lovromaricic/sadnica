<script lang="ts">
	import { addToGarden } from '../gardenActions';
	import { resolve } from '$app/paths';
	import type { Plant } from '../data/schema';
	import { t } from '../i18n/hr';
	import { store } from '../store.svelte';
	import { toast } from '../toast.svelte';
	import Icon from './Icon.svelte';

	let { plant }: { plant: Plant } = $props();
	const added = $derived(!!store.inGarden(plant.id));

	function add() {
		if (added) return;
		addToGarden(plant);
	}
</script>

<button
	type="button"
	class="icon-btn add"
	class:added
	aria-label={added ? t.added(plant.name) : t.add(plant.name)}
	aria-pressed={added}
	onclick={add}
>
	<Icon name={added ? 'check' : 'plus'} size={22} />
</button>

<style>
	.add {
		position: relative;
		z-index: 1;
		width: 48px;
		height: 48px;
		background: var(--white);
		transition: transform 0.15s ease;
	}
	@media (hover: hover) {
		.add:hover {
			transform: scale(1.06);
		}
	}
	.added {
		background: var(--ink);
		color: var(--lime);
		cursor: default;
	}
	@media (hover: hover) {
		.added:hover {
			transform: none;
		}
	}
</style>
