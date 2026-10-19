<script lang="ts">
	import LocationPill from './LocationPill.svelte';
	import Logo from './Logo.svelte';
	import SettingsButton from './SettingsButton.svelte';
</script>

<!-- Phones only: logo and town at the top of the tab pages. Scrolls away with the content. -->
<header class="mobile-header">
	<Logo />
	<div class="right">
		<LocationPill compact />
		<SettingsButton />
	</div>
</header>

<style>
	.mobile-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 12px var(--gutter) 0;
	}
	.right {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
	}
	.right :global(.location) {
		max-width: 150px;
	}
	@media (min-width: 900px) {
		.mobile-header {
			display: none;
		}
	}
</style>
