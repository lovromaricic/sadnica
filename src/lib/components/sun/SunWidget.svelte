<script lang="ts">
	import { resolve } from '$app/paths';
	import { MediaQuery } from 'svelte/reactivity';
	import { t } from '../../i18n/hr';
	import Icon from '../Icon.svelte';
	import QrCode from '../QrCode.svelte';

	const desktop = new MediaQuery('min-width: 900px');
	const url = $derived(desktop.current ? new URL(resolve('/sunce'), window.location.origin).href : '');
</script>

<aside class="sun-widget" aria-labelledby="sun-widget-title">
	<span class="icon" aria-hidden="true"><Icon name="sun" size={26} /></span>
	<div class="text">
		<h2 id="sun-widget-title">{t.sun.widgetTitle}</h2>
		<p class="mobile">{t.sun.widgetText}</p>
		<p class="desktop">{t.sun.widgetTextDesktop}</p>
	</div>
	<a class="cta" href={resolve('/sunce')}>
		<Icon name="camera" size={18} />
		<span class="mobile">{t.sun.widgetCta}</span>
		<span class="desktop">{t.sun.widgetCtaDesktop}</span>
	</a>
	{#if url}
		<figure class="qr-box">
			<QrCode {url} size={88} label={t.sun.qrLabel(url)} />
			<figcaption>{t.sun.qrCaption}</figcaption>
		</figure>
	{/if}
</aside>

<style>
	.sun-widget {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 12px 14px;
		align-items: start;
		padding: 16px 18px;
		border-radius: var(--r-md);
		background: var(--butter);
	}
	.icon {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: var(--ink);
		color: var(--gold);
	}
	.text {
		display: grid;
		gap: 4px;
	}
	h2 {
		font-size: 1.125rem;
	}
	p {
		font-size: 0.9375rem;
		color: var(--muted-2);
	}
	.cta {
		grid-column: 1 / -1;
		justify-self: start;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 48px;
		padding: 0 20px;
		border-radius: 999px;
		background: var(--ink);
		color: var(--white);
		font-weight: 700;
		text-decoration: none;
	}
	.desktop {
		display: none;
	}
	.qr-box {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 0;
		padding: 6px 14px 6px 6px;
		border-radius: 18px;
		background: var(--white);
	}
	figcaption {
		max-width: 9ch;
		font-size: 0.8125rem;
		font-weight: 600;
		line-height: 1.25;
		color: var(--muted-2);
	}
	@media (min-width: 900px) {
		.sun-widget {
			grid-template-columns: auto 1fr auto auto;
			align-items: center;
			padding: 18px 22px;
		}
		.cta {
			grid-column: auto;
		}
		.mobile {
			display: none;
		}
		.desktop {
			display: inline;
		}
		p.desktop {
			display: block;
		}
	}
</style>
