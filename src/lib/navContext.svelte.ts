import { NAV_ITEMS } from './nav';

type Tab = (typeof NAV_ITEMS)[number]['href'];
const TABS = NAV_ITEMS.map((i) => i.href) as readonly string[];

/**
 * Which tab a detail page belongs to. A plant page opened from Moj vrt stays in Moj vrt, opened
 * from Danas stays in Danas, like tab bars in phone apps. A fresh load or shared link counts as Biljke.
 */
class NavContext {
	/** Last tab page visited, and its exact address (with search and filters). */
	tab = $state<Tab>('/biljke');
	tabHref = $state<string | null>(null);
	/** The address we came from on the last in-app navigation. */
	previousHref = $state<string | null>(null);

	/** Call after every navigation. */
	update(routeId: string | null, href: string, fromHref: string | null) {
		this.previousHref = fromHref;
		if (routeId && TABS.includes(routeId)) {
			this.tab = routeId as Tab;
			this.tabHref = href;
		} else if (fromHref === null) {
			// Landed straight on a detail page: it belongs to the catalogue.
			this.tab = '/biljke';
			this.tabHref = null;
		}
	}

	/** A tab page changed its own address without navigating (catalogue search and filters). */
	replaceTabHref(href: string) {
		this.tabHref = href;
	}

	/** The tab to highlight for a route. */
	activeTab(routeId: string | null): string | null {
		if (routeId === '/biljke/[id]') return this.tab;
		return routeId;
	}
}

export const navContext = new NavContext();
