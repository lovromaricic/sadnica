<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { NAV_ITEMS, isActive } from '../nav';
	import { t } from '../i18n/hr';
	import Icon from './Icon.svelte';
</script>

<nav class="mobile-nav" aria-label={t.nav.main}>
	{#each NAV_ITEMS as item (item.href)}
		{@const active = isActive(item.href, page.route.id)}
		<a href={resolve(item.href)} class:active aria-current={active ? 'page' : undefined}>
			<Icon name={item.icon} size={22} />
			<span class:sr-only={!active}>{item.label}</span>
		</a>
	{/each}
</nav>

<style>
	.mobile-nav {
		position: fixed;
		z-index: 20;
		left: 50%;
		bottom: calc(16px + env(safe-area-inset-bottom));
		transform: translateX(-50%);
		display: flex;
		gap: 4px;
		padding: 6px;
		border-radius: 999px;
		background: var(--ink);
		box-shadow: 0 10px 30px rgb(20 32 26 / 0.25);
	}
	a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		min-width: 56px;
		height: 56px;
		padding: 0 16px;
		border-radius: 999px;
		color: var(--dark-muted);
		text-decoration: none;
		font-weight: 700;
		white-space: nowrap;
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
	}
	a:hover {
		color: var(--white);
	}
	a.active {
		background: var(--lime);
		color: var(--ink);
		padding: 0 20px 0 18px;
	}
	a:focus-visible {
		outline-color: var(--lime);
		border-radius: 999px;
	}
	@media (min-width: 900px) {
		.mobile-nav {
			display: none;
		}
	}
</style>
