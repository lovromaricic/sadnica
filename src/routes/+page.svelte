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
	import { forecast } from '#lib/forecast.svelte.ts';
	import { allAdvice, type Advice } from '#lib/gardenWeather.ts';
	import Modal from '#lib/components/Modal.svelte';
	import { toDate } from '#lib/weather.ts';
	import type { IconName } from '#lib/components/Icon.svelte';

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
	const typicalFrost = $derived(isFrostNear(region, today, rules));
	const outlook = $derived(forecast.outlook(today));
	/** Frost worth acting on (drives "samo uz pokrov"): forecast frost or the typical period. */
	const frostNear = $derived(outlook?.level === 'frost' || typicalFrost);
	/** Garden advice from the forecast, most important first; frost always leads. */
	const advices = $derived(forecast.data ? allAdvice(forecast.data.days, today, { place: store.state.place }) : []);
	const ADVICE_STYLE: Record<Advice['kind'], { icon: IconName; bg: string }> = {
		wind: { icon: 'wind', bg: 'var(--sky)' },
		heat: { icon: 'sun', bg: 'var(--peach)' },
		rain: { icon: 'rain', bg: 'var(--sky)' },
		dry: { icon: 'drop', bg: 'var(--apricot)' },
		coldSoil: { icon: 'ground', bg: 'var(--off)' },
		plantingDay: { icon: 'sprout', bg: 'var(--mint)' }
	};
	interface WeatherItem {
		key: string;
		icon: IconName;
		bg: string;
		/** Frost: the dark card. */
		urgent?: boolean;
		title?: string;
		text: string;
		/** From the live forecast (shows the source line). */
		live: boolean;
	}
	/** Everything worth knowing about the weather, most important first; the card shows the first. */
	const weatherItems = $derived.by(() => {
		const list: WeatherItem[] = [];
		const forecastFrost = outlook && outlook.level !== 'none' && outlook.day && outlook.min !== undefined;
		if (forecastFrost) {
			const when = t.weather.when(outlook.day!, today);
			const temp = t.weather.temp(outlook.min!);
			const frost = outlook.level === 'frost';
			list.push({
				key: 'frost',
				icon: 'snow',
				bg: 'var(--lilac)',
				urgent: frost,
				title: frost ? t.weather.frostTitle : t.weather.coldTitle,
				text: `${frost ? t.weather.frostText(when, temp) : t.weather.coldText(when, temp)} ${t.weather.action}`,
				live: true
			});
		}
		for (const a of advices) {
			list.push({ key: a.kind, ...ADVICE_STYLE[a.kind], title: t.weather.advice[a.kind].title, text: adviceText(a), live: true });
		}
		// The typical frost dates come last: a real forecast is more precise.
		if (typicalFrost && !forecastFrost) {
			list.push(
				outlook
					? { key: 'typical', icon: 'snow', bg: 'var(--lilac)', text: t.weather.calmButTypical(rules.frost[region].text), live: false }
					: {
							key: 'typical',
							icon: 'snow',
							bg: 'var(--lilac)',
							title: t.today.frostTitle,
							text: `${rules.frost[region].text} ${t.today.frostAction}`,
							live: false
						}
			);
		}
		return list;
	});
	let weatherOpen = $state(false);

	/** The coming week at a glance, for the "see all" sheet. */
	const week = $derived(
		(forecast.data?.days ?? []).map((d) => {
			const date = toDate(d.day);
			const icon: IconName = (d.rain ?? 0) >= 1 ? 'rain' : (d.cloud ?? 0) >= 70 ? 'cloud' : 'sun';
			return { ...d, label: t.weather.weekday(date, today), icon };
		})
	);

	function adviceText(a: Advice): string {
		const s = t.weather.advice;
		const when = t.weather.day(a.day, today);
		const pots = store.state.place === 'balcony';
		switch (a.kind) {
			case 'wind':
				return s.wind.text(when, a.value);
			case 'heat':
				return s.heat.text(when, t.weather.temp(a.value));
			case 'rain':
				return pots ? s.rain.balcony(when) : s.rain.text(when, a.value);
			case 'dry':
				return pots ? s.dry.balcony : s.dry.text;
			case 'coldSoil':
				return s.coldSoil.text(t.weather.temp(a.value));
			case 'plantingDay':
				return s.plantingDay.text(when);
		}
	}
</script>

<svelte:head>
	<title>{t.today.title} · {t.appName}</title>
</svelte:head>

{#snippet weatherBody(item: WeatherItem)}
	<span class="alert-icon"><Icon name={item.icon} size={22} /></span>
	<p>
		{#if item.title}<strong>{item.title}</strong>{/if}
		{item.text}
		{#if item.live}<span class="source">{t.weather.source}</span>{/if}
	</p>
{/snippet}

<div class="page today">
	<header class="head">
		<p class="eyebrow">{formatDate(today)}</p>
		<h1>{hero ? t.today.headline(accusative(hero.plant)) : balcony ? t.today.headlineNoneBalcony : t.today.headlineNone}</h1>
	</header>

	{#if weatherItems.length}
		{@const first = weatherItems[0]}
		<aside
			class="alert"
			class:urgent={first.urgent}
			style:background={first.urgent ? undefined : first.bg}
			aria-label={first.title ?? t.weather.allTitle}
		>
			{@render weatherBody(first)}
			{#if weatherItems.length > 1}
				<button type="button" class="see-all" aria-haspopup="dialog" onclick={() => (weatherOpen = true)}>
					{t.weather.seeAll(weatherItems.length)}<Icon name="chevron" size={16} />
				</button>
			{/if}
		</aside>
	{/if}

	<Modal bind:open={weatherOpen} label={t.weather.allTitle} value={t.weather.count(weatherItems.length)} color="var(--sky)">
		<ul class="weather-list">
			{#each weatherItems as item (item.key)}
				<li class="alert" class:urgent={item.urgent} style:background={item.urgent ? undefined : item.bg}>
					{@render weatherBody(item)}
				</li>
			{/each}
		</ul>
		{#if week.length}
			<table class="week">
				<caption>{t.weather.weekTitle}</caption>
				<thead>
					<tr>
						<th scope="col">{t.weather.weekDay}</th>
						<th scope="col"><span class="sr-only">{t.weather.weekSky}</span></th>
						<th scope="col">{t.weather.weekTemp}</th>
						<th scope="col">{t.weather.weekRain}</th>
					</tr>
				</thead>
				<tbody>
					{#each week as d (d.day)}
						<tr>
							<th scope="row">{d.label}</th>
							<td class="sky"><Icon name={d.icon} size={20} /></td>
							<td>{d.max !== undefined ? `${Math.round(d.max)}°` : '–'} <span class="low">{Math.round(d.min)}°</span></td>
							<td>{(d.rain ?? 0) >= 0.5 ? t.weather.mm(d.rain!) : '–'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</Modal>

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
	.alert:not(.urgent) {
		color: var(--ink);
	}
	.alert {
		flex-wrap: wrap;
	}
	.alert p {
		flex: 1;
		min-width: 0;
	}
	.see-all {
		flex-basis: 100%;
		display: inline-flex;
		align-items: center;
		justify-content: flex-end;
		gap: 4px;
		min-height: 44px;
		margin: -6px 0 -10px;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		font-size: 0.9375rem;
		font-weight: 700;
		text-decoration: underline;
		text-underline-offset: 3px;
		cursor: pointer;
	}
	.weather-list {
		display: grid;
		gap: 10px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.week {
		width: 100%;
		margin-top: 6px;
		border-collapse: collapse;
		font-size: 0.9375rem;
		color: var(--ink);
	}
	.week caption {
		text-align: left;
		font-weight: 700;
		padding-bottom: 6px;
	}
	.week thead th {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--muted);
		text-align: left;
		padding: 4px 0;
	}
	.week tbody th {
		text-align: left;
		font-weight: 600;
	}
	.week td,
	.week tbody th {
		padding: 8px 0;
		border-top: 1px solid var(--border);
	}
	.week .sky :global(svg) {
		display: block;
	}
	.low {
		color: var(--muted);
	}
	.alert.urgent {
		background: var(--lilac-ink);
		color: var(--white);
	}
	.alert.urgent .alert-icon {
		background: rgb(255 255 255 / 0.15);
	}
	.source {
		display: block;
		margin-top: 4px;
		font-size: 0.75rem;
		opacity: 0.8;
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
