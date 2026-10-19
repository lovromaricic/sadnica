<script lang="ts">
	import { resolve } from '$app/paths';
	import GardenCalendar from '#lib/components/GardenCalendar.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import PlantArt from '#lib/components/PlantArt.svelte';
	import { plantsById, rules } from '#lib/data/index.ts';
	import type { Plant } from '#lib/data/schema.ts';
	import { t } from '#lib/i18n/hr.ts';
	import { gardenNeighbours, listNames } from '#lib/companions.ts';
	import { STAGE_PROGRESS, harvestText, nextStage, nextStepText, stageDateText } from '#lib/garden.ts';
	import { store } from '#lib/store.svelte.ts';
	import type { GardenItem } from '#lib/storage.ts';
	import { generateTasks, weekKey } from '#lib/tasks.ts';
	import { today } from '#lib/today.ts';
	import { frostSoon } from '#lib/forecast.svelte.ts';

	const region = $derived(store.state.region);
	const items = $derived(
		store.state.garden
			.map((item) => ({ item, plant: plantsById.get(item.plantId) }))
			.filter((x): x is { item: GardenItem; plant: Plant } => !!x.plant)
	);
	const week = weekKey(today);
	const doneIds = $derived(
		new Set(
			Object.keys(store.state.tasksDone)
				.filter((k) => k.startsWith(`${week}:`))
				.map((k) => k.slice(week.length + 1))
		)
	);
	const tasks = $derived(generateTasks(store.state.garden, plantsById, region, today, rules, doneIds, frostSoon(region, today, rules)));
	const doneCount = $derived(tasks.filter((task) => store.state.tasksDone[`${week}:${task.id}`]).length);

</script>

<svelte:head>
	<title>{t.garden.title} · {t.appName}</title>
</svelte:head>

<div class="page garden">
	<header class="head">
		<h1>{t.garden.title}</h1>
		<p class="eyebrow">{t.garden.subtitle(items.length, store.state.city)}</p>
	</header>

	{#if items.length === 0}
		<section class="empty lime">
			<div class="empty-art" aria-hidden="true">
				<Icon name="sprout" size={56} />
			</div>
			<h2>{t.garden.emptyTitle}</h2>
			<p>{t.garden.emptyText}</p>
			<a class="btn btn-primary" href={resolve('/biljke')}>{t.garden.emptyCta}</a>
		</section>
	{:else}
		<section class="tasks dark" aria-labelledby="tasks-title">
			<div class="tasks-head">
				<h2 id="tasks-title">{t.garden.tasksTitle}</h2>
				{#if tasks.length}
					<p class="progress-text">{t.garden.tasksProgress(doneCount, tasks.length)}</p>
				{/if}
			</div>
			{#if tasks.length}
				<ul class="task-list">
					{#each tasks as task (task.id)}
						{@const key = `${week}:${task.id}`}
						{@const done = !!store.state.tasksDone[key]}
						<li>
							<button type="button" class="task" class:done aria-pressed={done} onclick={() => store.toggleTask(week, task.id)}>
								<span class="check" aria-hidden="true"><Icon name="check" size={16} /></span>
								<span>{task.text}</span>
							</button>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="no-tasks">{t.garden.tasksEmpty}</p>
			{/if}
		</section>

		<section aria-labelledby="plants-title">
			<h2 id="plants-title" class="section-title plants-title">{t.garden.plantsTitle}</h2>
			<ul class="cards">
				{#each items as { item, plant } (plant.id)}
					{@const next = nextStage(item.stage)}
					{@const badNb = gardenNeighbours(plant, items.map((x) => x.plant)).bad}
					{@const dated = stageDateText(item, today)}
					{@const harvest = harvestText(item, plant, region, today)}
					<li class="card">
						<div class="card-art" style:background={plant.illustration.bg}>
							<PlantArt art={plant.illustration} size={84} />
							<span class="stage stage-{item.stage}">{t.garden.stages[item.stage]}</span>
						</div>
						<div class="card-body">
							<a class="card-link" href={resolve('/biljke/[id]', { id: plant.id })}>{plant.name}</a>
							<div class="bar" aria-hidden="true">
								<span style:width="{STAGE_PROGRESS[item.stage]}%"></span>
							</div>
							<p class="sr-only">{t.garden.progress(t.garden.stages[item.stage])}</p>
							{#if dated || harvest}
								<p class="dates">
									{#if dated}<span>{dated}</span>{/if}
									{#if harvest}<span class="harvest">{harvest}</span>{/if}
								</p>
							{/if}
							{#if item.log.some((e) => e.harvest)}<p class="harvested">{t.log.harvestCount(item.log.filter((e) => e.harvest).length)}</p>{/if}
							{#if badNb.length}<p class="not-with">{t.companions.notWith(listNames(badNb))}</p>{/if}
							<p class="next">{nextStepText(item.stage, plant, region, today, rules)}</p>
							{#if next}
								<button type="button" class="advance" onclick={() => store.advanceStage(plant.id)}>
									<Icon name="arrowUp" size={18} />
									{t.garden.advance(t.garden.stages[next])}
								</button>
							{/if}
						</div>
					</li>
				{/each}
				<li>
					<a class="add-card" href={resolve('/biljke')}>
						<span class="add-icon"><Icon name="plus" size={26} /></span>
						{t.garden.add}
					</a>
				</li>
			</ul>
		</section>

		<GardenCalendar plants={items.map((x) => x.plant)} {region} month={today.getMonth() + 1} />

		<a class="transfer-link" href="{resolve('/postavke')}#prijenos">
			<Icon name="phone" size={18} />{t.settings.gardenLink}
		</a>
	{/if}
</div>

<style>
	.garden {
		display: grid;
		gap: 16px;
	}
	.head {
		display: grid;
		gap: 6px;
		padding: 4px 4px 0;
	}

	.empty {
		display: grid;
		justify-items: start;
		gap: 12px;
		padding: 28px 24px;
		border-radius: var(--r-xl);
	}
	.empty-art {
		display: grid;
		place-items: center;
		width: 88px;
		height: 88px;
		border-radius: 50%;
		background: var(--ink);
		color: var(--lime);
		margin-bottom: 4px;
	}
	.empty p {
		color: var(--muted-2);
		font-size: 1.0625rem;
		max-width: 40ch;
	}

	.tasks {
		padding: 22px 16px;
		border-radius: var(--r-xl);
	}
	.tasks-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 4px 16px;
		padding: 0 4px 14px;
	}
	.tasks h2 {
		color: var(--white);
	}
	.progress-text,
	.no-tasks {
		color: var(--dark-muted);
		font-size: 0.9375rem;
	}
	.no-tasks {
		padding: 0 4px;
	}
	.task-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 8px;
	}
	.task {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		min-height: 56px;
		padding: 10px 14px;
		border: 1px solid var(--dark-line);
		border-radius: var(--r-sm);
		background: rgb(255 255 255 / 0.04);
		color: var(--white);
		text-align: left;
		font-weight: 600;
	}
	.task:focus-visible {
		outline-color: var(--lime);
	}
	.check {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		flex: none;
		border-radius: 50%;
		border: 2px solid var(--dark-muted);
		color: transparent;
	}
	.task.done .check {
		background: var(--lime);
		border-color: var(--lime);
		color: var(--ink);
	}
	.task.done span:last-child {
		color: var(--dark-muted);
		text-decoration: line-through;
	}

	.plants-title {
		padding: 0 4px;
	}
	.cards {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 10px;
	}
	.card {
		position: relative;
		display: flex;
		gap: 14px;
		padding: 10px;
		border-radius: var(--r-lg);
		background: var(--white);
	}
	.card-art {
		position: relative;
		display: grid;
		place-items: center;
		width: 112px;
		flex: none;
		border-radius: var(--r-md);
		padding: 10px 6px 34px;
	}
	.stage {
		position: absolute;
		bottom: 8px;
		left: 50%;
		transform: translateX(-50%);
		padding: 4px 9px;
		border-radius: 999px;
		background: var(--white);
		font-size: 0.6875rem;
		font-weight: 700;
		white-space: nowrap;
	}
	.stage-ready {
		background: var(--ink);
		color: var(--lime);
	}
	.card-body {
		display: grid;
		align-content: start;
		gap: 8px;
		min-width: 0;
		flex: 1;
		padding: 6px 4px 4px 0;
	}
	.card-link {
		font-family: var(--font-head);
		font-weight: 800;
		font-size: 1.375rem;
		letter-spacing: -0.02em;
		text-decoration: none;
		line-height: 1.1;
	}
	.card-link::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
	}
	.card-link:focus-visible {
		outline: none;
	}
	.card-link:focus-visible::after {
		outline: 3px solid var(--focus);
		outline-offset: 2px;
	}
	.bar {
		height: 8px;
		border-radius: 999px;
		background: var(--off);
		overflow: hidden;
	}
	.bar span {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: var(--ink);
		transition: width 0.3s ease;
	}
	.dates {
		display: flex;
		flex-wrap: wrap;
		gap: 2px 10px;
		font-size: 0.875rem;
		font-weight: 600;
	}
	.harvest {
		color: #7a5a00;
	}
	.harvested {
		justify-self: start;
		padding: 3px 10px;
		border-radius: 999px;
		background: var(--butter);
		font-size: 0.8125rem;
		font-weight: 700;
	}
	.not-with {
		justify-self: start;
		padding: 3px 10px;
		border-radius: 999px;
		background: var(--lilac);
		color: var(--lilac-ink);
		font-size: 0.8125rem;
		font-weight: 700;
	}
	.next {
		font-size: 0.9375rem;
		color: var(--muted-2);
	}
	.advance {
		position: relative;
		z-index: 1;
		justify-self: start;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 44px;
		padding: 0 14px;
		border-radius: 999px;
		border: 2px solid var(--ink);
		background: var(--white);
		font-weight: 700;
		font-size: 0.875rem;
	}
	.advance:hover {
		background: var(--lime);
	}
	.transfer-link {
		justify-self: start;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		padding: 0 4px;
		color: var(--muted-2);
		font-weight: 600;
		text-underline-offset: 4px;
	}
	.add-card {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		min-height: 88px;
		height: 100%;
		border-radius: var(--r-lg);
		border: 2px dashed var(--muted);
		text-decoration: none;
		font-weight: 700;
		font-size: 1.0625rem;
		color: var(--muted-2);
	}
	.add-card:hover {
		border-color: var(--ink);
		color: var(--ink);
	}
	.add-icon {
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: var(--white);
	}

	@media (min-width: 900px) {
		.empty {
			padding: 48px;
		}
		.tasks {
			padding: 32px;
		}
		.tasks-head {
			padding: 0 0 18px;
		}
		.task-list {
			grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
			gap: 10px;
		}
		.task {
			min-height: 72px;
			align-items: flex-start;
		}
		.cards {
			grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
			gap: 14px;
		}
		.card {
			flex-direction: column;
			padding: 12px 12px 18px;
		}
		.card-art {
			width: auto;
			padding: 24px 12px 44px;
		}
		.card-art :global(svg) {
			width: 128px;
			height: 128px;
		}
		.stage {
			font-size: 0.8125rem;
			bottom: 12px;
			padding: 5px 12px;
		}
		.card-body {
			padding: 4px 6px 0;
		}
		.add-card {
			flex-direction: column;
			min-height: 320px;
		}
	}
</style>
