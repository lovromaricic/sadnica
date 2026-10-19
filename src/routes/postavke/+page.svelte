<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { MediaQuery } from 'svelte/reactivity';
	import Icon from '#lib/components/Icon.svelte';
	import ImportConfirm from '#lib/components/ImportConfirm.svelte';
	import QrCode from '#lib/components/QrCode.svelte';
	import { APP_VERSION } from '#lib/config.ts';
	import { plantsById } from '#lib/data/index.ts';
	import { t } from '#lib/i18n/hr.ts';
	import { downloadFile } from '#lib/ics.ts';
	import { navContext } from '#lib/navContext.svelte.ts';
	import { store } from '#lib/store.svelte.ts';
	import { toast } from '#lib/toast.svelte.ts';
	import {
		backupFileContent,
		parseBackupFile,
		payloadFromState,
		transferLink,
		type GardenPayload,
		type ImportMode
	} from '#lib/transfer.ts';
	import { isoDay } from '#lib/garden.ts';
	import { today } from '#lib/today.ts';

	const desktop = new MediaQuery('min-width: 900px');
	const s = $derived(store.state);
	const hasGarden = $derived(s.garden.length > 0);

	// The transfer link follows the garden; it is built on this device and never sent anywhere.
	let link = $state('');
	$effect(() => {
		const payload = payloadFromState($state.snapshot(store.state) as typeof store.state);
		let cancelled = false;
		transferLink(window.location.origin, resolve('/uvoz'), payload).then((l) => !cancelled && (link = l));
		return () => (cancelled = true);
	});

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(link);
			toast.show(t.settings.copied);
		} catch {
			window.prompt(t.settings.copyLink, link);
		}
	}

	async function share() {
		if (navigator.share) {
			try {
				await navigator.share({ title: t.settings.shareTitle, url: link });
			} catch {
				// Closing the share sheet is not an error.
			}
		} else {
			copyLink();
		}
	}

	function saveBackup() {
		downloadFile(
			`sadnica-vrt-${isoDay(today)}.json`,
			backupFileContent(payloadFromState($state.snapshot(store.state) as typeof store.state), new Date()),
			'application/json'
		);
	}

	let fileInput = $state<HTMLInputElement>();
	let pending = $state<GardenPayload | null>(null);
	let fileError = $state(false);

	async function onFile(e: Event) {
		const file = (e.currentTarget as HTMLInputElement).files?.[0];
		(e.currentTarget as HTMLInputElement).value = '';
		if (!file) return;
		pending = parseBackupFile(await file.text(), new Set(plantsById.keys()));
		fileError = !pending;
	}

	function importPending(mode: ImportMode) {
		if (!pending) return;
		store.importGarden(pending, mode);
		toast.show(t.importer.done(pending.garden.length));
		pending = null;
	}

	let confirmReset = $state(false);
	function reset() {
		store.resetAll();
		goto(resolve('/pocetak'), { replace: true });
	}

	function back() {
		if (navContext.previousHref) history.back();
		else goto(resolve('/'));
	}
</script>

<svelte:head>
	<title>{t.settings.title} · {t.appName}</title>
</svelte:head>

<div class="page settings">
	<header class="top">
		<button type="button" class="icon-btn" aria-label={t.settings.back} onclick={back}><Icon name="back" size={22} /></button>
		<h1>{t.settings.title}</h1>
	</header>

	<section class="card" aria-labelledby="answers-title">
		<h2 id="answers-title">{t.settings.answersTitle}</h2>
		<dl>
			<div><dt>{t.settings.city}</dt><dd>{s.city}</dd></div>
			<div><dt>{t.settings.region}</dt><dd>{t.onboarding.regions[s.region]}</dd></div>
			<div><dt>{t.settings.place}</dt><dd>{t.onboarding.places[s.place].label}</dd></div>
		</dl>
		<a class="btn btn-secondary" href={resolve('/pocetak')}>{t.settings.change}</a>
	</section>

	<section class="card" id="prijenos" aria-labelledby="transfer-title">
		<h2 id="transfer-title">{t.settings.transferTitle}</h2>
		<p class="muted">{t.settings.transferText}</p>

		{#if hasGarden}
			{#if desktop.current && link}
				<div class="qr-box">
					<QrCode url={link} size={140} label={t.settings.qrLabel} />
					<div>
						<strong>{t.settings.qrTitle}</strong>
						<p>{t.settings.qrText}</p>
						<button type="button" class="btn btn-secondary small" onclick={copyLink}>
							<Icon name="link" size={18} />{t.settings.copyLink}
						</button>
					</div>
				</div>
			{:else}
				<button type="button" class="btn btn-primary btn-block" disabled={!link} onclick={share}>
					<Icon name="share" size={20} />{t.settings.share}
				</button>
			{/if}
			<button type="button" class="btn btn-secondary btn-block" onclick={saveBackup}>
				<Icon name="download" size={20} />{t.settings.saveBackup}
			</button>
		{:else}
			<p class="note">{t.settings.emptyGarden}</p>
		{/if}

		<button type="button" class="btn btn-secondary btn-block" onclick={() => fileInput?.click()}>
			<Icon name="upload" size={20} />{t.settings.restoreBackup}
		</button>
		<input bind:this={fileInput} type="file" accept="application/json,.json" hidden onchange={onFile} />
		{#if fileError}<p class="error" role="alert">{t.settings.badFile}</p>{/if}
		{#if pending}
			<div class="pending">
				<ImportConfirm payload={pending} onImport={importPending} onCancel={() => (pending = null)} />
			</div>
		{/if}
	</section>

	<section class="card" aria-labelledby="data-title">
		<h2 id="data-title">{t.settings.dataTitle}</h2>
		<p class="muted">{t.settings.resetText}</p>
		{#if confirmReset}
			<div class="danger" role="alert">
				<strong>{t.settings.resetConfirm}</strong>
				<div class="row">
					<button type="button" class="btn danger-btn" onclick={reset}><Icon name="trash" size={18} />{t.settings.resetYes}</button>
					<button type="button" class="btn btn-secondary" onclick={() => (confirmReset = false)}>{t.settings.resetNo}</button>
				</div>
			</div>
		{:else}
			<button type="button" class="btn btn-secondary" onclick={() => (confirmReset = true)}>
				<Icon name="trash" size={18} />{t.settings.reset}
			</button>
		{/if}
	</section>

	<section class="card" aria-labelledby="about-title">
		<h2 id="about-title">{t.settings.aboutTitle}</h2>
		{#each t.settings.about as line, i (i)}<p class="muted">{line}</p>{/each}
		<p class="version">{t.settings.version(APP_VERSION)}</p>
	</section>
</div>

<style>
	.settings {
		display: grid;
		gap: 12px;
		max-width: 720px;
	}
	.top {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 4px 0 6px;
	}
	.top .icon-btn {
		border: 1px solid var(--border);
	}
	h1 {
		font-size: clamp(2rem, 8vw, 2.75rem);
	}
	.card {
		display: grid;
		gap: 12px;
		justify-items: start;
		padding: 22px;
		border-radius: var(--r-lg);
		background: var(--white);
	}
	.card > :global(.btn-block),
	.card > .pending,
	.card > .qr-box {
		justify-self: stretch;
	}
	h2 {
		font-size: 1.25rem;
	}
	.muted {
		color: var(--muted-2);
	}
	dl {
		display: grid;
		gap: 8px;
		margin: 0;
		justify-self: stretch;
	}
	dl div {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		padding: 10px 14px;
		border-radius: var(--r-sm);
		background: var(--ground);
	}
	dt {
		color: var(--muted-2);
	}
	dd {
		margin: 0;
		font-weight: 700;
		text-align: right;
	}
	.qr-box {
		display: flex;
		align-items: center;
		gap: 18px;
		padding: 14px;
		border-radius: var(--r-md);
		background: var(--butter);
	}
	.qr-box div {
		display: grid;
		gap: 6px;
		justify-items: start;
	}
	.qr-box p {
		font-size: 0.9375rem;
		color: var(--muted-2);
	}
	.small {
		min-height: 44px;
		padding: 0 16px;
		font-size: 0.9375rem;
	}
	.note {
		padding: 12px 14px;
		border-radius: var(--r-sm);
		background: var(--ground);
		color: var(--muted-2);
		font-size: 0.9375rem;
	}
	.error {
		color: #b42318;
		font-weight: 600;
	}
	.pending {
		padding: 16px;
		border-radius: var(--r-md);
		background: var(--mint);
	}
	.danger {
		display: grid;
		gap: 10px;
		padding: 14px;
		border-radius: var(--r-md);
		background: #fde4e1;
		color: #7a1c12;
		justify-self: stretch;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}
	.danger-btn {
		background: #b42318;
		border-color: #b42318;
		color: var(--white);
	}
	.version {
		font-size: 0.875rem;
		color: var(--muted);
	}
	.btn[disabled] {
		opacity: 0.5;
	}
</style>
