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

export const ILLUSTRATION_KINDS = ['bulb', 'pod', 'rosette', 'leaf', 'tomato', 'root'] as const;

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
