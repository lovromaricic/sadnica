<svelte:options namespace="svg" />

<script lang="ts">
	import { C } from '../../planting/palette';
	import { SIDE, TOP } from '../../planting/geometry';

	/** Background: a bed seen from above, or a cross-section with sky, grass line and soil. */
	let { view }: { view: 'top' | 'side' } = $props();

	const TOP_SPECKS = [[18, 100], [60, 130], [110, 95], [150, 200], [205, 105], [250, 140], [275, 200], [40, 195], [190, 70], [120, 150], [225, 190], [95, 70]];
	const SIDE_SPECKS = [[15, 130], [50, 170], [120, 185], [150, 140], [215, 165], [250, 150], [290, 185], [200, 130], [70, 150], [230, 180]];
</script>

{#if view === 'top'}
	<rect width={TOP.width} height={TOP.height} rx="22" fill={C.bed} />
	{#each TOP_SPECKS as [cx, cy] (`${cx}-${cy}`)}<circle {cx} {cy} r="2.2" fill={C.bedSpeck} />{/each}
{:else}
	<rect width={SIDE.width} height={SIDE.height} rx="22" fill={C.sky} />
	<path d="M0 70H310V178a22 22 0 0 1-22 22H22a22 22 0 0 1-22-22Z" fill={C.soil} />
	{#each SIDE_SPECKS as [cx, cy] (`${cx}-${cy}`)}<circle {cx} {cy} r="2.2" fill={C.soilSpeck} />{/each}
	<rect x="0" y="66" width={SIDE.width} height="7" fill={C.grass} />
{/if}
