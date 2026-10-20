<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '../i18n/hr';
	import Icon from './Icon.svelte';

	let offline = $state(false);
	/** Closed for this time offline; it comes back the next time the connection drops. */
	let dismissed = $state(false);

	onMount(() => {
		const update = () => {
			offline = !navigator.onLine;
			if (!offline) dismissed = false;
		};
		update();
		window.addEventListener('online', update);
		window.addEventListener('offline', update);
		return () => {
			window.removeEventListener('online', update);
			window.removeEventListener('offline', update);
		};
	});
</script>

{#if offline && !dismissed}
	<div class="offline" role="status">
		<Icon name="offline" size={18} />
		<p>{t.offline}</p>
		<button type="button" class="close" aria-label={t.offlineClose} onclick={() => (dismissed = true)}>
			<Icon name="x" size={18} />
		</button>
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
		padding: 6px 6px 6px 16px;
		border-radius: 999px;
		background: var(--butter);
		font-size: 0.9375rem;
		font-weight: 600;
	}
	.offline :global(svg) {
		flex: none;
	}
	p {
		flex: 1;
	}
	.close {
		flex: none;
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border: 0;
		border-radius: 50%;
		background: transparent;
		color: var(--ink);
		cursor: pointer;
	}
	.close:hover {
		background: rgb(20 32 26 / 0.08);
	}
</style>
