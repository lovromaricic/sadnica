<svelte:options namespace="svg" />

<script lang="ts">
	import { C } from '../../planting/palette';

	/**
	 * A measuring bracket with end ticks and a label. Horizontal when y1 === y2, else vertical.
	 * The label sits above a horizontal bracket, or beside a vertical one (`side`). `below` puts a horizontal label under the bracket.
	 */
	let {
		x1,
		y1,
		x2,
		y2,
		label,
		side = 'left',
		below = false,
		style
	}: { x1: number; y1: number; x2: number; y2: number; label: string; side?: 'left' | 'right'; below?: boolean; style: string } = $props();

	const horizontal = $derived(y1 === y2);
	const d = $derived(
		horizontal
			? `M${x1} ${y1}H${x2}M${x1} ${y1 - 5}v10M${x2} ${y1 - 5}v10`
			: `M${x1} ${y1}V${y2}M${x1 - 5} ${y1}h10M${x1 - 5} ${y2}h10`
	);
	const lx = $derived(horizontal ? (x1 + x2) / 2 : side === 'left' ? x1 - 10 : x1 + 9);
	const ly = $derived(horizontal ? (below ? y1 + 16 : y1 - 10) : (y1 + y2) / 2 + 4.5);
	const anchor = $derived(horizontal ? 'middle' : side === 'left' ? 'end' : 'start');
</script>

<g class="an" {style}>
	<path {d} stroke={C.ink} stroke-width="2" stroke-linecap="round" fill="none" />
	<text x={lx} y={ly} text-anchor={anchor}>{label}</text>
</g>
