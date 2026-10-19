import type { IconName } from './components/Icon.svelte';
import { t } from './i18n/hr';

export const NAV_ITEMS: { href: '/' | '/biljke' | '/moj-vrt'; label: string; icon: IconName }[] = [
	{ href: '/', label: t.nav.today, icon: 'calendar' },
	{ href: '/biljke', label: t.nav.plants, icon: 'leaf' },
	{ href: '/moj-vrt', label: t.nav.garden, icon: 'house' }
];

/** Which nav item a route belongs to. */
export function isActive(href: string, routeId: string | null): boolean {
	if (!routeId) return false;
	return href === '/' ? routeId === '/' : routeId === href || routeId.startsWith(`${href}/`);
}
