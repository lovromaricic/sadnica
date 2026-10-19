<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import { t } from '../../i18n/hr';

	let { onContinue, onSkip }: { onContinue: () => void; onSkip: () => void } = $props();
	const reduced = new MediaQuery('prefers-reduced-motion: reduce');
	const PATH = 'M100 60 C100 25 150 25 150 60 C150 95 100 95 100 60 C100 25 50 25 50 60 C50 95 100 95 100 60';
</script>

<section class="calibrate">
	<div class="art lime">
		<svg viewBox="0 0 200 120" width="100%" height="180" aria-hidden="true">
			<path d={PATH} fill="none" stroke="#14201A" stroke-opacity="0.25" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 10" />
			<g>
				<rect x="-11" y="-19" width="22" height="38" rx="5" fill="#14201A" />
				<rect x="-8" y="-15" width="16" height="27" rx="2" fill="#D9F2A6" />
				{#if !reduced.current}
					<animateMotion dur="3.2s" repeatCount="indefinite" path={PATH} rotate="auto" />
				{:else}
					<animateMotion dur="0.01s" fill="freeze" path={PATH} />
				{/if}
			</g>
		</svg>
	</div>
	<h1>{t.sun.calTitle}</h1>
	<p>{t.sun.calText}</p>
	<div class="actions">
		<button type="button" class="btn btn-primary btn-block" onclick={onContinue}>{t.sun.calContinue}</button>
		<button type="button" class="btn btn-secondary btn-block" onclick={onSkip}>{t.sun.calSkip}</button>
	</div>
</section>

<style>
	.calibrate {
		display: grid;
		gap: 14px;
	}
	.art {
		padding: 16px;
		border-radius: var(--r-xl);
	}
	h1 {
		font-size: clamp(1.75rem, 7vw, 2.25rem);
	}
	p {
		color: var(--muted-2);
		font-size: 1.0625rem;
	}
	.actions {
		display: grid;
		gap: 10px;
		margin-top: 6px;
	}
</style>
