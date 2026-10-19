import { APP_NAME } from './config';
import type { Plant, Region, Rules } from './data/schema';
import { t } from './i18n/hr';
import { getSeasonStatus } from './season';

const ymd = (d: Date) =>
	`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;

/** RFC 5545 text escaping. */
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

/**
 * An all-day calendar event covering the current (or next) planting window,
 * with an alarm at 9:00 on its first day.
 */
export function buildIcs(plant: Plant, region: Region, date: Date, rules: Rules): string | null {
	const season = getSeasonStatus(plant, region, date, rules);
	if (!season.start || !season.end) return null;
	const start = season.start < date ? date : season.start;
	const endExclusive = new Date(season.end.getFullYear(), season.end.getMonth(), season.end.getDate() + 1);
	const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
	return [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		`PRODID:-//${APP_NAME}//HR`,
		'CALSCALE:GREGORIAN',
		'BEGIN:VEVENT',
		`UID:${plant.id}-${ymd(start)}@${APP_NAME.toLowerCase()}`,
		`DTSTAMP:${stamp}`,
		`DTSTART;VALUE=DATE:${ymd(start)}`,
		`DTEND;VALUE=DATE:${ymd(endExclusive)}`,
		`SUMMARY:${esc(t.ics.summary(plant.name))}`,
		`DESCRIPTION:${esc(t.ics.description(plant.name))}`,
		'TRANSP:TRANSPARENT',
		'BEGIN:VALARM',
		'ACTION:DISPLAY',
		`DESCRIPTION:${esc(t.ics.summary(plant.name))}`,
		'TRIGGER;RELATED=START:PT9H',
		'END:VALARM',
		'END:VEVENT',
		'END:VCALENDAR',
		''
	].join('\r\n');
}

export function downloadFile(filename: string, content: string, type = 'text/calendar;charset=utf-8') {
	const url = URL.createObjectURL(new Blob([content], { type }));
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.append(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}
