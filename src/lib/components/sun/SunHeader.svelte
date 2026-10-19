<script lang="ts">
	import { t } from '../../i18n/hr';
	import Icon from '../Icon.svelte';

	let { title, onBack }: { title: string; onBack: () => void } = $props();
</script>

<div class="sun-header">
	<button type="button" class="icon-btn" aria-label={t.sun.back} onclick={onBack}><Icon name="back" size={22} /></button>
	<p>{title}</p>
</div>

<style>
	.sun-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 16px;
	}
	.icon-btn {
		border: 1px solid var(--border);
	}
	p {
		font-weight: 700;
		color: var(--muted-2);
	}
</style>
