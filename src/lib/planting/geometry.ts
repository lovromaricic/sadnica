/**
 * Pure layout for the planting diagrams. Every position comes from the plant's numbers: each view
 * picks its own pixels-per-cm so the picture fits its viewBox. Side views may use a different
 * vertical scale from the top views, so shallow depths stay readable and deep ones still fit.
 */
import type { Planting } from '../data/schema';
import { seededRandom } from './random';

type Of<M extends Planting['method']> = Extract<Planting, { method: M }>;
export type DiagramPlanting = Of<'clove' | 'row-seed' | 'broadcast' | 'transplant' | 'sapling'>;

export const TOP = { width: 310, height: 215 } as const;
export const SIDE = { width: 310, height: 200 } as const;
/** Side views: where the soil starts, just under the grass line. */
export const SURFACE = 73;

export function hasDiagram(p: Planting | undefined): p is DiagramPlanting {
	return !!p && p.method !== 'hill' && p.method !== 'special';
}

/** Largest scale that fits every `[cm, availablePx]` pair, never above `max` px per cm. */
export function fitScale(fits: [cm: number, px: number][], max = Infinity): number {
	return Math.min(max, ...fits.map(([cm, px]) => px / cm));
}

/** Evenly spaced positions from `start` while they stay at or before `end`, at most `limit`. */
export function spread(start: number, step: number, end: number, limit = 40): number[] {
	const out: number[] = [];
	for (let x = start; x <= end + 0.01 && out.length < limit; x += step) out.push(x);
	return out;
}

// --- clove ---------------------------------------------------------------------------------

export function cloveTop(p: Of<'clove'>) {
	// Rows up to 125 px apart, and room for at least three cloves in a row.
	const scale = fitScale([[p.rowSpacingCm, 125], [p.spacingCm * 2, 220]]);
	const rowPx = p.rowSpacingCm * scale;
	const y1 = TOP.height / 2 - rowPx / 2;
	const step = p.spacingCm * scale;
	return { scale, rows: [y1, y1 + rowPx], xs: spread(30, step, 250, 5), step };
}

export function cloveSide(p: Of<'clove'>) {
	const vScale = fitScale([[p.depthCm, 80]], 10);
	const hScale = fitScale([[p.spacingCm, 100]], 10);
	const gap = p.spacingCm * hScale;
	const tipY = SURFACE + p.depthCm * vScale;
	// The clove is drawn 30 px tall around its centre, roots below.
	const centerY = tipY + 15;
	return { vScale, hScale, gap, xs: [85, 85 + gap, 85 + 2 * gap], tipY, centerY, holeBottom: centerY + 23 };
}

// --- row-seed ------------------------------------------------------------------------------

/** How many sown seeds there are per plant that stays: 3 by default, 1 when nothing is thinned. */
export function keepEvery(p: Of<'row-seed'>): number {
	return Math.max(1, Math.round(p.thinToCm / (p.sowCm ?? p.thinToCm / 3)));
}

export function rowSeedTop(p: Of<'row-seed'>) {
	const n = keepEvery(p);
	// Rows up to 125 px apart, and at least three kept plants across.
	const scale = fitScale([[p.rowSpacingCm, 125], [p.thinToCm * 3, 250]]);
	const rowPx = p.rowSpacingCm * scale;
	const y1 = TOP.height / 2 - rowPx / 2;
	const seedStep = (p.thinToCm / n) * scale;
	const seeds = spread(20, seedStep, 280).map((x, i) => ({ x, kept: i % n === 0 }));
	const kept = seeds.filter((s) => s.kept).map((s) => s.x);
	return { scale, n, rows: [y1, y1 + rowPx], seeds, kept, thinPx: p.thinToCm * scale };
}

export function rowSeedSide(p: Of<'row-seed'>) {
	const vScale = fitScale([[p.depthCm, 90]], 20);
	const depthPx = p.depthCm * vScale;
	return { vScale, depthPx, seedY: SURFACE + depthPx + 5, xs: spread(90, 35, 265, 6), furrowHeight: depthPx + 14 };
}

// --- broadcast -----------------------------------------------------------------------------

export function broadcastTop(_p: Of<'broadcast'>, seed = 7) {
	// About 7 x 5 plants: the grid step is fixed in pixels and the label carries the number.
	const cols = 7;
	const rows = 5;
	const step = Math.min((TOP.width - 30) / cols, (TOP.height - 15) / rows);
	const x0 = TOP.width / 2 - (step * (cols - 1)) / 2;
	const y0 = 42;
	const grid = Array.from({ length: cols * rows }, (_, i) => ({ x: x0 + (i % cols) * step, y: y0 + Math.floor(i / cols) * step }));
	const rand = seededRandom(seed);
	const scattered = Array.from({ length: 70 }, () => ({
		x: 12 + rand() * (TOP.width - 24),
		y: 10 + rand() * (TOP.height - 20),
		angle: Math.round(rand() * 180)
	}));
	return { step, grid, scattered };
}

export function broadcastSide(p: Of<'broadcast'>, seed = 11) {
	const vScale = fitScale([[p.depthCm, 40]], 20);
	const depthPx = p.depthCm * vScale;
	const rand = seededRandom(seed);
	const seeds = Array.from({ length: 28 }, () => ({
		x: 14 + rand() * (SIDE.width - 28),
		y: Math.max(SURFACE + 3, SURFACE + depthPx - 4 + (rand() - 0.5) * 6),
		angle: Math.round(rand() * 160 - 80)
	}));
	return { vScale, depthPx, seeds };
}

// --- transplant ----------------------------------------------------------------------------

export function transplantTop(p: Of<'transplant'>) {
	// Two by two plants; the leaves need about 20 px around each centre.
	const scale = fitScale([[p.rowSpacingCm, 168], [p.spacingCm, 120]]);
	const dx = p.spacingCm * scale;
	const dy = p.rowSpacingCm * scale;
	const x0 = 130 - dx / 2;
	const y0 = TOP.height / 2 - dy / 2;
	return { scale, xs: [x0, x0 + dx], ys: [y0, y0 + dy] };
}

export function transplantSide(p: Of<'transplant'>) {
	const vScale = fitScale([[p.depthCm, 80]], 8);
	const buried = p.depthMode === 'to-first-leaves';
	const ballTop = buried ? SURFACE + p.depthCm * vScale : p.depthMode === 'crown-above-soil' ? SURFACE - 2 : SURFACE;
	const ballY = ballTop + 13;
	// Where the leaves start: just above ground when buried to them, a tall stem from a level pot,
	// and right at the soil for a crown that stays above it.
	const leafY = buried ? SURFACE - 21 : p.depthMode === 'same-level' ? SURFACE - 45 : SURFACE - 12;
	return { vScale, ballTop, ballY, leafY, holeBottom: ballY + 21, x: 130 };
}

// --- sapling -------------------------------------------------------------------------------

export function saplingTop(p: Of<'sapling'>) {
	// Three trees in a row and two rows.
	const scale = fitScale([[p.spacingCm * 2, 184], [p.rowSpacingCm, 115]]);
	const dx = p.spacingCm * scale;
	const dy = p.rowSpacingCm * scale;
	const y0 = 103.5 - dy / 2;
	return { scale, xs: [140 - dx, 140, 140 + dx], ys: [y0, y0 + dy], crown: dx * 0.4 };
}

export function saplingSide(p: Of<'sapling'>) {
	const scale = fitScale([[p.holeWidthCm, 110], [p.holeDepthCm, 90]]);
	const w = p.holeWidthCm * scale;
	const h = p.holeDepthCm * scale;
	return { scale, w, h, x: 155 - w / 2, bottom: SURFACE - 1 + h, rootsX: w / 108, rootsY: h / 88 };
}
