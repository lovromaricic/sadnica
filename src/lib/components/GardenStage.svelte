<script lang="ts">
	import { rules } from '../data';
	import type { Plant } from '../data/schema';
	import { STAGE_PROGRESS, harvestText, stageLabel, isoDay, nextStage, nextStepText, previousStage, stageDateText } from '../garden';
	import { STAGES } from '../storage';
	import { t } from '../i18n/hr';
	import { store } from '../store.svelte';
	import type { GardenItem } from '../storage';
	import { today } from '../today';
	import Icon from './Icon.svelte';

	/** Garden stage of a plant, with the same progress and next step as its Moj vrt card. */
	let { plant, item }: { plant: Plant; item: GardenItem } = $props();

	const next = $derived(nextStage(item.stage));
	const previous = $derived(previousStage(item.stage));
	const stageName = $derived(stageLabel(item.stage, plant));
	const dated = $derived(stageDateText(item, today, plant));
	const harvest = $derived(harvestText(item, plant, store.state.region, today));

	let editing = $state(false);
	const inputId = $derived(`stage-date-${plant.id}`);
	/**
	 * A stage cannot start after today, or before the growing stage before it. The day it was
	 * added does not count: a plant may be added to the app after it was sown.
	 */
	const minDay = $derived(
		STAGES.slice(1, STAGES.indexOf(item.stage))
			.map((s) => item.stageDates[s])
			.filter(Boolean)
			.pop()
	);
	const maxDay = isoDay(today);

	function onDate(e: Event) {
		const value = (e.currentTarget as HTMLInputElement).value;
		if (value && value <= maxDay && (!minDay || value >= minDay)) store.setStageDate(plant.id, value);
	}
</script>

<section class="stage-card" aria-labelledby="stage-title-{plant.id}">
	<div class="head">
		<h2 id="stage-title-{plant.id}"><Icon name="check" size={18} />{t.garden.stageTitle}</h2>
		<span class="chip" class:ready={item.stage === 'ready'}>{stageName}</span>
	</div>
	<div class="bar" aria-hidden="true"><span style:width="{STAGE_PROGRESS[item.stage]}%"></span></div>
	<p class="sr-only">{t.garden.progress(stageName)}</p>
	<!-- Always offer the date link, so plants saved before dates existed can get one. -->
	<div class="dates">
		{#if dated}<span>{dated}</span>{/if}
		{#if harvest}<span class="harvest">{harvest}</span>{/if}
		{#if !editing}
			<button type="button" class="link" onclick={() => (editing = true)}>{t.garden.changeDate}</button>
		{/if}
	</div>
	{#if editing}
		<div class="date-edit">
			<label for={inputId}>{t.garden.dateLabel(stageName)}</label>
			<input
				id={inputId}
				type="date"
				value={item.stageDates[item.stage] ?? maxDay}
				min={minDay}
				max={maxDay}
				onchange={onDate}
			/>
			<button type="button" class="advance" onclick={() => (editing = false)}>{t.garden.dateDone}</button>
		</div>
	{/if}
	<p class="next">{nextStepText(item.stage, plant, store.state.region, today, rules)}</p>
	<div class="buttons">
		{#if next}
			<button type="button" class="advance" onclick={() => store.setStage(plant.id, next)}>
				<Icon name="arrowUp" size={18} />{t.garden.advance(stageLabel(next, plant))}
			</button>
		{/if}
		{#if previous}
			<button type="button" class="undo" onclick={() => store.setStage(plant.id, previous)}>
				{t.garden.undo(stageLabel(previous, plant))}
			</button>
		{/if}
	</div>
</section>

<style>
	.stage-card {
		display: grid;
		gap: 10px;
		padding: 16px;
		border-radius: var(--r-md);
		background: var(--white);
	}
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}
	h2 {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-family: var(--font-body);
		font-size: 0.9375rem;
		font-weight: 700;
		letter-spacing: 0;
	}
	.chip {
		padding: 5px 11px;
		border-radius: 999px;
		background: var(--lime);
		font-size: 0.8125rem;
		font-weight: 700;
		white-space: nowrap;
	}
	.chip.ready {
		background: var(--ink);
		color: var(--lime);
	}
	.bar {
		height: 8px;
		border-radius: 999px;
		background: var(--off);
		overflow: hidden;
	}
	.bar span {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: var(--ink);
		transition: width 0.3s ease;
	}
	.dates {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 2px 10px;
		font-size: 0.875rem;
		font-weight: 600;
	}
	.harvest {
		color: #7a5a00;
	}
	.link {
		min-height: 32px;
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--muted-2);
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.date-edit {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		padding: 10px;
		border-radius: var(--r-sm);
		background: var(--ground);
	}
	.date-edit label {
		flex-basis: 100%;
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--muted-2);
	}
	.date-edit input {
		min-height: 44px;
		padding: 0 12px;
		border: 2px solid var(--border);
		border-radius: 12px;
		background: var(--white);
		font-size: 1rem;
	}
	.date-edit input:focus {
		border-color: var(--ink);
		outline: none;
	}
	.next {
		font-size: 0.9375rem;
		color: var(--muted-2);
	}
	.buttons {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px 12px;
	}
	.advance {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 44px;
		padding: 0 16px;
		border-radius: 999px;
		border: 2px solid var(--ink);
		background: var(--white);
		font-weight: 700;
		font-size: 0.9375rem;
	}
	@media (hover: hover) {
		.advance:hover {
			background: var(--lime);
		}
	}
	.undo {
		min-height: 44px;
		padding: 0 4px;
		border: 0;
		background: transparent;
		color: var(--muted-2);
		font-size: 0.875rem;
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
