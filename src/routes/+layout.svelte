<script lang="ts">
	import '../app.css';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import DesktopHeader from '#lib/components/DesktopHeader.svelte';
	import MobileNav from '#lib/components/MobileNav.svelte';
	import OfflineBanner from '#lib/components/OfflineBanner.svelte';
	import Toast from '#lib/components/Toast.svelte';
	import { store } from '#lib/store.svelte.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const onOnboarding = $derived(page.route.id === '/pocetak');
	const firstRun = $derived(!store.state.onboarded);

	$effect(() => {
		if (firstRun && !onOnboarding) goto(resolve('/pocetak'), { replace: true });
	});
</script>

{#if !(firstRun && onOnboarding)}
	<DesktopHeader />
{/if}
<OfflineBanner />

{#if !firstRun || onOnboarding}
	<main>
		{@render children()}
	</main>
{/if}

{#if !firstRun}
	<MobileNav />
{/if}
<Toast />
