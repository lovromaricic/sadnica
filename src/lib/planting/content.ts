/** Croatian text for the planting diagram: header value, paragraph per view, tip and labels. */
import type { Plant } from '../data/schema';
import { t } from '../i18n/hr';
import { formatCm as f } from './format';
import { keepEvery, type DiagramPlanting } from './geometry';

export type View = 'top' | 'side';
const s = t.planting;

/** "10 cm · 5 cm": the main spacing, then the depth. */
export function headerValue(p: DiagramPlanting): string {
	switch (p.method) {
		case 'clove':
		case 'transplant':
			return s.value(f(p.spacingCm), f(p.depthCm));
		case 'row-seed':
		case 'broadcast':
			return s.value(f(p.thinToCm), f(p.depthCm));
		case 'sapling':
			return s.value(f(p.spacingCm), f(p.holeDepthCm));
	}
}

/** The spacing the plant page tile shows; it must agree with the diagram. */
export function primarySpacing(p: DiagramPlanting): number {
	return p.method === 'row-seed' || p.method === 'broadcast' ? p.thinToCm : p.spacingCm;
}

const saplingNoun = (plant: Plant) => (plant.category === 'fruit' ? s.sapling.noun.fruit : s.sapling.noun.other);

export function viewText(plant: Plant, p: DiagramPlanting, view: View): string {
	switch (p.method) {
		case 'clove':
			return view === 'top' ? s.clove[p.noun].top(f(p.spacingCm), f(p.rowSpacingCm)) : s.clove[p.noun].side(plant.name, f(p.depthCm));
		case 'row-seed':
			if (view === 'side') return p.depthCm >= 3 ? s.rowSeed.sideDeep(f(p.depthCm)) : s.rowSeed.sideShallow(f(p.depthCm));
			return keepEvery(p) === 1 ? s.rowSeed.topNoThinning(f(p.rowSpacingCm), f(p.thinToCm)) : s.rowSeed.top(f(p.rowSpacingCm), f(p.thinToCm));
		case 'broadcast':
			return view === 'top' ? s.broadcast.top(f(p.thinToCm)) : s.broadcast.side(f(p.depthCm));
		case 'transplant':
			return view === 'top' ? s.transplant.top(f(p.spacingCm), f(p.rowSpacingCm)) : s.transplant.side[p.depthMode];
		case 'sapling': {
			if (view === 'top') return s.sapling.top(saplingNoun(plant), f(p.spacingCm), f(p.rowSpacingCm));
			const extra = p.graftedAboveSoil && p.staked ? s.sapling.graftAndStake : p.graftedAboveSoil ? s.sapling.graft : p.staked ? s.sapling.stake : '';
			return [s.sapling.hole(f(p.holeDepthCm), f(p.holeWidthCm)), extra].filter(Boolean).join(' ');
		}
	}
}

export function ariaLabel(plant: Plant, p: DiagramPlanting, view: View): string {
	switch (p.method) {
		case 'clove':
			return view === 'top' ? s.clove[p.noun].ariaTop(f(p.spacingCm), f(p.rowSpacingCm)) : s.clove[p.noun].ariaSide(f(p.depthCm));
		case 'row-seed':
			if (view === 'side') return s.rowSeed.ariaSide(f(p.depthCm));
			return keepEvery(p) === 1 ? s.rowSeed.ariaTopNoThinning(f(p.rowSpacingCm), f(p.thinToCm)) : s.rowSeed.ariaTop(f(p.rowSpacingCm), f(p.thinToCm));
		case 'broadcast':
			return view === 'top' ? s.broadcast.ariaTop(f(p.thinToCm)) : s.broadcast.ariaSide(f(p.depthCm));
		case 'transplant':
			return view === 'top' ? s.transplant.ariaTop(f(p.spacingCm), f(p.rowSpacingCm)) : s.transplant.ariaSide[p.depthMode](f(p.depthCm));
		case 'sapling':
			return view === 'top'
				? s.sapling.ariaTop(saplingNoun(plant), f(p.spacingCm), f(p.rowSpacingCm))
				: s.sapling.ariaSide(f(p.holeDepthCm), f(p.holeWidthCm), p.graftedAboveSoil, p.staked);
	}
}

export function tipText(p: DiagramPlanting): string {
	return (p.tipKey && s.tips[p.tipKey]) || s.tipDefault[p.method];
}
