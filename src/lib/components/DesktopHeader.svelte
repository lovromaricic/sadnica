<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { NAV_ITEMS, isActive } from '../nav';
	import { navContext } from '../navContext.svelte';
	import { t } from '../i18n/hr';
	import { store } from '../store.svelte';
	import Icon from './Icon.svelte';
	import Logo from './Logo.svelte';
</script>

<header class="desktop-header">
	<Logo />
	<nav aria-label={t.nav.main}>
		{#each NAV_ITEMS as item (item.href)}
			{@const active = isActive(item.href, navContext.activeTab(page.route.id))}
			<a href={resolve(item.href)} class:active aria-current={active ? 'page' : undefined}>
				<Icon name={item.icon} size={20} />
				{item.label}
			</a>
		{/each}
	</nav>
	<a class="location" href={resolve('/pocetak')} aria-label={t.locationLabel(store.state.city)}>
		<Icon name="pin" size={18} />
		{store.state.city}
	</a>
</header>

<style>
	.desktop-header {
		display: none;
	}
	@media (min-width: 900px) {
		.desktop-header {
			display: grid;
			grid-template-columns: 1fr auto 1fr;
			align-items: center;
			width: 100%;
			max-width: var(--max);
			margin: 0 auto;
			padding: 20px var(--gutter);
		}
	}
	nav {
		display: flex;
		gap: 4px;
		padding: 6px;
		border-radius: 999px;
		background: var(--ink);
	}
	nav a {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		padding: 0 20px;
		border-radius: 999px;
		color: var(--dark-muted);
		text-decoration: none;
		font-weight: 700;
	}
	nav a:hover {
		color: var(--white);
	}
	nav a.active {
		background: var(--lime);
		color: var(--ink);
	}
	nav a:focus-visible {
		outline-color: var(--lime);
		border-radius: 999px;
	}
	.location {
		justify-self: end;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 48px;
		padding: 0 20px;
		border-radius: 999px;
		background: var(--white);
		border: 1px solid var(--border);
		text-decoration: none;
		font-weight: 700;
	}
	.location:hover {
		border-color: var(--ink);
	}
</style>
