<script lang="ts">
	import { resolve } from '$app/paths';
	import { APP_NAME } from '../config';
	import Icon from './Icon.svelte';

	let { href = true, large = false }: { href?: boolean; large?: boolean } = $props();
</script>

{#snippet content()}
	<span class="mark" aria-hidden="true"><Icon name="sprout" size={large ? 24 : 20} /></span>
	<span class="word">{APP_NAME}</span>
{/snippet}

{#if href}
	<a class="logo" class:large href={resolve('/')}>{@render content()}</a>
{:else}
	<span class="logo" class:large>{@render content()}</span>
{/if}

<style>
	.logo {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		font-family: var(--font-head);
		font-weight: 800;
		font-size: 1.375rem;
		letter-spacing: -0.03em;
		min-height: 44px;
	}
	.mark {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--ink);
		color: var(--lime);
	}
	.large {
		font-size: 1.625rem;
	}
	.large .mark {
		width: 48px;
		height: 48px;
	}
</style>
