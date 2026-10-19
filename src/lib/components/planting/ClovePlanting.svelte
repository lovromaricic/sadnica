<script lang="ts">
	import type { Planting } from '../../data/schema';
	import { formatCm } from '../../planting/format';
	import { cloveSide, cloveTop, SIDE, SURFACE, TOP } from '../../planting/geometry';
	import { C } from '../../planting/palette';
	import { COVER_STILL, Timeline } from '../../planting/timeline';
	import Measure from './Measure.svelte';
	import Soil from './Soil.svelte';

	/** Garlic, onion sets and bulbs: set in rows, tip up. */
	let { planting: p, view, label, prefix }: { planting: Extract<Planting, { method: 'clove' }>; view: 'top' | 'side'; label: string; prefix: string } =
		$props();

	const scene = $derived.by(() => {
		const tl = new Timeline(prefix);
		if (view === 'top') {
			const g = cloveTop(p);
			// Two cloves, a pause for the spacing label, then the rest of the row.
			const rowStart = (i: number) => (i < 2 ? 5 + i * 5 : 19 + (i - 2) * 4);
			const cloves = [
				...g.xs.map((x, i) => ({ x, y: g.rows[0], style: tl.pop(rowStart(i)) })),
				...g.xs.map((x, i) => ({ x, y: g.rows[1], style: tl.pop(46 + i * 4) }))
			];
			const spacing = { x1: g.xs[0], x2: g.xs[1], y: g.rows[0] - 24, style: tl.fade(15) };
			const rows = { x: 290, y1: g.rows[0], y2: g.rows[1], style: tl.fade(36) };
			return { kind: 'top' as const, g, cloves, spacing, rows, css: tl.css() };
		}
		const g = cloveSide(p);
		const items = g.xs.map((x, i) => ({ x, hole: tl.fade(3 + i * 11), drop: tl.drop(6 + i * 11), cover: tl.fade(62, { to: 0.92, end: COVER_STILL }) }));
		return { kind: 'side' as const, g, items, spacing: tl.fade(38), depth: tl.fade(44), css: tl.css() };
	});
</script>

{#if scene.kind === 'top'}
	{@const { g } = scene}
	<svg viewBox="0 0 {TOP.width} {TOP.height}" role="img" aria-label={label}>
		{@html `<style>${scene.css}</style>`}
		<Soil view="top" />
		{#each g.rows as y (y)}<line x1="14" y1={y} x2="296" y2={y} stroke={C.furrow} stroke-width="2" stroke-dasharray="4 6" />{/each}
		{#each scene.cloves as c, i (i)}
			<g class="an pop" style={c.style}>
				<ellipse cx={c.x} cy={c.y} rx="9" ry="12" fill={C.clove} stroke={C.cloveLine} stroke-width="2.2" />
				<path d="M{c.x} {c.y - 11}v-6" stroke={C.cloveLine} stroke-width="2.2" stroke-linecap="round" />
			</g>
		{/each}
		<Measure x1={scene.spacing.x1} y1={scene.spacing.y} x2={scene.spacing.x2} y2={scene.spacing.y} label={formatCm(p.spacingCm)} style={scene.spacing.style} />
		<Measure x1={scene.rows.x} y1={scene.rows.y1} x2={scene.rows.x} y2={scene.rows.y2} label={formatCm(p.rowSpacingCm)} style={scene.rows.style} />
	</svg>
{:else}
	{@const { g } = scene}
	<svg viewBox="0 0 {SIDE.width} {SIDE.height}" role="img" aria-label={label}>
		{@html `<style>${scene.css}</style>`}
		<Soil view="side" />
		{#each scene.items as it, i (i)}
			<rect class="an" style={it.hole} x={it.x - 17} y="72" width="34" height={g.holeBottom - 72} rx="8" fill={C.hole} />
		{/each}
		{#each scene.items as it, i (i)}
			<g transform="translate({it.x} {g.centerY})">
				<g class="an" style={it.drop}>
					<path d="M0 -15C10 -5 11 8 8 15H-8C-11 8 -10 -5 0 -15Z" fill={C.clove} stroke={C.cloveLine} stroke-width="2.2" stroke-linejoin="round" />
					<path d="M-4 17v5M0 17v6M4 17v5" stroke={C.cloveLine} stroke-width="2" stroke-linecap="round" />
				</g>
			</g>
		{/each}
		{#each scene.items as it, i (i)}
			<rect class="an" style={it.cover} x={it.x - 17} y="71" width="34" height={g.holeBottom - 68} rx="8" fill={C.cover} />
		{/each}
		<Measure x1={g.xs[0]} y1={50} x2={g.xs[1]} y2={50} label={formatCm(p.spacingCm)} style={scene.spacing} />
		<Measure x1={24} y1={SURFACE} x2={24} y2={g.tipY} label={formatCm(p.depthCm)} side="right" style={scene.depth} />
	</svg>
{/if}
