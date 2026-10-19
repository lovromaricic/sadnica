<script lang="ts">
	import { t } from '../../i18n/hr';
	import Icon from '../Icon.svelte';

	let { busy = false, onStart, onManual }: { busy?: boolean; onStart: () => void; onManual: () => void } = $props();
</script>

<section class="intro">
	<div class="hero">
		<span class="sun" aria-hidden="true"><Icon name="sun" size={40} /></span>
		<h1>{t.sun.introTitle}</h1>
	</div>
	<ol class="steps">
		{#each t.sun.introSteps as step, i (i)}
			<li><span class="num" aria-hidden="true">{i + 1}</span><span>{step}</span></li>
		{/each}
	</ol>
	<p class="privacy"><Icon name="lock" size={16} />{t.sun.privacy}</p>
	<div class="actions">
		<button type="button" class="btn btn-primary btn-block" onclick={onStart} disabled={busy} aria-busy={busy}>
			<Icon name="camera" size={20} />{busy ? t.sun.starting : t.sun.start}
		</button>
		<button type="button" class="btn btn-secondary btn-block" onclick={onManual}>{t.sun.manualInstead}</button>
	</div>
</section>

<style>
	.intro {
		display: grid;
		gap: 16px;
	}
	.hero {
		display: grid;
		gap: 14px;
		padding: 24px;
		border-radius: var(--r-xl);
		background: var(--butter);
	}
	.sun {
		display: grid;
		place-items: center;
		width: 72px;
		height: 72px;
		border-radius: 50%;
		background: var(--ink);
		color: var(--gold);
	}
	h1 {
		font-size: clamp(1.75rem, 7vw, 2.5rem);
	}
	.steps {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 8px;
	}
	.steps li {
		display: flex;
		align-items: flex-start;
		gap: 14px;
		padding: 14px;
		border-radius: var(--r-sm);
		background: var(--white);
		font-size: 1.0625rem;
	}
	.num {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		flex: none;
		border-radius: 50%;
		background: var(--lime);
		font-family: var(--font-head);
		font-weight: 800;
	}
	.privacy {
		justify-self: start;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 8px 14px;
		border-radius: 999px;
		background: var(--mint);
		font-size: 0.875rem;
		font-weight: 700;
	}
	.actions {
		display: grid;
		gap: 10px;
	}
	.btn[disabled] {
		opacity: 0.7;
	}
</style>
