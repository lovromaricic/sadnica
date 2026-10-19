<script lang="ts">
	import type { Plant } from '../data/schema';
	import { t } from '../i18n/hr';
	import Icon from './Icon.svelte';

	/** Common problems for a plant, each opened with a tap (native details/summary). */
	let { plant }: { plant: Plant } = $props();
</script>

{#if plant.problems?.length}
	<section class="problems" aria-labelledby="problems-title">
		<h2 id="problems-title" class="section-title">{t.problems.title}</h2>
		<p class="lead">{t.problems.lead}</p>
		<div class="list">
			{#each plant.problems as problem (problem.title)}
				<details>
					<summary>
						<span>{problem.title}</span>
						<span class="chev" aria-hidden="true"><Icon name="chevron" size={18} /></span>
					</summary>
					<div class="body">
						<p><strong>{t.problems.signs}:</strong> {problem.signs}</p>
						<p><strong>{t.problems.fix}:</strong> {problem.fix}</p>
					</div>
				</details>
			{/each}
		</div>
	</section>
{/if}

<style>
	.problems {
		padding: 22px 16px;
		border-radius: var(--r-xl);
		background: var(--peach);
	}
	.section-title {
		padding: 0 4px;
	}
	.lead {
		margin: -6px 4px 12px;
		font-size: 0.9375rem;
		color: var(--muted-2);
	}
	.list {
		display: grid;
		gap: 8px;
	}
	details {
		border-radius: var(--r-sm);
		background: var(--white);
	}
	summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		min-height: 52px;
		padding: 12px 14px;
		font-weight: 700;
		cursor: pointer;
		list-style: none;
		border-radius: var(--r-sm);
	}
	summary::-webkit-details-marker {
		display: none;
	}
	.chev {
		display: grid;
		flex: none;
		transition: transform 0.2s ease;
	}
	details[open] .chev {
		transform: rotate(90deg);
	}
	.body {
		display: grid;
		gap: 8px;
		padding: 0 14px 14px;
		font-size: 0.9375rem;
		color: var(--muted-2);
	}
	.body strong {
		color: var(--ink);
	}
	@media (min-width: 900px) {
		.problems {
			padding: 28px;
		}
		.section-title,
		.lead {
			padding: 0;
			margin-left: 0;
		}
	}
</style>
