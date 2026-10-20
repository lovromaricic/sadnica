<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { NAV_ITEMS, isActive } from '../nav';
	import { navContext } from '../navContext.svelte';
	import { t } from '../i18n/hr';
	import Icon from './Icon.svelte';
</script>

<div class="nav-fade" aria-hidden="true"></div>
<nav class="mobile-nav" aria-label={t.nav.main}>
	{#each NAV_ITEMS as item (item.href)}
		{@const active = isActive(item.href, navContext.activeTab(page.route.id))}
		<a href={resolve(item.href)} class:active aria-current={active ? 'page' : undefined}>
			<Icon name={item.icon} size={22} />
			<span>{item.label}</span>
		</a>
	{/each}
</nav>

<style>
	/* Content fades out under the bar instead of scrolling visibly around the pill. */
	.nav-fade {
		position: fixed;
		z-index: 19;
		left: 0;
		right: 0;
		bottom: 0;
		height: calc(var(--nav-bottom) + 76px);
		background: linear-gradient(to bottom, rgb(246 248 244 / 0), var(--ground) 55%);
		pointer-events: none;
	}
	.mobile-nav {
		position: fixed;
		z-index: 20;
		left: 50%;
		/* Just above the iPhone home indicator; 16px on devices without one. */
		bottom: var(--nav-bottom);
		transform: translate3d(-50%, 0, 0);
		touch-action: manipulation;
		display: flex;
		gap: 4px;
		padding: 6px;
		border-radius: 999px;
		background: var(--ink);
		box-shadow: 0 10px 30px rgb(20 32 26 / 0.25);
	}
	/* Every item shows its label under the icon, like a tab bar; the active one is lime. */
	a {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		min-width: 84px;
		height: 60px;
		padding: 0 14px;
		border-radius: 999px;
		color: var(--dark-muted);
		text-decoration: none;
		font-weight: 700;
		font-size: 0.75rem;
		line-height: 1.1;
		white-space: nowrap;
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
	}
	@media (hover: hover) {
		a:hover {
			color: var(--white);
		}
	}
	a.active {
		background: var(--lime);
		color: var(--ink);
	}
	a:focus-visible {
		outline-color: var(--lime);
		border-radius: 999px;
	}
	@media (min-width: 900px) {
		.nav-fade,
		.mobile-nav {
			display: none;
		}
	}
</style>
