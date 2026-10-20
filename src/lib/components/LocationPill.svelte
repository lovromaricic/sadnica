<script lang="ts">
	import { resolve } from '$app/paths';
	import { t } from '../i18n/hr';
	import { store } from '../store.svelte';
	import Icon from './Icon.svelte';

	/** The user's town; opens onboarding, where city and region can be changed. */
	let { compact = false }: { compact?: boolean } = $props();
</script>

<a class="location" class:compact href={resolve('/pocetak')} aria-label={t.locationLabel(store.state.city)}>
	<Icon name="pin" size={compact ? 16 : 18} />
	<span>{store.state.city}</span>
</a>

<style>
	.location {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 48px;
		max-width: 100%;
		padding: 0 20px;
		border-radius: 999px;
		background: var(--white);
		border: 1px solid var(--border);
		text-decoration: none;
		font-weight: 700;
	}
	@media (hover: hover) {
		.location:hover {
			border-color: var(--ink);
		}
	}
	.compact {
		min-height: 44px;
		padding: 0 14px;
		font-size: 0.9375rem;
	}
	span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
