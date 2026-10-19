<script lang="ts">
	import type { Planting } from '../../data/schema';
	import { t } from '../../i18n/hr';
	import { formatCm } from '../../planting/format';
	import { saplingSide, saplingTop, SIDE, SURFACE, TOP } from '../../planting/geometry';
	import { C } from '../../planting/palette';
	import { COVER_STILL, Timeline } from '../../planting/timeline';
	import Measure from './Measure.svelte';
	import Soil from './Soil.svelte';

	/** Young trees and bushes: wide spacing for the future crown, a planting pit, stake and graft. */
	let { planting: p, view, label, prefix }: { planting: Extract<Planting, { method: 'sapling' }>; view: 'top' | 'side'; label: string; prefix: string } =
		$props();

	/** Root ends relative to the base of the trunk, drawn for a 108 x 88 px pit and scaled to the real one. */
	const ROOTS = [
		'M0 0C-12 28-28 46-40 54',
		'M0 0C-4 32-10 56-16 76',
		'M0 0C4 32 10 56 16 76',
		'M0 0C12 28 28 46 40 54',
		'M0 0C-20 18-38 24-48 28',
		'M0 0C20 18 38 24 48 28'
	];

	const scene = $derived.by(() => {
		const tl = new Timeline(prefix);
		if (view === 'top') {
			const g = saplingTop(p);
			const starts = [5, 11, 17, 30, 35, 40];
			const trees = g.ys.flatMap((y, r) => g.xs.map((x, c) => ({ x, y, style: tl.pop(starts[r * 3 + c]) })));
			const crown = tl.fade(58);
			return { kind: 'top' as const, g, trees, crown, spacing: tl.fade(23), rows: tl.fade(46), caption: tl.fade(62), css: tl.css() };
		}
		const g = saplingSide(p);
		return {
			kind: 'side' as const,
			g,
			hole: tl.fade(3),
			drop: tl.drop(8),
			stake: tl.fade(20),
			measures: tl.fade(26),
			cover: tl.fade(30, { to: 0.93, end: COVER_STILL }),
			graft: tl.fade(40),
			css: tl.css()
		};
	});
</script>

{#if scene.kind === 'top'}
	{@const { g } = scene}
	<svg viewBox="0 0 {TOP.width} {TOP.height}" role="img" aria-label={label}>
		{@html `<style>${scene.css}</style>`}
		<Soil view="top" />
		{#each scene.trees as s, i (i)}
			<circle class="an" style={scene.crown} cx={s.x} cy={s.y} r={g.crown} fill={C.grass} fill-opacity=".22" stroke={C.leafDark} stroke-width="2" stroke-dasharray="5 5" />
		{/each}
		{#each scene.trees as s, i (i)}
			<g class="an pop" style={s.style}>
				<circle cx={s.x} cy={s.y} r="10" fill={C.leaf} stroke={C.leafLine} stroke-width="2" />
				<circle cx={s.x} cy={s.y} r="3.5" fill={C.trunkDot} />
			</g>
		{/each}
		<Measure x1={g.xs[0] + 14} y1={g.ys[0]} x2={g.xs[1] - 14} y2={g.ys[0]} label={formatCm(p.spacingCm)} style={scene.spacing} />
		<Measure x1={294} y1={g.ys[0]} x2={294} y2={g.ys[1]} label={formatCm(p.rowSpacingCm)} style={scene.rows} />
		<g class="an" style={scene.caption}><text class="small" x={TOP.width / 2} y="208" text-anchor="middle">{t.planting.sapling.crown[p.form ?? 'tree']}</text></g>
	</svg>
{:else}
	{@const { g } = scene}
	<svg viewBox="0 0 {SIDE.width} {SIDE.height}" role="img" aria-label={label}>
		{@html `<style>${scene.css}</style>`}
		<Soil view="side" />
		<rect class="an" style={scene.hole} x={g.x} y="72" width={g.w} height={g.h} rx="12" fill={C.hole} />
		<g transform="translate(155 0)">
			<g class="an" style={scene.drop}>
				<g transform="translate(0 72) scale({g.rootsX} {g.rootsY})">
					{#each ROOTS as d (d)}<path {d} stroke={C.bark} stroke-width="3" stroke-linecap="round" fill="none" vector-effect="non-scaling-stroke" />{/each}
				</g>
				<path d="M0 72V24" stroke={C.bark} stroke-width="6" stroke-linecap="round" />
				{#if p.graftedAboveSoil}<ellipse cx="0" cy="60" rx="6" ry="4" fill={C.graft} stroke={C.bark} stroke-width="1.6" />{/if}
				<circle cx="-12" cy="26" r="13" fill={C.leaf} stroke={C.leafLine} stroke-width="2" />
				<circle cx="12" cy="26" r="13" fill={C.leaf} stroke={C.leafLine} stroke-width="2" />
				<circle cx="0" cy="14" r="13" fill={C.leaf} stroke={C.leafLine} stroke-width="2" />
			</g>
		</g>
		{#if p.staked}
			<g class="an" style={scene.stake}>
				<path d="M183 34V{SURFACE + g.h * 0.75}" stroke={C.stake} stroke-width="5" stroke-linecap="round" />
				<path d="M183 52h-27" stroke={C.ink} stroke-width="2.4" stroke-linecap="round" />
			</g>
		{:else if p.support === 'trellis'}
			<!-- A pergola post with its crossbar. -->
			<g class="an" style={scene.stake}>
				<path d="M196 8V{SURFACE + g.h * 0.6}M160 10H252" stroke={C.stake} stroke-width="5" stroke-linecap="round" />
				<path d="M196 40h-40" stroke={C.ink} stroke-width="2.4" stroke-linecap="round" />
			</g>
		{:else if p.support === 'wires'}
			<!-- A post with two wires along the row. -->
			<g class="an" style={scene.stake}>
				<path d="M210 18V{SURFACE + g.h * 0.6}" stroke={C.stake} stroke-width="5" stroke-linecap="round" />
				<path d="M120 28H290M120 50H290" stroke={C.ink} stroke-width="1.6" stroke-linecap="round" />
			</g>
		{/if}
		<rect class="an" style={scene.cover} x={g.x} y="71" width={g.w} height={g.h + 2} rx="12" fill={C.cover} />
		<Measure x1={24} y1={SURFACE} x2={24} y2={g.bottom} label={formatCm(p.holeDepthCm)} side="right" style={scene.measures} />
		<Measure x1={g.x} y1={g.bottom + 18} x2={g.x + g.w} y2={g.bottom + 18} label={formatCm(p.holeWidthCm)} below style={scene.measures} />
		{#if p.graftedAboveSoil}
			<g class="an" style={scene.graft}>
				<path d="M141 58H149" stroke={C.ink} stroke-width="2" stroke-linecap="round" />
				<text class="small" x="137" y="62" text-anchor="end">{t.planting.sapling.graftLabel}</text>
			</g>
		{/if}
	</svg>
{/if}
