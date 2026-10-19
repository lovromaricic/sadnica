<script lang="ts">
	import LocationPill from './LocationPill.svelte';
	import Logo from './Logo.svelte';
</script>

<!-- Phones only: logo and town at the top of the tab pages. Scrolls away with the content. -->
<header class="mobile-header">
	<Logo />
	<LocationPill compact />
</header>

<style>
	.mobile-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 12px var(--gutter) 0;
	}
	.mobile-header :global(.location) {
		max-width: 55%;
	}
	@media (min-width: 900px) {
		.mobile-header {
			display: none;
		}
	}
</style>
