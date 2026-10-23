<script lang="ts">
	import { stripMonths, type StripMonth } from '../calendar';
	import type { Plant, Region } from '../data/schema';
	import { MONTHS, MONTHS_SHORT, t } from '../i18n/hr';

	/**
	 * January to December for one plant: a planting row and a harvest (or flowering) row. Each month
	 * keeps its own cell under its name; neighbouring months of the same kind join into one stretch.
	 */
	let { plant, region, month }: { plant: Plant; region: Region; month: number } = $props();

	const flower = $derived(plant.category === 'flower');
	const months = $derived(stripMonths(plant, region));
	const anyProtected = $derived(months.some((m) => m.sow === 'protected'));

	type Row = 'sow' | 'harvest';
	/** What a cell shows: empty, planting, planting indoors or under fleece, or harvest. */
	const kind = (m: StripMonth | undefined, row: Row) =>
		!m ? 'none' : row === 'harvest' ? (m.harvest ? 'harvest' : 'none') : m.sow === 'none' ? 'none' : m.sow;
	const joins = (i: number, row: Row, step: -1 | 1) => {
		const k = kind(months[i], row);
		return k !== 'none' && kind(months[i + step], row) === k;
	};
</script>

<!-- Screen readers get one line per month; the grid below is the same information, drawn. -->
<ul class="sr-only">
	{#each months as m (m.month)}
		<li aria-current={m.month === month ? 'date' : undefined}>
			{t.plant.monthCell(MONTHS[m.month - 1], m.sow !== 'none', m.harvest, flower, m.sow === 'protected')}
		</li>
	{/each}
</ul>

<div class="strip" aria-hidden="true">
	<span class="corner"></span>
	{#each MONTHS_SHORT as short, i (short)}
		<span class="name" class:current={i + 1 === month}>{short}</span>
	{/each}
	{#each ['sow', 'harvest'] as const as row (row)}
		<span class="label">{row === 'sow' ? t.plant.rowSow : flower ? t.plant.rowBloom : t.plant.rowHarvest}</span>
		{#each months as m, i (m.month)}
			<span
				class="cell {kind(m, row)}"
				class:join-left={joins(i, row, -1)}
				class:join-right={joins(i, row, 1)}
				class:current={m.month === month}
			></span>
		{/each}
	{/each}
</div>

<ul class="legend">
	<li><span class="swatch open"></span>{t.plant.legendSow}</li>
	{#if anyProtected}<li><span class="swatch protected"></span>{t.plant.legendProtected}</li>{/if}
	<li><span class="swatch harvest"></span>{flower ? t.plant.legendBloom : t.plant.legendHarvest}</li>
</ul>

<style>
	/* Phones: row labels above each row, so the twelve months get the full width. */
	.strip {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		row-gap: 6px;
		align-items: center;
	}
	.corner {
		display: none;
	}
	.name {
		font-size: 0.6875rem;
		font-weight: 600;
		text-align: center;
		color: var(--dark-muted);
		letter-spacing: -0.02em;
	}
	.name.current {
		color: var(--lime);
		font-weight: 800;
	}
	.label {
		grid-column: 1 / -1;
		margin-top: 4px;
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--white);
	}
	.cell {
		height: 30px;
		margin: 0 1.5px;
		border-radius: 8px;
		background: var(--dark-line);
	}
	.cell.open {
		background: var(--lime);
	}
	.cell.protected,
	.swatch.protected {
		background-color: rgb(217 242 166 / 0.45);
		background-image: repeating-linear-gradient(135deg, rgb(20 32 26 / 0.28) 0 4px, transparent 4px 8px);
	}
	.cell.harvest {
		background: var(--gold);
	}
	/* Neighbouring months of the same kind read as one stretch. */
	.cell.join-left {
		margin-left: 0;
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
	}
	.cell.join-right {
		margin-right: 0;
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}
	.cell.current {
		box-shadow: inset 0 0 0 2px var(--white);
	}
	.legend {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 8px 16px;
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
	.swatch {
		flex: none;
		width: 22px;
		height: 12px;
		border-radius: 4px;
	}
	.swatch.open {
		background: var(--lime);
	}
	.swatch.harvest {
		background: var(--gold);
	}
	/* Wider screens: row labels to the left of each row. */
	@media (min-width: 600px) {
		.strip {
			grid-template-columns: 64px repeat(12, minmax(0, 1fr));
			row-gap: 8px;
		}
		.corner {
			display: block;
		}
		.label {
			grid-column: auto;
			margin-top: 0;
		}
	}
	@media (min-width: 900px) {
		.name {
			font-size: 0.8125rem;
		}
		.cell {
			height: 36px;
		}
	}
</style>
