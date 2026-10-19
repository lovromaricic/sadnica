<script lang="ts">
	import type { Plant, Region } from '../data/schema';
	import { MONTHS, MONTHS_SHORT, t } from '../i18n/hr';
	import { isHarvestMonth, isSowMonth } from '../season';

	let { plant, region, month }: { plant: Plant; region: Region; month: number } = $props();
</script>

<ol class="months">
	{#each MONTHS_SHORT as short, i (short)}
		{@const m = i + 1}
		{@const sow = isSowMonth(plant.sow[region], m)}
		{@const harvest = isHarvestMonth(plant.harvest[region], m)}
		<li class:current={m === month} aria-label={t.plant.monthCell(MONTHS[i], sow, harvest)} aria-current={m === month ? 'date' : undefined}>
			<span class="marker" aria-hidden="true"></span>
			<span class="name" aria-hidden="true">{short}</span>
			<span class="cell sow" class:on={sow} aria-hidden="true">{sow ? 'S' : ''}</span>
			<span class="cell harvest" class:on={harvest} aria-hidden="true">{harvest ? 'B' : ''}</span>
		</li>
	{/each}
</ol>
<ul class="legend">
	<li><span class="dot sow-dot">S</span>{t.plant.legendSow}</li>
	<li><span class="dot harvest-dot">B</span>{t.plant.legendHarvest}</li>
</ul>

<style>
	.months {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		gap: 3px;
	}
	li {
		display: grid;
		gap: 4px;
		justify-items: stretch;
		text-align: center;
	}
	.marker {
		height: 8px;
		width: 8px;
		justify-self: center;
		border-radius: 50%;
	}
	.current .marker {
		background: var(--lime);
	}
	.name {
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--dark-muted);
		letter-spacing: -0.02em;
	}
	.current .name {
		color: var(--white);
		font-weight: 800;
	}
	.cell {
		display: grid;
		place-items: center;
		height: 30px;
		border-radius: 9px;
		background: var(--dark-line);
		font-size: 0.75rem;
		font-weight: 800;
		color: var(--ink);
	}
	.sow.on {
		background: var(--lime);
	}
	.harvest.on {
		background: var(--gold);
	}
	.current .cell {
		box-shadow: inset 0 0 0 2px var(--white);
	}
	.legend {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		margin: 14px 0 0;
		padding: 0;
		font-size: 0.875rem;
		color: var(--dark-muted);
	}
	.legend li {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.dot {
		display: grid;
		place-items: center;
		width: 22px;
		height: 22px;
		border-radius: 7px;
		font-size: 0.6875rem;
		font-weight: 800;
		color: var(--ink);
	}
	.sow-dot {
		background: var(--lime);
	}
	.harvest-dot {
		background: var(--gold);
	}
	@media (min-width: 900px) {
		.months {
			gap: 6px;
		}
		.name {
			font-size: 0.8125rem;
		}
		.cell {
			height: 36px;
		}
	}
</style>
