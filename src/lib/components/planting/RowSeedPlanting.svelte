<script lang="ts">
	import type { Planting } from '../../data/schema';
	import { formatCm } from '../../planting/format';
	import { rowSeedSide, rowSeedTop, SIDE, SURFACE, TOP } from '../../planting/geometry';
	import { C } from '../../planting/palette';
	import { COVER_STILL, Timeline } from '../../planting/timeline';
	import Measure from './Measure.svelte';
	import Soil from './Soil.svelte';

	/** Seeds sown in rows, then thinned: every nth seed stays and grows. */
	let { planting: p, view, label, prefix }: { planting: Extract<Planting, { method: 'row-seed' }>; view: 'top' | 'side'; label: string; prefix: string } =
		$props();

	const BATCHES = 8;

	const scene = $derived.by(() => {
		const tl = new Timeline(prefix);
		if (view === 'top') {
			const g = rowSeedTop(p);
			const count = g.seeds.length;
			// Seeds appear left to right in batches, row 1 first; the ones thinned out fade at 56%.
			const seeds = g.rows.flatMap((y, row) =>
				g.seeds.map((s, i) => {
					const at = 3 + row * 16 + Math.floor((i * BATCHES) / count) * 2;
					return { x: s.x, y, style: s.kept ? tl.fade(at, { over: 2 }) : tl.flash(at, 56) };
				})
			);
			const tufts = g.rows.flatMap((y) => g.kept.map((x) => ({ x, y, style: tl.pop(59) })));
			return { kind: 'top' as const, g, seeds, tufts, rowsStyle: tl.fade(39), thinStyle: tl.fade(66), css: tl.css() };
		}
		const g = rowSeedSide(p);
		const seeds = g.xs.map((x, i) => ({ x, style: tl.drop(6 + i * 3.5) }));
		return { kind: 'side' as const, g, seeds, furrow: tl.fade(3), depth: tl.fade(30), cover: tl.fade(36, { to: 0.92, end: COVER_STILL }), css: tl.css() };
	});
</script>

{#if scene.kind === 'top'}
	{@const { g } = scene}
	<svg viewBox="0 0 {TOP.width} {TOP.height}" role="img" aria-label={label}>
		{@html `<style>${scene.css}</style>`}
		<Soil view="top" />
		{#each g.rows as y (y)}<line x1="12" y1={y} x2="290" y2={y} stroke={C.furrow} stroke-width="5" stroke-linecap="round" />{/each}
		{#each scene.seeds as s, i (i)}<ellipse class="an" style={s.style} cx={s.x} cy={s.y} rx="2.6" ry="3.6" fill={C.seed} />{/each}
		{#each scene.tufts as s, i (i)}
			<g class="an pop" style={s.style} fill={C.leaf} stroke={C.leafLine} stroke-width="1.3">
				<ellipse cx={s.x - 3} cy={s.y - 6} rx="2.6" ry="7.5" transform="rotate(-30 {s.x - 3} {s.y - 6})" />
				<ellipse cx={s.x} cy={s.y - 7} rx="2.6" ry="8.5" />
				<ellipse cx={s.x + 3} cy={s.y - 6} rx="2.6" ry="7.5" transform="rotate(30 {s.x + 3} {s.y - 6})" />
			</g>
		{/each}
		<Measure x1={299} y1={g.rows[0]} x2={299} y2={g.rows[1]} label={formatCm(p.rowSpacingCm)} style={scene.rowsStyle} />
		{#if g.kept.length > 1}
			<Measure x1={g.kept[0]} y1={g.rows[0] - 21} x2={g.kept[1]} y2={g.rows[0] - 21} label={formatCm(p.thinToCm)} style={scene.thinStyle} />
		{/if}
	</svg>
{:else}
	{@const { g } = scene}
	<svg viewBox="0 0 {SIDE.width} {SIDE.height}" role="img" aria-label={label}>
		{@html `<style>${scene.css}</style>`}
		<Soil view="side" />
		<rect class="an" style={scene.furrow} x="70" y="72" width="215" height={g.furrowHeight} rx="8" fill={C.hole} />
		{#each scene.seeds as s, i (i)}
			<g transform="translate({s.x} {g.seedY})"><g class="an" style={s.style}><ellipse rx="4.5" ry="6" fill={C.seed} /></g></g>
		{/each}
		<rect class="an" style={scene.cover} x="70" y="71" width="215" height={g.furrowHeight + 4} rx="8" fill={C.cover} />
		<Measure x1={26} y1={SURFACE} x2={26} y2={SURFACE + g.depthPx} label={formatCm(p.depthCm)} side="right" style={scene.depth} />
	</svg>
{/if}
