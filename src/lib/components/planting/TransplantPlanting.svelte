<script lang="ts">
	import type { Planting } from '../../data/schema';
	import { t } from '../../i18n/hr';
	import { formatCm } from '../../planting/format';
	import { SIDE, SURFACE, TOP, transplantSide, transplantTop } from '../../planting/geometry';
	import { C } from '../../planting/palette';
	import { COVER_STILL, Timeline } from '../../planting/timeline';
	import Measure from './Measure.svelte';
	import Soil from './Soil.svelte';

	/** Seedlings from pots: planted in a grid, with the depth depending on the plant. */
	let { planting: p, view, label, prefix }: { planting: Extract<Planting, { method: 'transplant' }>; view: 'top' | 'side'; label: string; prefix: string } =
		$props();

	const ANGLES = [0, 60, 120, 180, 240, 300];

	const scene = $derived.by(() => {
		const tl = new Timeline(prefix);
		if (view === 'top') {
			const g = transplantTop(p);
			const starts = [5, 12, 30, 36];
			const plants = g.ys.flatMap((y, r) => g.xs.map((x, c) => ({ x, y, style: tl.pop(starts[r * 2 + c]) })));
			return { kind: 'top' as const, g, plants, spacing: tl.fade(20), rows: tl.fade(44), css: tl.css() };
		}
		const g = transplantSide(p);
		return { kind: 'side' as const, g, hole: tl.fade(3), drop: tl.drop(7), depth: tl.fade(22), cover: tl.fade(36, { to: 0.92, end: COVER_STILL }), caption: tl.fade(42), css: tl.css() };
	});

	/** A dibber hole is narrow; a seedling from a pot needs a hole wider than its root ball. */
	const holeHalf = $derived(p.depthMode === 'dibber' ? 14 : 23);
	const lines = $derived(t.planting.transplant.label[p.depthMode]);
</script>

{#if scene.kind === 'top'}
	{@const { g } = scene}
	<svg viewBox="0 0 {TOP.width} {TOP.height}" role="img" aria-label={label}>
		{@html `<style>${scene.css}</style>`}
		<Soil view="top" />
		{#each scene.plants as s, i (i)}
			<g class="an pop" style={s.style}>
				<circle cx={s.x} cy={s.y} r="10" fill={C.hole} />
				{#each ANGLES as a (a)}
					<ellipse cx={s.x} cy={s.y - 9} rx="5.5" ry="10" transform="rotate({a} {s.x} {s.y})" fill={C.leaf} stroke={C.leafLine} stroke-width="1.3" />
				{/each}
				<circle cx={s.x} cy={s.y} r="4" fill={C.leafDark} />
			</g>
		{/each}
		<Measure x1={g.xs[0]} y1={g.ys[0] + 28} x2={g.xs[1]} y2={g.ys[0] + 28} label={formatCm(p.spacingCm)} style={scene.spacing} />
		<Measure x1={274} y1={g.ys[0]} x2={274} y2={g.ys[1]} label={formatCm(p.rowSpacingCm)} style={scene.rows} />
	</svg>
{:else}
	{@const { g } = scene}
	<svg viewBox="0 0 {SIDE.width} {SIDE.height}" role="img" aria-label={label}>
		{@html `<style>${scene.css}</style>`}
		<Soil view="side" />
		<rect class="an" style={scene.hole} x={g.x - holeHalf} y="72" width={holeHalf * 2} height={g.holeBottom - 72} rx="10" fill={C.hole} />
		<g transform="translate({g.x} 0)">
			<g class="an" style={scene.drop}>
				<ellipse cx="0" cy={g.ballY} rx={p.depthMode === 'dibber' ? 10 : 15} ry="13" fill={C.rootBall} stroke={C.rootLine} stroke-width="2" />
				<path d="M-7 {g.ballY + 10}v6M0 {g.ballY + 12}v7M7 {g.ballY + 10}v6" stroke={C.rootLine} stroke-width="2" stroke-linecap="round" />
				<path d="M0 {g.ballTop + 3}V{g.leafY}" stroke={C.stem} stroke-width="5" stroke-linecap="round" />
				<ellipse cx="-14" cy={g.leafY} rx="13" ry="6" transform="rotate(-20 -14 {g.leafY})" fill={C.leaf} stroke={C.leafLine} stroke-width="1.6" />
				<ellipse cx="14" cy={g.leafY} rx="13" ry="6" transform="rotate(20 14 {g.leafY})" fill={C.leaf} stroke={C.leafLine} stroke-width="1.6" />
				<ellipse cx="0" cy={g.leafY - 10} rx="5" ry="9" fill={C.leaf} stroke={C.leafLine} stroke-width="1.6" />
			</g>
		</g>
		<!-- A dibber hole is only watered in, so it stays open. -->
		{#if p.depthMode !== 'dibber'}
			<rect class="an" style={scene.cover} x={g.x - 23} y="71" width="46" height={g.holeBottom - 70} rx="10" fill={C.cover} />
		{/if}
		{#if p.depthCm}
			<Measure x1={218} y1={SURFACE} x2={218} y2={g.ballTop} label={formatCm(p.depthCm)} side="right" style={scene.depth} />
			<g class="an" style={scene.caption}><text class="small" x={g.x + 38} y={g.leafY - 12}>{lines[0]}</text></g>
		{:else}
			{@const y = p.depthMode === 'same-level' ? SURFACE : SURFACE - 8}
			<g class="an" style={scene.caption}>
				<path d="M{g.x + 30} {y}H{g.x + 42}" stroke={C.ink} stroke-width="2" stroke-linecap="round" />
				{#each lines as line, i (i)}
					<text class="small" x={g.x + 48} y={y + 4 + (i - (lines.length - 1) / 2) * 15}>{line}</text>
				{/each}
			</g>
		{/if}
	</svg>
{/if}
