/** Build-time checks on planting data beyond the schema: things that are easy to get wrong by hand. */
import type { Plant } from '../data/schema';
import { t } from '../i18n/hr';
import { primarySpacing } from './content';
import { formatCm } from './format';
import { hasDiagram } from './geometry';

export function plantingProblems(plant: Plant): string[] {
	const p = plant.planting;
	if (!p) return [];
	const problems: string[] = [];
	if (p.tipKey && !(p.tipKey in t.planting.tips)) problems.push(`tipKey "${p.tipKey}" is not in t.planting.tips`);
	if (!hasDiagram(p)) return problems;
	// The Razmak tile shows spacingText; the diagram must not contradict it.
	const spacing = formatCm(primarySpacing(p));
	if (!plant.spacingText.includes(spacing)) problems.push(`spacingText "${plant.spacingText}" does not mention the diagram's ${spacing}`);
	if (p.method === 'row-seed' && p.sowCm !== undefined && p.sowCm > p.thinToCm) problems.push('sowCm cannot be larger than thinToCm');
	if (p.method === 'sapling' && p.holeDepthCm > 150) problems.push('holeDepthCm over 150 cm looks like a mistake');
	return problems;
}
