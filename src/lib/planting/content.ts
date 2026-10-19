/** Croatian text for the planting diagram: header value, paragraph per view, tip and labels. */
import type { Plant } from '../data/schema';
import { t } from '../i18n/hr';
import { formatCm as f } from './format';
import { keepEvery, type DiagramPlanting } from './geometry';

export type View = 'top' | 'side';
const s = t.planting;

/** Seed this deep or deeper is no longer "plitko … tankim slojem". */
const DEEP_SEED_CM = 2;

/** Whether the picture has a depth worth putting in the header. */
export function showsDepth(p: DiagramPlanting): boolean {
	if (p.method === 'clove') return !p.tipShowing;
	if (p.method === 'broadcast') return !p.surface;
	if (p.method === 'transplant') return p.depthMode === 'to-first-leaves' || p.depthMode === 'dibber';
	return true;
}

/** The depth for the header, side text and bracket; 0 only where `showsDepth` is false. */
function depthOf(p: DiagramPlanting): number {
	return p.method === 'sapling' ? p.holeDepthCm : (p.depthCm ?? 0);
}

/** The spacing the plant page tile shows; it must agree with the diagram. */
export function primarySpacing(p: DiagramPlanting): number {
	return p.method === 'row-seed' || p.method === 'broadcast' ? p.thinToCm : p.spacingCm;
}

export function headerLabel(p: DiagramPlanting): string {
	return showsDepth(p) ? s.label : s.labelSpacing;
}

/** "10 cm · 5 cm": the main spacing, then the depth when there is one. */
export function headerValue(p: DiagramPlanting): string {
	const spacing = f(primarySpacing(p));
	return showsDepth(p) ? s.value(spacing, f(depthOf(p))) : spacing;
}

const saplingSupport = (p: Extract<DiagramPlanting, { method: 'sapling' }>) => p.support ?? (p.staked ? 'stake' : undefined);

export function viewText(plant: Plant, p: DiagramPlanting, view: View): string {
	const d = f(depthOf(p));
	switch (p.method) {
		case 'clove':
			if (view === 'top') return s.clove[p.noun].top(f(p.spacingCm), f(p.rowSpacingCm));
			return p.tipShowing ? s.clove.tipShowing : s.clove[p.noun].side(plant.name, d);
		case 'row-seed':
			if (view === 'side') return p.depthCm >= DEEP_SEED_CM ? s.rowSeed.sideDeep(d) : s.rowSeed.sideShallow(d);
			return keepEvery(p) === 1 ? s.rowSeed.topNoThinning(f(p.rowSpacingCm), f(p.thinToCm)) : s.rowSeed.top(f(p.rowSpacingCm), f(p.thinToCm));
		case 'broadcast':
			if (view === 'top') return s.broadcast.top(f(p.thinToCm));
			if (p.surface) return s.broadcast.sideSurface;
			return (p.depthCm ?? 0) >= DEEP_SEED_CM ? s.broadcast.sideDeep(d) : s.broadcast.side(d);
		case 'transplant':
			return view === 'top' ? s.transplant.top(f(p.spacingCm), f(p.rowSpacingCm)) : s.transplant.side[p.depthMode];
		case 'sapling': {
			if (view === 'top') return s.sapling.top[p.form ?? 'tree'](f(p.spacingCm), f(p.rowSpacingCm));
			const graft = p.graftedAboveSoil;
			const support = saplingSupport(p);
			const rest =
				graft && support === 'stake'
					? [s.sapling.graftAndStake]
					: [graft && s.sapling.graft, support === 'stake' ? s.sapling.stake : support && s.sapling.support[support]];
			return [s.sapling.hole(f(p.holeDepthCm), f(p.holeWidthCm)), ...rest].filter(Boolean).join(' ');
		}
	}
}

export function ariaLabel(plant: Plant, p: DiagramPlanting, view: View): string {
	const d = f(depthOf(p));
	switch (p.method) {
		case 'clove':
			if (view === 'top') return s.clove[p.noun].ariaTop(f(p.spacingCm), f(p.rowSpacingCm));
			return p.tipShowing ? s.clove.ariaTipShowing : s.clove[p.noun].ariaSide(d);
		case 'row-seed':
			if (view === 'side') return s.rowSeed.ariaSide(d);
			return keepEvery(p) === 1 ? s.rowSeed.ariaTopNoThinning(f(p.rowSpacingCm), f(p.thinToCm)) : s.rowSeed.ariaTop(f(p.rowSpacingCm), f(p.thinToCm));
		case 'broadcast':
			if (view === 'top') return s.broadcast.ariaTop(f(p.thinToCm));
			return p.surface ? s.broadcast.ariaSideSurface : s.broadcast.ariaSide(d);
		case 'transplant':
			return view === 'top' ? s.transplant.ariaTop(f(p.spacingCm), f(p.rowSpacingCm)) : s.transplant.ariaSide[p.depthMode](d);
		case 'sapling': {
			if (view === 'top') return s.sapling.ariaTop(s.sapling.ariaNoun[p.form ?? 'tree'], f(p.spacingCm), f(p.rowSpacingCm));
			const support = saplingSupport(p);
			return s.sapling.ariaSide(f(p.holeDepthCm), f(p.holeWidthCm), p.graftedAboveSoil, support ? s.sapling.ariaSupport[support] : '');
		}
	}
}

export function tipText(p: DiagramPlanting): string {
	return (p.tipKey && s.tips[p.tipKey]) || s.tipDefault[p.method];
}
