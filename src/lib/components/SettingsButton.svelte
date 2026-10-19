<script lang="ts">
	import { resolve } from '$app/paths';
	import { t } from '../i18n/hr';
	import Icon from './Icon.svelte';
</script>

<a class="settings-btn" href={resolve('/postavke')} aria-label={t.settings.open} title={t.settings.open}>
	<Icon name="settings" size={20} />
</a>

<style>
	.settings-btn {
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
		flex: none;
		border-radius: 50%;
		background: var(--white);
		border: 1px solid var(--border);
		color: var(--ink);
	}
	.settings-btn:hover {
		border-color: var(--ink);
	}
</style>
