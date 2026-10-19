/**
 * Builds CSS keyframes for one looping animation. Every element runs the full loop (10 s) and its
 * own keyframes hold it hidden until its start, instead of using animation-delay, which would make
 * an infinite sequence drift apart. Start times are percentages of the loop.
 *
 * Each method returns an inline style. `--end` is the element's opacity in the finished picture,
 * used when the viewer prefers reduced motion.
 */
export const LOOP_SECONDS = 10;
/** Everything is visible until HOLD, then fades out by OUT, and the loop starts again. */
const HOLD = 93;
const OUT = 98;
const LAST_START = HOLD - 8;
/** Soil covers in the still picture (reduced motion): see-through, so seeds and roots still show. */
export const COVER_STILL = 0.55;

const pct = (n: number) => `${Math.round(n * 10) / 10}%`;
const clampStart = (at: number) => Math.min(Math.max(at, 0), LAST_START);

export class Timeline {
	private names = new Map<string, string>();

	constructor(private readonly prefix: string) {}

	private use(body: string, ease: string, end: number): string {
		let name = this.names.get(body);
		if (!name) {
			name = `${this.prefix}${this.names.size}`;
			this.names.set(body, name);
		}
		return `animation:${name} ${LOOP_SECONDS}s ${ease} infinite;--end:${end}`;
	}

	/** Scales up from small with a slight overshoot. Needs `transform-box: fill-box` on the element. */
	pop(at: number): string {
		const a = clampStart(at);
		const hidden = 'opacity:0;transform:scale(.3)';
		const shown = 'opacity:1;transform:scale(1)';
		return this.use(
			`0%,${pct(a)}{${hidden}}${pct(a + 3)}{opacity:1;transform:scale(1.2)}${pct(a + 6)}{${shown}}${HOLD}%{${shown}}${OUT}%,100%{opacity:0;transform:scale(1)}`,
			'ease-out',
			1
		);
	}

	/**
	 * Fades in to `to` over `over` percent of the loop. `end` overrides the opacity in the still
	 * picture, so a soil cover can stay see-through there and still show what lies under it.
	 */
	fade(at: number, { to = 1, over = 4, end = to }: { to?: number; over?: number; end?: number } = {}): string {
		const a = clampStart(at);
		return this.use(
			`0%,${pct(a)}{opacity:0}${pct(a + over)}{opacity:${to}}${HOLD}%{opacity:${to}}${OUT}%,100%{opacity:0}`,
			'linear',
			end
		);
	}

	/** Falls from `distance` px above, bounces a little, then rests. */
	drop(at: number, distance = 95): string {
		const a = clampStart(at);
		const rest = 'opacity:1;transform:translateY(0)';
		return this.use(
			`0%,${pct(a)}{opacity:0;transform:translateY(-${distance}px)}${pct(a + 0.5)}{opacity:1;transform:translateY(-${distance}px)}${pct(a + 5)}{opacity:1;transform:translateY(6px)}${pct(a + 7)}{${rest}}${HOLD}%{${rest}}${OUT}%,100%{opacity:0;transform:translateY(0)}`,
			'ease-in',
			1
		);
	}

	/** Appears at `at`, disappears at `until`: seeds that are thinned out or replaced. */
	flash(at: number, until: number): string {
		const a = clampStart(at);
		const b = Math.max(until, a + 2);
		return this.use(`0%,${pct(a)}{opacity:0}${pct(a + 2)}{opacity:1}${pct(b)}{opacity:1}${pct(b + 4)},100%{opacity:0}`, 'linear', 0);
	}

	css(): string {
		return [...this.names].map(([body, name]) => `@keyframes ${name}{${body}}`).join('\n');
	}
}
