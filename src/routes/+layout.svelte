<script lang="ts">
	import '../app.css';
	import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import DesktopHeader from '#lib/components/DesktopHeader.svelte';
	import MobileHeader from '#lib/components/MobileHeader.svelte';
	import MobileNav from '#lib/components/MobileNav.svelte';
	import OfflineBanner from '#lib/components/OfflineBanner.svelte';
	import Toast from '#lib/components/Toast.svelte';
	import { navContext } from '#lib/navContext.svelte.ts';
	import { forecast } from '#lib/forecast.svelte.ts';
	import { coordsForCity } from '#lib/cities.ts';
	import { store } from '#lib/store.svelte.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const onOnboarding = $derived(page.route.id === '/pocetak');
	/** A transfer link must work on a phone that was never set up. */
	const onImport = $derived(page.route.id === '/uvoz');
	const firstRun = $derived(!store.state.onboarded);
	/** Danas, Biljke and Moj vrt get the phone header; detail pages have their own top bar. */
	const isTabPage = $derived(['/', '/biljke', '/moj-vrt'].includes(page.route.id ?? ''));

	$effect(() => {
		if (firstRun && !onOnboarding && !onImport) goto(resolve('/pocetak'), { replace: true });
	});

	// Frost forecast for the town (never the phone's own location); refreshed when stale.
	$effect(() => {
		if (!store.state.onboarded) return;
		const { lat, lng } = coordsForCity(store.state.city, store.state.region);
		forecast.ensure(lat, lng, store.state.weather);
	});

	// On phones the content area scrolls instead of the window (see .shell below), so SvelteKit's
	// own scroll handling does not reach it: start new pages at the top and restore on Back.
	let scroller = $state<HTMLElement>();
	const positions = new Map<string, number>();
	beforeNavigate(({ from }) => {
		if (from?.url && scroller) positions.set(from.url.href, scroller.scrollTop);
	});
	afterNavigate(({ from, to, type }) => {
		// On the first load `from` exists but has no url.
		if (to?.url) navContext.update(to.route.id, to.url.pathname + to.url.search, from?.url ? from.url.pathname + from.url.search : null);
		if (!scroller) return;
		// A link to a section (…#prijenos) scrolls to it instead of the top.
		const target = to?.url.hash ? document.getElementById(decodeURIComponent(to.url.hash.slice(1))) : null;
		if (target && type !== 'popstate') target.scrollIntoView();
		else scroller.scrollTop = type === 'popstate' && to?.url ? (positions.get(to.url.href) ?? 0) : 0;
	});
</script>

<div class="shell">
	{#if !(firstRun && onOnboarding)}
		<DesktopHeader />
	{/if}
	<OfflineBanner />

	{#if !firstRun || onOnboarding || onImport}
		<main class="scroller" bind:this={scroller} data-scroller>
			{#if !firstRun && isTabPage}
				<MobileHeader />
			{/if}
			{@render children()}
		</main>
	{/if}
</div>

<!-- Focused flows (sun check, changing your answers) have their own way out instead of the nav. -->
{#if !firstRun && page.route.id !== '/sunce' && page.route.id !== '/pocetak' && !onImport}
	<MobileNav />
{/if}
<Toast />

<style>
	:global(html) {
		background: var(--ground);
		-webkit-tap-highlight-color: transparent;
	}
	:global(body) {
		padding-left: env(safe-area-inset-left);
		padding-right: env(safe-area-inset-right);
	}

	/*
	 * Phones: an app shell. The document never scrolls, only <main> does. iOS Safari then keeps its
	 * toolbar still, so the fixed bottom nav cannot be shifted or clipped mid-scroll.
	 */
	@media (max-width: 899px) {
		:global(html),
		:global(body) {
			height: 100%;
			overflow: hidden;
		}
		.shell {
			display: flex;
			flex-direction: column;
			height: 100dvh;
			/* Installed app (standalone): keep content out from under the Dynamic Island. */
			padding-top: env(safe-area-inset-top);
		}
		.scroller {
			flex: 1;
			min-height: 0;
			overflow-y: auto;
			overscroll-behavior-y: contain;
		}
	}
	@media (min-width: 900px) {
		:global(body) {
			padding-top: env(safe-area-inset-top);
		}
	}
</style>
