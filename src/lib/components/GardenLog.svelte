<script lang="ts">
	import { isoDay, parseDay } from '../garden';
	import { formatDay, t } from '../i18n/hr';
	import { store } from '../store.svelte';
	import { LOG_TEXT_MAX, type GardenItem } from '../storage';
	import { today } from '../today';
	import Icon from './Icon.svelte';

	/** Notes and harvests for one garden plant, newest first. */
	let { plantId, item }: { plantId: string; item: GardenItem } = $props();

	const maxDay = isoDay(today);
	let text = $state('');
	let day = $state(maxDay);
	let harvest = $state(false);
	const entries = $derived([...item.log].reverse());
	const ids = $derived({ text: `log-text-${plantId}`, day: `log-day-${plantId}` });

	function save(e: SubmitEvent) {
		e.preventDefault();
		if (!text.trim()) return;
		store.addLog(plantId, { day: day && day <= maxDay ? day : maxDay, text, harvest });
		text = '';
		harvest = false;
		day = maxDay;
	}

	const pretty = (d: string) => formatDay(parseDay(d), today.getFullYear());
</script>

<section class="log" aria-labelledby="log-title-{plantId}">
	<h2 id="log-title-{plantId}" class="section-title">{t.log.title}</h2>
	<p class="lead">{t.log.text}</p>

	<form class="form" onsubmit={save}>
		<label class="sr-only" for={ids.text}>{t.log.label}</label>
		<textarea id={ids.text} bind:value={text} rows="2" maxlength={LOG_TEXT_MAX} placeholder={t.log.placeholder}></textarea>
		<div class="row">
			<label class="date">
				<span class="sr-only">{t.log.dateLabel}</span>
				<input id={ids.day} type="date" bind:value={day} max={maxDay} />
			</label>
			<button type="button" class="toggle" aria-pressed={harvest} onclick={() => (harvest = !harvest)}>
				<span class="box" aria-hidden="true"><Icon name="check" size={14} /></span>{t.log.harvestToggle}
			</button>
			<button type="submit" class="btn btn-primary save" disabled={!text.trim()}>{t.log.save}</button>
		</div>
	</form>

	{#if entries.length}
		<ul class="entries">
			{#each entries as entry (entry.id)}
				<li class:harvest={entry.harvest}>
					<div class="meta">
						<span class="day">{pretty(entry.day)}</span>
						{#if entry.harvest}<span class="badge-harvest">{t.log.harvestBadge}</span>{/if}
					</div>
					<p>{entry.text}</p>
					<button type="button" class="delete" aria-label={t.log.delete(pretty(entry.day))} onclick={() => store.deleteLog(plantId, entry.id)}>
						<Icon name="trash" size={18} />
					</button>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="empty">{t.log.empty}</p>
	{/if}
</section>

<style>
	.log {
		padding: 22px 16px;
		border-radius: var(--r-xl);
		background: var(--white);
	}
	.section-title {
		padding: 0 4px;
	}
	.lead {
		margin: -6px 4px 12px;
		font-size: 0.9375rem;
		color: var(--muted-2);
	}
	.form {
		display: grid;
		gap: 8px;
		padding: 12px;
		border-radius: var(--r-sm);
		background: var(--ground);
	}
	textarea {
		width: 100%;
		min-height: 64px;
		padding: 10px 12px;
		border: 2px solid var(--border);
		border-radius: 12px;
		background: var(--white);
		font-size: 1rem;
		resize: vertical;
	}
	textarea:focus,
	input:focus {
		border-color: var(--ink);
		outline: none;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
	}
	input[type='date'] {
		min-height: 44px;
		padding: 0 10px;
		border: 2px solid var(--border);
		border-radius: 12px;
		background: var(--white);
		font-size: 0.9375rem;
	}
	.toggle {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		padding: 0 12px;
		border: 0;
		border-radius: 12px;
		background: transparent;
		font-weight: 700;
		font-size: 0.9375rem;
	}
	.box {
		display: grid;
		place-items: center;
		width: 22px;
		height: 22px;
		border-radius: 7px;
		border: 2px solid var(--ink);
		background: var(--white);
		color: transparent;
	}
	.toggle[aria-pressed='true'] .box {
		background: var(--gold);
		color: var(--ink);
	}
	.save {
		min-height: 44px;
		margin-left: auto;
		padding: 0 20px;
	}
	.save[disabled] {
		opacity: 0.45;
	}
	.entries {
		list-style: none;
		margin: 12px 0 0;
		padding: 0;
		display: grid;
		gap: 8px;
	}
	.entries li {
		position: relative;
		display: grid;
		gap: 4px;
		padding: 12px 52px 12px 14px;
		border-radius: var(--r-sm);
		background: var(--ground);
	}
	.entries li.harvest {
		background: var(--butter);
	}
	.meta {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.day {
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--muted-2);
	}
	.badge-harvest {
		padding: 2px 8px;
		border-radius: 999px;
		background: var(--gold);
		font-size: 0.75rem;
		font-weight: 700;
	}
	.entries p {
		white-space: pre-line;
		overflow-wrap: anywhere;
	}
	.delete {
		position: absolute;
		top: 4px;
		right: 4px;
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border: 0;
		border-radius: 50%;
		background: transparent;
		color: var(--muted-2);
	}
	.delete:hover {
		color: #b42318;
	}
	.empty {
		margin: 12px 4px 0;
		font-size: 0.9375rem;
		color: var(--muted);
	}
	@media (min-width: 900px) {
		.log {
			padding: 8px 0;
		}
		.section-title,
		.lead {
			padding: 0;
			margin-left: 0;
		}
	}
</style>
