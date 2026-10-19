<script lang="ts">
	import { resolve } from '$app/paths';
	import { plants } from '../../data';
	import type { Plant } from '../../data/schema';
	import { t } from '../../i18n/hr';
	import { store } from '../../store.svelte';
	import { betterPlants, verdict } from '../../sun/logic';
	import { toast } from '../../toast.svelte';
	import Icon from '../Icon.svelte';
	import PlantArt from '../PlantArt.svelte';
	import HourBar from './HourBar.svelte';

	let {
		plant,
		sunny,
		month,
		approximate,
		onAgain
	}: { plant: Plant; sunny: number[]; month: number; approximate: boolean; onAgain: () => void } = $props();

	const v = $derived(verdict(plant, sunny.length));
	const better = $derived(v.good ? [] : betterPlants(plants, v.category, plant.id));
	const added = $derived(!!store.inGarden(plant.id));

	function add() {
		store.addPlant(plant.id);
		toast.show(t.toast.added(plant.name), { href: resolve('/moj-vrt'), label: t.toast.open });
	}
</script>

<section class="result">
	<div class="verdict" class:good={v.good}>
		<div class="art"><PlantArt art={plant.illustration} size={88} /></div>
		<span class="chip">{t.plant.sun[v.category]}</span>
		<h1>{v.title}</h1>
		<p class="text">{v.text}</p>
		<HourBar {sunny} />
		<p class="note">{t.sun.monthNote(month)}{approximate ? ` ${t.sun.approxNote}` : ''}</p>
	</div>

	{#if better.length}
		<section aria-labelledby="better-title">
			<h2 id="better-title">{t.sun.better}</h2>
			<ul class="better">
				{#each better as p (p.id)}
					<li>
						<a href={resolve('/biljke/[id]', { id: p.id })} style:--tile={p.illustration.bg}>
							<PlantArt art={p.illustration} size={52} />
							<strong>{p.name}</strong>
							<span>{t.plant.sun[p.sun]}</span>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<div class="actions">
		{#if added}
			<p class="in-garden"><Icon name="check" size={20} />{t.sun.inGarden}</p>
		{:else}
			<button type="button" class="btn btn-primary btn-block" onclick={add}>
				<Icon name="plus" size={20} />{v.good ? t.sun.add(plant.forms.acc) : t.sun.addAnyway(plant.forms.acc)}
			</button>
		{/if}
		<button type="button" class="btn btn-secondary btn-block" onclick={onAgain}>{t.sun.again}</button>
	</div>
</section>

<style>
	.result {
		display: grid;
		gap: 16px;
	}
	.verdict {
		display: grid;
		gap: 12px;
		padding: 22px;
		border-radius: var(--r-xl);
		background: var(--butter);
	}
	.verdict.good {
		background: var(--lime);
	}
	.art {
		justify-self: start;
	}
	.chip {
		justify-self: start;
		padding: 6px 12px;
		border-radius: 999px;
		background: var(--ink);
		color: var(--white);
		font-size: 0.8125rem;
		font-weight: 700;
	}
	h1 {
		font-size: clamp(1.75rem, 7vw, 2.5rem);
	}
	.text {
		font-size: 1.0625rem;
		color: var(--muted-2);
	}
	.note {
		font-size: 0.875rem;
		color: var(--muted-2);
	}
	h2 {
		margin-bottom: 10px;
	}
	.better {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 8px;
	}
	.better a {
		display: grid;
		justify-items: start;
		gap: 4px;
		height: 100%;
		padding: 12px;
		border-radius: var(--r-md);
		background: var(--tile);
		text-decoration: none;
	}
	.better strong {
		font-size: 0.9375rem;
	}
	.better span {
		font-size: 0.8125rem;
		color: var(--muted-2);
	}
	.actions {
		display: grid;
		gap: 10px;
	}
	.in-garden {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		min-height: 56px;
		border-radius: 999px;
		background: var(--ink);
		color: var(--lime);
		font-weight: 700;
	}
</style>
