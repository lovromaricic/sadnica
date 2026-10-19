/**
 * "Today" for the whole app. For reviewing other seasons, `?datum=YYYY-MM-DD`
 * overrides it for the rest of the browser session (see docs/decisions.md).
 */
const KEY = 'sadnica:datum';

function parse(value: string | null): Date | undefined {
	const m = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!m) return undefined;
	const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
	return Number.isNaN(date.getTime()) ? undefined : date;
}

export function getToday(): Date {
	if (typeof window === 'undefined') return new Date();
	try {
		const param = new URLSearchParams(window.location.search).get('datum');
		if (param !== null) {
			if (parse(param)) sessionStorage.setItem(KEY, param);
			else sessionStorage.removeItem(KEY);
		}
		return parse(sessionStorage.getItem(KEY)) ?? new Date();
	} catch {
		return parse(new URLSearchParams(window.location.search).get('datum')) ?? new Date();
	}
}

export const today = getToday();
