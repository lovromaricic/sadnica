<script lang="ts">
	import '../app.css';
	import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import DesktopHeader from '#lib/components/DesktopHeader.svelte';
	import MobileNav from '#lib/components/MobileNav.svelte';
	import OfflineBanner from '#lib/components/OfflineBanner.svelte';
	import Toast from '#lib/components/Toast.svelte';
	import { navContext } from '#lib/navContext.svelte.ts';
	import { store } from '#lib/store.svelte.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const onOnboarding = $derived(page.route.id === '/pocetak');
	const firstRun = $derived(!store.state.onboarded);

	$effect(() => {
		if (firstRun && !onOnboarding) goto(resolve('/pocetak'), { replace: true });
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
		scroller.scrollTop = type === 'popstate' && to?.url ? (positions.get(to.url.href) ?? 0) : 0;
	});
</script>

<div class="shell">
	{#if !(firstRun && onOnboarding)}
		<DesktopHeader />
	{/if}
	<OfflineBanner />

	{#if !firstRun || onOnboarding}
		<main class="scroller" bind:this={scroller} data-scroller>
			{@render children()}
		</main>
	{/if}
</div>

<!-- The sun check is a focused flow with its own back button and a full-screen camera. -->
{#if !firstRun && page.route.id !== '/sunce'}
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
			-webkit-overflow-scrolling: touch;
		}
	}
	@media (min-width: 900px) {
		:global(body) {
			padding-top: env(safe-area-inset-top);
		}
	}
</style>
