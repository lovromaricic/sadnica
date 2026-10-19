<script lang="ts">
	import { resolve } from '$app/paths';
	import { MediaQuery } from 'svelte/reactivity';
	import AddButton from '#lib/components/AddButton.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import PlantArt from '#lib/components/PlantArt.svelte';
	import SunWidget from '#lib/components/sun/SunWidget.svelte';
	import { plants, rules } from '#lib/data/index.ts';
	import { formatDate, monthName, t } from '#lib/i18n/hr.ts';
	import { heroPick, isFrostNear, isInSeason, potFriendly, recommend, upcoming, withSeason } from '#lib/season.ts';
	import { store } from '#lib/store.svelte.ts';
	import { accusative } from '#lib/tasks.ts';
	import { heroReason, timingText } from '#lib/timing.ts';
	import { today } from '#lib/today.ts';

	const desktop = new MediaQuery('min-width: 900px');
	const region = $derived(store.state.region);
	const items = $derived(withSeason(plants, region, today, rules));
	const balcony = $derived(store.state.place === 'balcony');
	const picks = $derived(recommend(items, store.state.place));
	const hero = $derived(heroPick(picks, store.state.place));
	const more = $derived(picks.filter((p) => p !== hero).slice(0, 4));
	const soon = $derived(upcoming(items).slice(0, 2));
	// Balcony gardeners see all pot plants in season; the catalogue opens with the same filters.
	const inSeasonCount = $derived(
		items.filter((i) => isInSeason(i.season) && (!balcony || potFriendly(i.plant))).length
	);
	const frostNear = $derived(isFrostNear(region, today, rules));
</script>

<svelte:head>
	<title>{t.today.title} · {t.appName}</title>
</svelte:head>

<div class="page today">
	<header class="head">
		<p class="eyebrow">{formatDate(today)}</p>
		<h1>{hero ? t.today.headline(accusative(hero.plant)) : balcony ? t.today.headlineNoneBalcony : t.today.headlineNone}</h1>
	</header>

	{#if frostNear}
		<aside class="alert" aria-label={t.today.frostTitle}>
			<span class="alert-icon"><Icon name="snow" size={22} /></span>
			<p>
				<strong>{t.today.frostTitle}</strong>
				{rules.frost[region].text}
				{t.today.frostAction}
			</p>
		</aside>
	{/if}

	<SunWidget />

	<div class="split">
		{#if hero}
			<section class="hero lime" aria-labelledby="hero-name">
				<span class="badge">{t.today.badge}</span>
				<div class="hero-art"><PlantArt art={hero.plant.illustration} size={desktop.current ? 200 : 136} /></div>
				<div class="hero-body">
					<h2 id="hero-name">{hero.plant.name}</h2>
					<p class="reason">{heroReason(hero.plant, region, hero.season)}</p>
					{#if hero.plant.weeklyTip}
						<div class="weekly-tip">
							<strong>{t.today.tipTitle}</strong>
							<p>{hero.plant.weeklyTip}</p>
						</div>
					{/if}
					<a class="btn btn-primary btn-block" href={resolve('/biljke/[id]', { id: hero.plant.id })}>
						{t.today.howTo}
						<Icon name="chevron" size={20} />
					</a>
				</div>
			</section>
		{:else}
			<section class="hero lime">
				<p class="reason">{balcony ? t.today.noneTextBalcony(more.length > 0) : t.today.noneText}</p>
			</section>
		{/if}

		<section class="panel side">
			{#if more.length}
				<h2 class="section-title">{t.today.more}</h2>
				<ul class="rows">
					{#each more as { plant, season } (plant.id)}
						<li class="row" style:--tile={plant.illustration.bg}>
							<span class="row-art"><PlantArt art={plant.illustration} size={52} /></span>
							<a class="row-text" href={resolve('/biljke/[id]', { id: plant.id })}>
								<strong>{plant.name}</strong>
								<span>{timingText(season, frostNear)}</span>
							</a>
							<AddButton {plant} />
						</li>
					{/each}
				</ul>
			{/if}
			{#if inSeasonCount > 0}
				<a class="btn btn-secondary btn-block see-all" href="{resolve('/biljke')}?filtri={balcony ? 'season,balcony' : 'season'}">
					{t.today.seeAll(inSeasonCount)}
				</a>
			{/if}

			{#if soon.length}
				<h2 class="section-title soon-title">{t.today.soon}</h2>
				<ul class="soon">
					{#each soon as { plant, season } (plant.id)}
						<li>
							<a class="soon-tile" style:--tile={plant.illustration.bg} href={resolve('/biljke/[id]', { id: plant.id })}>
								<span class="month">{monthName(season.nextMonth!)}</span>
								<PlantArt art={plant.illustration} size={56} />
								<strong>{plant.name}</strong>
							</a>
						</li>
					{/each}
				</ul>
			{/if}

			<p class="footnote">{t.today.footnote}</p>
		</section>
	</div>
</div>

<style>
	.today {
		display: grid;
		gap: 14px;
	}
	.head {
		display: grid;
		gap: 6px;
		padding: 4px 4px 6px;
	}

	.alert {
		display: flex;
		gap: 14px;
		align-items: flex-start;
		padding: 16px 18px;
		border-radius: var(--r-md);
		background: var(--lilac);
		color: var(--lilac-ink);
	}
	.alert-icon {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		flex: none;
		border-radius: 50%;
		background: rgb(255 255 255 / 0.6);
	}
	.alert p {
		font-size: 0.9375rem;
		align-self: center;
	}

	.split {
		display: grid;
		gap: 14px;
	}

	.hero {
		position: relative;
		display: grid;
		gap: 12px;
		padding: 22px;
		border-radius: var(--r-xl);
		overflow: hidden;
	}
	.badge {
		justify-self: start;
	}
	.hero-art {
		justify-self: center;
		margin: -4px 0 -8px;
	}
	.hero-body {
		display: grid;
		gap: 12px;
	}
	.hero h2 {
		font-size: clamp(2.25rem, 9vw, 3.5rem);
		font-weight: 800;
	}
	.reason {
		font-size: 1.0625rem;
		color: var(--muted-2);
	}
	.weekly-tip {
		display: grid;
		gap: 4px;
		padding: 14px 16px;
		border-radius: var(--r-sm);
		background: rgb(255 255 255 / 0.65);
		font-size: 0.9375rem;
	}

	.side {
		display: grid;
		align-content: start;
		gap: 0;
		padding: 22px 16px;
	}
	.side .section-title {
		padding: 0 6px;
	}
	.rows {
		list-style: none;
		margin: 0 0 14px;
		padding: 0;
		display: grid;
		gap: 8px;
	}
	.row {
		position: relative;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 10px 8px 8px;
		border-radius: var(--r-md);
		background: var(--tile);
	}
	.row-art {
		display: grid;
		place-items: center;
		width: 60px;
		height: 60px;
		flex: none;
		border-radius: 20px;
		background: rgb(255 255 255 / 0.55);
	}
	.row-text {
		flex: 1;
		display: grid;
		gap: 2px;
		text-decoration: none;
		min-width: 0;
	}
	/* Whole row is clickable; the + button sits above the stretched link. */
	.row-text::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
	}
	.row-text:focus-visible {
		outline: none;
	}
	.row-text:focus-visible::after {
		outline: 3px solid var(--focus);
		outline-offset: 2px;
	}
	.row-text strong {
		font-size: 1.0625rem;
	}
	.row-text span {
		color: var(--muted-2);
		font-size: 0.9375rem;
	}
	.see-all {
		margin-bottom: 24px;
	}
	.soon-title {
		margin-top: 4px;
	}
	.soon {
		list-style: none;
		margin: 0 0 16px;
		padding: 0;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}
	.soon-tile {
		display: grid;
		gap: 8px;
		height: 100%;
		padding: 14px;
		border-radius: var(--r-md);
		background: var(--tile);
		text-decoration: none;
	}
	.soon-tile:hover strong {
		text-decoration: underline;
	}
	.month {
		justify-self: start;
		padding: 4px 10px;
		border-radius: 999px;
		background: var(--white);
		font-size: 0.8125rem;
		font-weight: 700;
	}
	.footnote {
		padding: 0 6px;
	}

	@media (min-width: 900px) {
		.split {
			grid-template-columns: 5fr 6fr;
			gap: 16px;
			align-items: stretch;
		}
		.hero {
			padding: 36px;
			align-content: start;
			gap: 16px;
		}
		.hero-art {
			margin: 8px 0;
		}
		.side {
			padding: 32px 28px;
		}
		.side .section-title,
		.footnote {
			padding: 0;
		}
	}
</style>
