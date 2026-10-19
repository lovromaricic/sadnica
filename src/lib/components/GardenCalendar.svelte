<script lang="ts">
	import { calendarRows, monthsFrom } from '../calendar';
	import type { Plant, Region } from '../data/schema';
	import { MONTHS, MONTHS_SHORT, t } from '../i18n/hr';
	import PlantArt from './PlantArt.svelte';

	/** Every garden plant's sowing and harvest months, starting with this month. */
	let { plants, region, month }: { plants: Plant[]; region: Region; month: number } = $props();

	const months = $derived(monthsFrom(month));
	const rows = $derived(calendarRows(plants, region, months));
</script>

<section class="calendar dark" aria-labelledby="calendar-title">
	<h2 id="calendar-title">{t.calendar.title}</h2>
	<p class="lead">{t.calendar.text}</p>
	<!-- Rows are restyled as grids for small screens, so table roles are spelled out for screen readers. -->
	<!-- svelte-ignore a11y_no_redundant_roles -->
	<table role="table">
		<caption class="sr-only">{t.calendar.caption}</caption>
		<!-- svelte-ignore a11y_no_redundant_roles -->
		<thead role="rowgroup">
			<!-- svelte-ignore a11y_no_redundant_roles -->
			<tr role="row">
				<th scope="col" role="columnheader" class="sr-only">{t.calendar.plant}</th>
				{#each months as m, i (m)}
					<th scope="col" role="columnheader" class:current={i === 0}><abbr title={MONTHS[m - 1]}>{MONTHS_SHORT[m - 1]}</abbr></th>
				{/each}
			</tr>
		</thead>
		<!-- svelte-ignore a11y_no_redundant_roles -->
		<tbody role="rowgroup">
			{#each rows as row (row.plant.id)}
				<!-- svelte-ignore a11y_no_redundant_roles -->
			<tr role="row">
					<th scope="row" role="rowheader" class="name">
						<PlantArt art={row.plant.illustration} size={22} />
						<span>{row.plant.name}</span>
					</th>
					{#each row.cells as cell, i (cell.month)}
						<td role="cell" class:current={i === 0}>
							<span class="sr-only">{t.calendar.cell(MONTHS[cell.month - 1], cell.sow, cell.harvest, row.plant.category === 'flower')}</span>
							<span class="cell" aria-hidden="true">
								<span class="half sow" class:on={cell.sow}>{cell.sow ? 'S' : ''}</span>
								<span class="half harvest" class:on={cell.harvest}>{cell.harvest ? (row.plant.category === 'flower' ? 'C' : 'B') : ''}</span>
							</span>
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
	<ul class="legend">
		<li><span class="dot sow-dot">S</span>{t.plant.legendSow}</li>
		<li><span class="dot harvest-dot">B</span>{t.plant.legendHarvest}</li>
		{#if plants.some((p) => p.category === 'flower')}<li><span class="dot harvest-dot">C</span>{t.plant.legendBloom}</li>{/if}
	</ul>
</section>

<style>
	.calendar {
		padding: 22px 14px;
		border-radius: var(--r-xl);
	}
	h2 {
		color: var(--white);
		padding: 0 4px;
	}
	.lead {
		margin: 4px 4px 14px;
		color: var(--dark-muted);
		font-size: 0.9375rem;
	}
	table {
		width: 100%;
		border-collapse: separate;
		border-spacing: 2px 6px;
		table-layout: fixed;
	}
	thead th {
		font-size: 0.625rem;
		font-weight: 600;
		color: var(--dark-muted);
		text-align: center;
	}
	thead th.current {
		color: var(--lime);
		font-weight: 800;
	}
	abbr {
		text-decoration: none;
	}
	/* On phones the plant name sits on its own line above its months. */
	tbody tr {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		gap: 2px;
		margin-bottom: 8px;
	}
	thead tr {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		gap: 2px;
	}
	.name {
		grid-column: 1 / -1;
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 0 2px 2px;
		font-size: 0.875rem;
		font-weight: 700;
		text-align: left;
		color: var(--white);
	}
	.name :global(svg) {
		flex: none;
	}
	td {
		padding: 0;
	}
	.cell {
		display: grid;
		grid-template-rows: 1fr 1fr;
		gap: 2px;
		height: 34px;
	}
	td.current .cell {
		outline: 2px solid var(--white);
		outline-offset: 1px;
		border-radius: 6px;
	}
	.half {
		display: grid;
		place-items: center;
		border-radius: 5px;
		background: var(--dark-line);
		font-size: 0.5625rem;
		font-weight: 800;
		color: var(--ink);
	}
	.sow.on {
		background: var(--lime);
	}
	.harvest.on {
		background: var(--gold);
	}
	.legend {
		list-style: none;
		display: flex;
		gap: 16px;
		margin: 8px 4px 0;
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
		.calendar {
			padding: 32px;
		}
		/* Desktop: name column on the left of each row. */
		thead tr,
		tbody tr {
			grid-template-columns: 180px repeat(12, minmax(0, 1fr));
			gap: 4px;
		}
		thead th.sr-only {
			position: static;
			width: auto;
			height: auto;
			margin: 0;
			clip: auto;
			overflow: visible;
			white-space: normal;
			visibility: hidden;
		}
		.name {
			grid-column: auto;
		}
		thead th {
			font-size: 0.8125rem;
		}
		.cell {
			height: 40px;
		}
		.half {
			font-size: 0.6875rem;
		}
	}
</style>
