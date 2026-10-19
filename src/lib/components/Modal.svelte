<script lang="ts">
	import type { Snippet } from 'svelte';
	import { tick } from 'svelte';
	import { t } from '../i18n/hr';
	import Icon from './Icon.svelte';

	let {
		open = $bindable(false),
		label,
		value,
		color = 'var(--lime)',
		tip,
		children
	}: {
		open: boolean;
		label: string;
		value: string;
		color?: string;
		tip?: string;
		children: Snippet;
	} = $props();

	let dialog = $state<HTMLDivElement>();
	let returnFocus: HTMLElement | null = null;
	const titleId = `modal-${Math.random().toString(36).slice(2, 8)}`;
	const labelId = `${titleId}-label`;

	$effect(() => {
		if (!open) return;
		returnFocus = document.activeElement as HTMLElement | null;
		// Phones scroll the content area (see +layout.svelte), desktop scrolls the window.
		const area = document.querySelector<HTMLElement>('[data-scroller]');
		const areaScrolls = !!area && getComputedStyle(area).overflowY === 'auto';
		const scrollY = window.scrollY;
		const body = document.body.style;
		const prev = { position: body.position, top: body.top, width: body.width, overflow: body.overflow };
		const prevArea = area?.style.overflowY ?? '';
		if (areaScrolls) area!.style.overflowY = 'hidden';
		// iOS ignores overflow:hidden on body, so pin it in place instead.
		else Object.assign(body, { position: 'fixed', top: `-${scrollY}px`, width: '100%', overflow: 'hidden' });
		tick().then(() => dialog?.querySelector<HTMLElement>('[data-autofocus]')?.focus());
		return () => {
			if (areaScrolls) area!.style.overflowY = prevArea;
			else {
				Object.assign(body, prev);
				window.scrollTo(0, scrollY);
			}
			returnFocus?.focus({ preventScroll: true });
		};
	});

	function close() {
		open = false;
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			close();
			return;
		}
		if (e.key !== 'Tab' || !dialog) return;
		// Keep focus inside the dialog.
		const focusable = [...dialog.querySelectorAll<HTMLElement>('button, a[href], input, [tabindex]:not([tabindex="-1"])')];
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		// The dialog itself takes focus when its text is clicked; Shift+Tab from there must not leave.
		if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (Esc closes; the overlay is a mouse convenience) -->
	<div class="overlay" onclick={(e) => e.target === e.currentTarget && close()}>
		<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="{labelId} {titleId}" bind:this={dialog} {onkeydown} tabindex="-1">
			<header style:background={color}>
				<div>
					<p class="label" id={labelId}>{label}</p>
					<h2 id={titleId}>{value}</h2>
				</div>
				<button type="button" class="icon-btn" aria-label={t.plant.close} onclick={close}>
					<Icon name="x" size={20} />
				</button>
			</header>
			<div class="body">
				{@render children()}
				{#if tip}
					<div class="tip">
						<strong>{t.plant.goodToKnow}</strong>
						{tip}
					</div>
				{/if}
				<button type="button" class="btn btn-primary btn-block" data-autofocus onclick={close}>{t.plant.understood}</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: grid;
		place-items: end center;
		padding: 12px;
		padding-bottom: max(12px, env(safe-area-inset-bottom));
		background: rgb(20 32 26 / 0.45);
		overscroll-behavior: contain;
		animation: fade 0.2s ease;
	}
	.dialog {
		width: 100%;
		max-width: 480px;
		max-height: calc(100dvh - 24px);
		overflow: auto;
		overscroll-behavior: contain;
		border-radius: var(--r-xl);
		background: var(--white);
		animation: up 0.25s ease;
	}
	.dialog:focus {
		outline: none;
	}
	header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
		padding: 24px 20px 24px 24px;
	}
	.label {
		font-weight: 700;
		font-size: 0.9375rem;
		color: var(--muted-2);
	}
	h2 {
		font-size: 2rem;
		font-weight: 800;
		margin-top: 2px;
	}
	.body {
		display: grid;
		gap: 14px;
		padding: 24px;
		color: var(--muted-2);
	}
	.body :global(p) {
		font-size: 1.0625rem;
	}
	.tip {
		padding: 14px 16px;
		border-radius: var(--r-sm);
		background: var(--ground);
		font-size: 0.9375rem;
	}
	.tip strong {
		color: var(--ink);
	}
	.btn {
		margin-top: 6px;
	}
	@media (min-width: 600px) {
		.overlay {
			place-items: center;
		}
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
	}
	@keyframes up {
		from {
			transform: translateY(24px);
			opacity: 0;
		}
	}
</style>
