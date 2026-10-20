<script lang="ts">
	import { toast } from '../toast.svelte';
	import { t } from '../i18n/hr';
	import Icon from './Icon.svelte';
</script>

<div class="toast-region" role="status" aria-live="polite">
	{#if toast.current}
		{#key toast.current.id}
			<div class="toast">
				<span class="ok" aria-hidden="true"><Icon name="check" size={18} /></span>
				<p>{toast.current.message}</p>
				{#if toast.current.link}
					<a href={toast.current.link.href} onclick={() => toast.dismiss()}>{toast.current.link.label}</a>
				{/if}
				<button class="close" type="button" aria-label={t.toast.close} onclick={() => toast.dismiss()}>
					<Icon name="x" size={18} />
				</button>
			</div>
		{/key}
	{/if}
</div>

<style>
	.toast-region {
		position: fixed;
		z-index: 40;
		left: var(--gutter);
		right: var(--gutter);
		bottom: calc(var(--nav-bottom) + 76px);
		display: flex;
		justify-content: center;
		pointer-events: none;
	}
	.toast {
		pointer-events: auto;
		display: flex;
		align-items: center;
		gap: 12px;
		max-width: 520px;
		width: 100%;
		padding: 8px 8px 8px 14px;
		border-radius: 999px;
		background: var(--ink);
		color: var(--white);
		box-shadow: 0 12px 32px rgb(20 32 26 / 0.3);
		animation: rise 0.25s ease;
	}
	.ok {
		display: grid;
		place-items: center;
		width: 30px;
		height: 30px;
		flex: none;
		border-radius: 50%;
		background: var(--lime);
		color: var(--ink);
	}
	p {
		flex: 1;
		font-weight: 600;
		font-size: 0.9375rem;
	}
	a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 0 16px;
		border-radius: 999px;
		background: var(--lime);
		color: var(--ink);
		font-weight: 700;
		text-decoration: none;
		white-space: nowrap;
		font-size: 0.9375rem;
	}
	.close {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		flex: none;
		border: 0;
		border-radius: 50%;
		background: transparent;
		color: var(--dark-muted);
	}
	@media (hover: hover) {
		.close:hover {
			color: var(--white);
		}
	}
	a:focus-visible,
	.close:focus-visible {
		outline-color: var(--lime);
		border-radius: 999px;
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
	}
	@media (min-width: 900px) {
		.toast-region {
			bottom: 32px;
		}
	}
</style>
