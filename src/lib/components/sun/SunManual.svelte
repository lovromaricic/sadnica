<script lang="ts">
	import { t } from '../../i18n/hr';
	import { MANUAL_ANSWERS, type ManualAnswer } from '../../sun/logic';
	import type { Unavailable } from '../../sun/sensors';
	import Icon, { type IconName } from '../Icon.svelte';
	import QrCode from '../QrCode.svelte';

	let {
		reason,
		qrUrl = '',
		onAnswer
	}: { reason: Unavailable | null; qrUrl?: string; onAnswer: (a: ManualAnswer) => void } = $props();
	let choice = $state<ManualAnswer | null>(null);

	const STYLE: Record<ManualAnswer, { icon: IconName; bg: string }> = {
		full: { icon: 'sun', bg: 'var(--butter)' },
		morning: { icon: 'sun', bg: 'var(--apricot)' },
		afternoon: { icon: 'sun', bg: 'var(--peach)' },
		never: { icon: 'sunOff', bg: 'var(--off)' }
	};
</script>

<section class="manual">
	<h1>{t.sun.manualTitle}</h1>
	{#if reason}<p class="reason" role="status">{t.sun.reasons[reason]}</p>{/if}
	{#if reason === 'desktop' && qrUrl}
		<div class="qr-box">
			<QrCode url={qrUrl} size={120} label={t.sun.qrLabel(qrUrl)} />
			<div>
				<strong>{t.sun.qrTitle}</strong>
				<p>{t.sun.qrText}</p>
			</div>
		</div>
	{/if}
	<p class="lead">{t.sun.manualText}</p>
	<div class="options" role="group" aria-label={t.sun.manualTitle}>
		{#each MANUAL_ANSWERS as a (a)}
			<button type="button" class="option" style:--tile={STYLE[a].bg} aria-pressed={choice === a} onclick={() => (choice = a)}>
				<span class="icon"><Icon name={STYLE[a].icon} size={24} /></span>
				<span class="text">
					<strong>{t.sun.manualOptions[a].label}</strong>
					<span>{t.sun.manualOptions[a].sub}</span>
				</span>
				<span class="tick" aria-hidden="true"><Icon name="check" size={16} /></span>
			</button>
		{/each}
	</div>
	<button type="button" class="btn btn-primary btn-block" disabled={!choice} onclick={() => choice && onAnswer(choice)}>
		{t.sun.manualCta}
	</button>
</section>

<style>
	.manual {
		display: grid;
		gap: 14px;
	}
	h1 {
		font-size: clamp(1.75rem, 7vw, 2.25rem);
	}
	.reason {
		padding: 12px 16px;
		border-radius: var(--r-sm);
		background: var(--lilac);
		color: var(--lilac-ink);
		font-size: 0.9375rem;
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
		gap: 4px;
	}
	.qr-box p {
		font-size: 0.9375rem;
		color: var(--muted-2);
	}
	.lead {
		color: var(--muted-2);
		font-size: 1.0625rem;
	}
	.options {
		display: grid;
		gap: 10px;
	}
	.option {
		display: flex;
		align-items: center;
		gap: 14px;
		min-height: 76px;
		padding: 14px 18px;
		border: 2px solid transparent;
		border-radius: var(--r-md);
		background: var(--tile);
		text-align: left;
	}
	.option[aria-pressed='true'] {
		border-color: var(--ink);
	}
	.icon {
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
		flex: none;
		border-radius: 50%;
		background: rgb(255 255 255 / 0.7);
	}
	.text {
		display: grid;
		gap: 2px;
	}
	.text strong {
		font-size: 1.0625rem;
	}
	.text span {
		font-size: 0.9375rem;
		color: var(--muted-2);
	}
	.tick {
		display: grid;
		place-items: center;
		width: 26px;
		height: 26px;
		margin-left: auto;
		flex: none;
		border-radius: 50%;
		border: 2px solid rgb(20 32 26 / 0.25);
		color: transparent;
	}
	.option[aria-pressed='true'] .tick {
		background: var(--ink);
		border-color: var(--ink);
		color: var(--lime);
	}
	.btn[disabled] {
		opacity: 0.45;
	}
</style>
