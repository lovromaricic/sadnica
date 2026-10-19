<script lang="ts">
	import { t } from '../../i18n/hr';
	import { SUN_HOURS } from '../../sun/logic';

	let { sunny }: { sunny: readonly number[] } = $props();
</script>

<div class="hour-bar" role="img" aria-label={t.sun.hourBar(sunny.length)}>
	{#each SUN_HOURS as hour (hour)}
		<div class="col">
			<span class="cell" class:on={sunny.includes(hour)}></span>
			<span class="label">{hour}</span>
		</div>
	{/each}
</div>

<style>
	.hour-bar {
		display: grid;
		grid-template-columns: repeat(9, minmax(0, 1fr));
		gap: 4px;
	}
	.col {
		display: grid;
		gap: 4px;
		text-align: center;
	}
	.cell {
		height: 28px;
		border-radius: 9px;
		background: rgb(20 32 26 / 0.12);
	}
	.cell.on {
		background: var(--gold);
	}
	.label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--muted-2);
	}
</style>
