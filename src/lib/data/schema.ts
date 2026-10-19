import { z } from 'zod';
import { REGIONS } from './regions';

export { REGIONS };
export const regionSchema = z.enum(REGIONS);
export type Region = z.infer<typeof regionSchema>;

const month = z.number().int().min(1).max(12);
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'expected a #RRGGBB colour');

export const sowWindowSchema = z.object({
	from: month,
	to: month,
	note: z.string().optional(),
	needsCover: z.boolean().optional()
});
export type SowWindow = z.infer<typeof sowWindowSchema>;

export const harvestWindowSchema = z.object({ from: month, to: month });
export type HarvestWindow = z.infer<typeof harvestWindowSchema>;

/**
 * Growing in pots (balcony). `ok` plants need `minPotCm`, the smallest pot diameter that works;
 * `note` is one short sentence shown with the pot size, or why it does not suit a pot.
 */
export const containersSchema = z
	.object({
		ok: z.boolean(),
		minPotCm: z.number().int().min(5).max(100).optional(),
		note: z.string().min(1).optional()
	})
	.strict()
	.refine((c) => !c.ok || c.minPotCm !== undefined, { message: 'minPotCm is required when ok is true', path: ['minPotCm'] })
	.refine((c) => c.ok || c.minPotCm === undefined, { message: 'minPotCm only makes sense when ok is true', path: ['minPotCm'] });
export type Containers = z.infer<typeof containersSchema>;

const cm = z.number().positive();
/** Shared by every planting method: review flag, an optional strings key for the tip, a note for the reviewer. */
const plantingBase = {
	reviewed: z.boolean(),
	tipKey: z.string().min(1).optional(),
	note: z.string().min(1).optional()
};

/**
 * How the plant goes into the ground, for the animated Razmak diagram. All lengths in cm.
 * "hill" and "special" have no diagram and keep the text-only explanation.
 */
export const plantingSchema = z.discriminatedUnion('method', [
	z.object({
		method: z.literal('clove'),
		...plantingBase,
		/** Which word the texts use: zubac (garlic) or lukovica (bulbs, onion sets). */
		noun: z.enum(['clove', 'bulb']),
		spacingCm: cm,
		rowSpacingCm: cm,
		/** From the surface to the tip of the clove or bulb. */
		depthCm: cm,
		orientation: z.literal('tip-up')
	}).strict(),
	z.object({
		method: z.literal('row-seed'),
		...plantingBase,
		rowSpacingCm: cm,
		thinToCm: cm,
		/** Distance between seeds when sowing. Default a third of thinToCm; equal to it when nothing is thinned. */
		sowCm: cm.optional(),
		depthCm: cm
	}).strict(),
	z.object({
		method: z.literal('broadcast'),
		...plantingBase,
		thinToCm: cm,
		depthCm: cm
	}).strict(),
	z.object({
		method: z.literal('transplant'),
		...plantingBase,
		spacingCm: cm,
		rowSpacingCm: cm,
		/** Planting hole depth: up to the first leaves, the root ball's own height, or with the crown left above. */
		depthCm: cm,
		depthMode: z.enum(['to-first-leaves', 'same-level', 'crown-above-soil'])
	}).strict(),
	z.object({
		method: z.literal('sapling'),
		...plantingBase,
		spacingCm: cm,
		rowSpacingCm: cm,
		holeDepthCm: cm,
		holeWidthCm: cm,
		staked: z.boolean(),
		graftedAboveSoil: z.boolean()
	}).strict(),
	z.object({ method: z.literal('hill'), ...plantingBase }).strict(),
	z.object({ method: z.literal('special'), ...plantingBase }).strict()
]);
export type Planting = z.infer<typeof plantingSchema>;
export type PlantingMethod = Planting['method'];

export const ILLUSTRATION_KINDS = [
	'bulb', 'pod', 'rosette', 'leaf', 'tomato', 'root',
	'pepper', 'cucumber', 'pumpkin', 'cabbage', 'berry', 'strawberry',
	'fruit', 'flower', 'sprig', 'corn', 'tuber', 'stalk'
] as const;

export const plantSchema = z
	.object({
		reviewed: z.boolean(),
		id: z.string().regex(/^[a-z0-9-]+$/, 'id must be lowercase ascii, digits or dashes'),
		name: z.string().min(1),
		/**
		 * Lowercase Croatian case forms for generated sentences: "Posadi rajčicu" (acc),
		 * "Za jagode je ovo dobro mjesto" (acc), "malo sunca za ..." and verb agreement
		 * ("jagode vole" when plural, "češnjak voli" otherwise).
		 */
		forms: z.object({
			nom: z.string().min(1),
			gen: z.string().min(1),
			acc: z.string().min(1),
			plural: z.boolean()
		}),
		latin: z.string().optional(),
		aliases: z.array(z.string()),
		category: z.enum(['veg', 'herb', 'flower', 'fruit']),
		difficulty: z.enum(['easy', 'medium', 'hard']),
		sun: z.enum(['full', 'partial', 'shade']),
		water: z.enum(['low', 'medium', 'high']),
		/** Lower comes first when several plants tie in the recommendation order. Default 100. */
		rank: z.number().int().optional(),
		spacingText: z.string().min(1),
		spacingExplanation: z.array(z.string()).min(1),
		spacingTip: z.string().optional(),
		/** Missing means the Razmak explanation stays text only. */
		planting: plantingSchema.optional(),
		/**
		 * Trees, bushes and long-lived herbs: planted once, first harvest after some years.
		 * They are never the Danas hero and get "prvi plodovi za oko N godine" instead of a month.
		 */
		perennial: z.object({ yearsToFirstHarvest: z.number().int().min(1).max(10) }).optional(),
		/** Missing means we do not know yet; the app then treats the plant as not for pots. */
		containers: containersSchema.optional(),
		summary: z.string().min(1),
		weeklyTip: z.string().optional(),
		illustration: z.object({
			kind: z.enum(ILLUSTRATION_KINDS),
			fill: hexColor,
			stroke: hexColor,
			bg: hexColor
		}),
		sow: z.record(regionSchema, z.array(sowWindowSchema)),
		harvest: z.record(regionSchema, z.array(harvestWindowSchema)),
		steps: z.array(z.object({ title: z.string().min(1), text: z.string().min(1) })).min(1),
		/**
		 * Dogs and cats, after the ASPCA toxic plant list. Either the details of the risk, or
		 * `{ safe: true }` when the list names it non-toxic. Missing means not checked: the app then
		 * shows no warning, but the plant is not offered as pet-safe either.
		 */
		pets: z
			.union([
				z.object({ safe: z.literal(true) }).strict(),
				z
					.object({
						dogs: z.boolean(),
						cats: z.boolean(),
						severity: z.enum(['mild', 'serious']),
						/** Which parts are dangerous. */
						part: z.string().min(1),
						/** What poisoning looks like. */
						signs: z.string().min(1)
					})
					.strict()
			])
			.optional(),
		/** Common beginner problems: how to recognise them and what to do. */
		problems: z
			.array(z.object({ title: z.string().min(1), signs: z.string().min(1), fix: z.string().min(1) }))
			.optional(),
		neighbours: z.object({ good: z.array(z.string()), bad: z.array(z.string()) })
	})
	.strict();
export type Plant = z.infer<typeof plantSchema>;

const explanationSchema = z.object({
	label: z.string(),
	paragraphs: z.array(z.string()).min(1).max(3),
	tip: z.string()
});
export type Explanation = z.infer<typeof explanationSchema>;

export const explanationsSchema = z
	.object({
		reviewed: z.boolean(),
		difficulty: z.object({ easy: explanationSchema, medium: explanationSchema, hard: explanationSchema }),
		sun: z.object({ full: explanationSchema, partial: explanationSchema, shade: explanationSchema }),
		water: z.object({ low: explanationSchema, medium: explanationSchema, high: explanationSchema })
	})
	.strict();
export type Explanations = z.infer<typeof explanationsSchema>;

const monthDay = z.object({ month, day: z.number().int().min(1).max(31) });

export const rulesSchema = z
	.object({
		reviewed: z.boolean(),
		/** Days before a window closes when a plant counts as "Još stigneš". */
		lateDays: z.number().int().positive(),
		/** How many months ahead a window may start and still count as "Uskoro". */
		upcomingMonths: z.number().int().positive(),
		/** Days before the typical first frost when the alert appears. */
		frostAlertDays: z.number().int().positive(),
		frost: z.record(
			regionSchema,
			z.object({ from: monthDay, to: monthDay, text: z.string() })
		)
	})
	.strict();
export type Rules = z.infer<typeof rulesSchema>;
