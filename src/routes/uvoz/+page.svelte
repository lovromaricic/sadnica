<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import ImportConfirm from '#lib/components/ImportConfirm.svelte';
	import Logo from '#lib/components/Logo.svelte';
	import { plantsById } from '#lib/data/index.ts';
	import { t } from '#lib/i18n/hr.ts';
	import { store } from '#lib/store.svelte.ts';
	import { toast } from '#lib/toast.svelte.ts';
	import { decodePayload, payloadFromHash, type GardenPayload, type ImportMode } from '#lib/transfer.ts';

	let status = $state<'loading' | 'ready' | 'invalid'>('loading');
	let payload = $state<GardenPayload | null>(null);

	onMount(async () => {
		const encoded = payloadFromHash(window.location.hash);
		payload = encoded ? await decodePayload(encoded, new Set(plantsById.keys())) : null;
		status = payload ? 'ready' : 'invalid';
	});

	function done(mode: ImportMode) {
		if (!payload) return;
		store.importGarden(payload, mode);
		toast.show(t.importer.done(payload.garden.length));
		goto(resolve('/moj-vrt'), { replace: true });
	}

	function cancel() {
		goto(resolve('/'), { replace: true });
	}
</script>

<svelte:head>
	<title>{t.importer.title} · {t.appName}</title>
</svelte:head>

<div class="page">
	<div class="column">
		<Logo href={store.state.onboarded} />
		<h1>{t.importer.title}</h1>
		{#if status === 'loading'}
			<p class="muted" role="status">{t.importer.loading}</p>
		{:else if status === 'invalid' || !payload}
			<div class="invalid" role="alert">
				<strong>{t.importer.invalid}</strong>
				<p>{t.importer.invalidHint}</p>
			</div>
			<a class="btn btn-primary btn-block" href={resolve('/')}>{t.importer.home}</a>
		{:else}
			<ImportConfirm {payload} onImport={done} onCancel={cancel} />
		{/if}
	</div>
</div>

<style>
	.column {
		display: grid;
		gap: 16px;
		max-width: 520px;
		margin: 0 auto;
	}
	h1 {
		font-size: clamp(2rem, 8vw, 2.75rem);
	}
	.muted {
		color: var(--muted);
	}
	.invalid {
		display: grid;
		gap: 4px;
		padding: 16px;
		border-radius: var(--r-md);
		background: var(--lilac);
		color: var(--lilac-ink);
	}
	@media (min-width: 900px) {
		.column {
			padding: 36px;
			border-radius: var(--r-xl);
			background: var(--white);
		}
	}
</style>
