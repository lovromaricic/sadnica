<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '../i18n/hr';
	import Icon from './Icon.svelte';

	let offline = $state(false);

	onMount(() => {
		const update = () => (offline = !navigator.onLine);
		update();
		window.addEventListener('online', update);
		window.addEventListener('offline', update);
		return () => {
			window.removeEventListener('online', update);
			window.removeEventListener('offline', update);
		};
	});
</script>

{#if offline}
	<div class="offline" role="status">
		<Icon name="offline" size={18} />
		<p>{t.offline}</p>
	</div>
{/if}

<style>
	.offline {
		display: flex;
		align-items: center;
		gap: 10px;
		max-width: var(--max);
		margin: 12px auto 0;
		width: calc(100% - 2 * var(--gutter));
		padding: 10px 16px;
		border-radius: 999px;
		background: var(--butter);
		font-size: 0.9375rem;
		font-weight: 600;
	}
	.offline :global(svg) {
		flex: none;
	}
</style>
