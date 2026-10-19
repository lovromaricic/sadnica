<script lang="ts">
	import type { SvelteSet } from 'svelte/reactivity';
	import { t } from '../../i18n/hr';
	import { angleDiff, arcDirections, hourDirections, project, smoothAngle } from '../../sun/arc';
	import { SUN_HOURS, categoryFromHours } from '../../sun/logic';
	import { watchOrientation } from '../../sun/sensors';
	import Icon from '../Icon.svelte';

	let {
		stream,
		date,
		lat,
		lng,
		blocked,
		onDone,
		onClose
	}: {
		stream: MediaStream;
		date: Date;
		lat: number;
		lng: number;
		/** Hours the user marked as blocked; shared with the result screen. */
		blocked: SvelteSet<number>;
		onDone: () => void;
		onClose: () => void;
	} = $props();

	let video = $state<HTMLVideoElement>();
	let width = $state(0);
	let height = $state(0);
	let heading = $state<number | null>(null);
	let pitch = $state(0);

	$effect(() => {
		if (!video) return;
		video.srcObject = stream;
		video.play().catch(() => {});
	});

	// Sensor events arrive at screen rate; smooth them so the overlay does not jitter.
	$effect(() =>
		watchOrientation((o) => {
			if (o.heading !== null) heading = smoothAngle(heading, o.heading, 0.18);
			pitch = pitch + (o.pitch - pitch) * 0.18;
		})
	);

	const hours = $derived(hourDirections(date, lat, lng, SUN_HOURS));
	const arc = $derived(arcDirections(date, lat, lng, 10));

	const dots = $derived(
		hours.map((h) => ({
			...h,
			night: h.altitude <= 0,
			pos: heading === null ? null : project(h, heading, pitch, width, height)
		}))
	);

	/** Arc as SVG path segments, split wherever it goes behind the camera. */
	const arcPath = $derived.by(() => {
		if (heading === null || !width) return '';
		let d = '';
		let pen = false;
		for (const dir of arc) {
			const p = project(dir, heading, pitch, width, height);
			if (!p.ahead || Math.abs(p.x) > width * 4 || Math.abs(p.y) > height * 4) {
				pen = false;
				continue;
			}
			d += `${pen ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
			pen = true;
		}
		return d;
	});

	const sunnyCount = $derived(dots.filter((d) => !d.night && !blocked.has(d.hour)).length);
	const category = $derived(categoryFromHours(sunnyCount));

	/** Tell the user where to point when no hour is on screen. */
	const hint = $derived.by(() => {
		if (heading === null || dots.some((d) => d.pos?.visible)) return '';
		const noon = hours[4];
		const turn = angleDiff(noon.bearing, heading);
		if (Math.abs(turn) > 25) return turn < 0 ? t.sun.turnLeft : t.sun.turnRight;
		return noon.altitude > pitch ? t.sun.tiltUp : t.sun.tiltDown;
	});

	function toggle(hour: number) {
		if (blocked.has(hour)) blocked.delete(hour);
		else blocked.add(hour);
	}

	function label(d: (typeof dots)[number]) {
		if (d.night) return t.sun.hourNight(d.hour);
		return blocked.has(d.hour) ? t.sun.hourBlocked(d.hour) : t.sun.hourSunny(d.hour);
	}
</script>

<div class="camera" role="dialog" aria-modal="true" aria-label={t.sun.title}>
	<div class="view" bind:clientWidth={width} bind:clientHeight={height}>
		<!-- The feed is only shown on screen; no frame is ever captured or stored. -->
		<video bind:this={video} playsinline muted autoplay aria-hidden="true"></video>
		<svg class="overlay" {width} {height} aria-hidden="true">
			{#if arcPath}
				<path d={arcPath} fill="none" stroke="#FFEFB5" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round" />
			{/if}
		</svg>
		{#each dots as d (d.hour)}
			{#if d.pos?.visible}
				<button
					type="button"
					class="dot"
					class:blocked={blocked.has(d.hour)}
					class:night={d.night}
					style:left="{d.pos.x}px"
					style:top="{d.pos.y}px"
					disabled={d.night}
					aria-pressed={blocked.has(d.hour)}
					aria-label={label(d)}
					onclick={() => toggle(d.hour)}
				>
					<Icon name={blocked.has(d.hour) || d.night ? 'sunOff' : 'sun'} size={20} />
					<span class="dot-hour">{d.hour}</span>
				</button>
			{/if}
		{/each}

		<div class="top">
			<button type="button" class="round" aria-label={t.sun.closeCamera} onclick={onClose}><Icon name="x" size={22} /></button>
			<div class="stats" aria-live="polite">
				<span class="count">{t.sun.counter(sunnyCount)}</span>
				<span class="chip">{t.plant.sun[category]}</span>
			</div>
		</div>
		<p class="hint" aria-live="polite">{hint || t.sun.cameraHint}</p>
	</div>

	<div class="bottom">
		<div class="chips" role="group" aria-label={t.sun.hoursLabel}>
			{#each dots as d (d.hour)}
				<button
					type="button"
					class="hour"
					class:blocked={blocked.has(d.hour) || d.night}
					disabled={d.night}
					aria-pressed={blocked.has(d.hour)}
					aria-label={label(d)}
					onclick={() => toggle(d.hour)}>{d.hour}</button
				>
			{/each}
		</div>
		<button type="button" class="btn done" onclick={onDone}>{t.sun.done}</button>
	</div>
</div>

<style>
	.camera {
		position: fixed;
		inset: 0;
		z-index: 70;
		display: flex;
		flex-direction: column;
		background: #000;
		color: var(--white);
	}
	.view {
		position: relative;
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}
	video {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.overlay {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.dot {
		position: absolute;
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
		margin: -24px 0 0 -24px;
		border: 3px solid var(--white);
		border-radius: 50%;
		background: #ffd84d;
		color: var(--ink);
		box-shadow: 0 4px 14px rgb(0 0 0 / 0.35);
	}
	.dot.blocked {
		background: #e5484d;
		color: var(--white);
	}
	.dot.night {
		background: #6b736e;
		color: var(--white);
		opacity: 0.8;
	}
	.dot-hour {
		position: absolute;
		top: 50px;
		padding: 1px 7px;
		border-radius: 999px;
		background: rgb(0 0 0 / 0.55);
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--white);
	}
	.top {
		position: absolute;
		top: calc(12px + env(safe-area-inset-top));
		left: 12px;
		right: 12px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}
	.round {
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
		border: 0;
		border-radius: 50%;
		background: rgb(0 0 0 / 0.5);
		color: var(--white);
	}
	.stats {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 6px 6px 14px;
		border-radius: 999px;
		background: rgb(0 0 0 / 0.5);
		font-weight: 700;
	}
	.chip {
		padding: 6px 12px;
		border-radius: 999px;
		background: var(--lime);
		color: var(--ink);
		font-size: 0.875rem;
	}
	.hint {
		position: absolute;
		left: 50%;
		bottom: 16px;
		transform: translateX(-50%);
		width: max-content;
		max-width: calc(100% - 32px);
		padding: 10px 16px;
		border-radius: 999px;
		background: rgb(0 0 0 / 0.55);
		font-weight: 600;
		font-size: 0.9375rem;
		text-align: center;
	}
	.bottom {
		display: grid;
		gap: 12px;
		padding: 14px 12px calc(14px + env(safe-area-inset-bottom));
		background: var(--ink);
	}
	.chips {
		display: grid;
		grid-template-columns: repeat(9, minmax(0, 1fr));
		gap: 4px;
	}
	.hour {
		min-height: 44px;
		padding: 0;
		border: 0;
		border-radius: 12px;
		background: #ffd84d;
		color: var(--ink);
		font-weight: 800;
	}
	.hour.blocked {
		background: #e5484d;
		color: var(--white);
	}
	.hour[disabled] {
		background: var(--dark-line);
		color: var(--dark-muted);
	}
	.done {
		background: var(--lime);
		border-color: var(--lime);
		color: var(--ink);
	}
	button:focus-visible {
		outline-color: var(--lime);
	}
</style>
