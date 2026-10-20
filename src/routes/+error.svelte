<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { t } from '#lib/i18n/hr.ts';

	const missing = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{missing ? t.error.title : t.error.other} · {t.appName}</title>
</svelte:head>

<section class="error">
	<h1>{missing ? t.error.title : t.error.other}</h1>
	<p>{missing ? t.error.text : t.error.otherText}</p>
	<a class="btn btn-primary" href={resolve('/')}>{t.error.home}</a>
</section>

<style>
	.error {
		display: grid;
		justify-items: start;
		gap: 14px;
		max-width: 560px;
		margin: 48px auto;
		padding: 28px 24px;
		border-radius: var(--r-xl);
		background: var(--lime);
	}
	p {
		color: var(--muted-2);
		font-size: 1.0625rem;
	}
</style>
