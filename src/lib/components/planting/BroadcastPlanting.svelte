<script lang="ts">
	import type { Planting } from '../../data/schema';
	import { formatCm } from '../../planting/format';
	import { broadcastSide, broadcastTop, SIDE, SURFACE, TOP } from '../../planting/geometry';
	import { C } from '../../planting/palette';
	import { COVER_STILL, Timeline } from '../../planting/timeline';
	import Measure from './Measure.svelte';
	import Soil from './Soil.svelte';

	/** Seed scattered over the bed, then thinned to a loose grid of small rosettes. */
	let { planting: p, view, label, prefix }: { planting: Extract<Planting, { method: 'broadcast' }>; view: 'top' | 'side'; label: string; prefix: string } =
		$props();

	const BATCHES = 7;

	const scene = $derived.by(() => {
		const tl = new Timeline(prefix);
		if (view === 'top') {
			const g = broadcastTop(p);
			const seeds = g.scattered.map((s, i) => ({ ...s, style: tl.flash(3 + (i % BATCHES) * 2.5, 52) }));
			const plants = g.grid.map((pt) => ({ ...pt, style: tl.pop(55) }));
			return { kind: 'top' as const, g, seeds, plants, measure: tl.fade(65), css: tl.css() };
		}
		const g = broadcastSide(p);
		const seeds = g.seeds.map((s, i) => ({ ...s, style: tl.drop(4 + (i % BATCHES) * 3) }));
		return { kind: 'side' as const, g, seeds, depth: tl.fade(30), cover: tl.fade(36, { to: 0.95, end: COVER_STILL }), css: tl.css() };
	});
</script>

{#if scene.kind === 'top'}
	{@const { g } = scene}
	<svg viewBox="0 0 {TOP.width} {TOP.height}" role="img" aria-label={label}>
		{@html `<style>${scene.css}</style>`}
		<Soil view="top" />
		{#each scene.seeds as s, i (i)}
			<ellipse class="an" style={s.style} cx={s.x} cy={s.y} rx="2.4" ry="3.2" fill={C.seed} transform="rotate({s.angle} {s.x} {s.y})" />
		{/each}
		{#each scene.plants as s, i (i)}
			<g class="an pop" style={s.style} fill={C.leaf} stroke={C.leafLine} stroke-width="1.3">
				<ellipse cx={s.x - 4} cy={s.y} rx="3.4" ry="8" transform="rotate(-38 {s.x - 4} {s.y})" />
				<ellipse cx={s.x + 4} cy={s.y} rx="3.4" ry="8" transform="rotate(38 {s.x + 4} {s.y})" />
				<ellipse cx={s.x} cy={s.y - 1} rx="3.4" ry="9" />
			</g>
		{/each}
		<Measure x1={g.grid[0].x} y1={22} x2={g.grid[1].x} y2={22} label={formatCm(p.thinToCm)} style={scene.measure} />
	</svg>
{:else}
	{@const { g } = scene}
	<svg viewBox="0 0 {SIDE.width} {SIDE.height}" role="img" aria-label={label}>
		{@html `<style>${scene.css}</style>`}
		<Soil view="side" />
		{#each scene.seeds as s, i (i)}
			<g transform="translate({s.x} {s.y})"><g class="an" style={s.style}><ellipse rx="3.6" ry="5" fill={C.seed} transform="rotate({s.angle})" /></g></g>
		{/each}
		<rect class="an" style={scene.cover} x="0" y="71" width={SIDE.width} height={g.depthPx + 2} fill={C.thinCover} />
		<Measure x1={26} y1={SURFACE} x2={26} y2={SURFACE + g.depthPx} label={formatCm(p.depthCm)} side="right" style={scene.depth} />
	</svg>
{/if}
