<script lang="ts">
	import type { Plant } from '../data/schema';

	let { art, size = 96, label }: { art: Plant['illustration']; size?: number; label?: string } = $props();

	// Shared foliage colours so every plant reads as one family.
	const LEAF = '#7CC46A';
	const LEAF_STROKE = '#2F5E2A';
	const SW = 2.5;
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 64 64"
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
	focusable="false"
	stroke-width={SW}
	stroke-linecap="round"
	stroke-linejoin="round"
>
	{#if art.kind === 'bulb'}
		<path d="M30 15 C28 10 25 6 20 4 M34 15 C36 10 39 7 44 5 M32 15 V5" fill="none" stroke={LEAF_STROKE} />
		<path d="M32 15 C34 22 46 26 49 37 C52 48 43 57 32 57 C21 57 12 48 15 37 C18 26 30 22 32 15 Z" fill={art.fill} stroke={art.stroke} />
		<path d="M32 21 C25 30 24 46 29 56 M32 21 C39 30 40 46 35 56" fill="none" stroke={art.stroke} />
		<path d="M27 57 l-2 4 M32 57 v4 M37 57 l2 4" fill="none" stroke={art.stroke} />
	{:else if art.kind === 'pod'}
		<path d="M48 9 C50 6 53 5 56 6" fill="none" stroke={LEAF_STROKE} />
		<path d="M48 9 C56 18 50 38 36 49 C26 57 13 59 8 55 C6 51 12 47 20 42 C32 34 40 22 48 9 Z" fill={art.fill} stroke={art.stroke} />
		<ellipse cx="40" cy="25" rx="4.5" ry="5.5" transform="rotate(35 40 25)" fill="#DDF0C8" stroke={art.stroke} />
		<ellipse cx="32" cy="35" rx="4.5" ry="5.5" transform="rotate(50 32 35)" fill="#DDF0C8" stroke={art.stroke} />
		<ellipse cx="22" cy="43" rx="4.5" ry="5.5" transform="rotate(62 22 43)" fill="#DDF0C8" stroke={art.stroke} />
	{:else if art.kind === 'rosette'}
		<path d="M32 54 C22 50 8 46 7 34 C16 32 26 40 32 54 Z" fill={art.fill} stroke={art.stroke} />
		<path d="M32 54 C42 50 56 46 57 34 C48 32 38 40 32 54 Z" fill={art.fill} stroke={art.stroke} />
		<path d="M32 54 C24 44 14 30 20 18 C29 22 33 38 32 54 Z" fill={art.fill} stroke={art.stroke} />
		<path d="M32 54 C40 44 50 30 44 18 C35 22 31 38 32 54 Z" fill={art.fill} stroke={art.stroke} />
		<path d="M32 54 C28 42 27 22 32 10 C37 22 36 42 32 54 Z" fill={art.fill} stroke={art.stroke} />
		<path d="M32 54 V22" fill="none" stroke={art.stroke} />
	{:else if art.kind === 'leaf'}
		<path d="M30 58 C30 50 28 44 24 40" fill="none" stroke={art.stroke} />
		<path d="M24 41 C10 38 5 24 9 10 C24 10 32 24 24 41 Z" fill={art.fill} stroke={art.stroke} />
		<path d="M24 41 C19 31 15 22 10 12" fill="none" stroke={art.stroke} />
		<path d="M30 50 C40 52 54 46 57 30 C44 26 32 34 30 50 Z" fill={art.fill} stroke={art.stroke} />
		<path d="M30 50 C38 44 46 38 55 32" fill="none" stroke={art.stroke} />
	{:else if art.kind === 'tomato'}
		<circle cx="32" cy="37" r="20" fill={art.fill} stroke={art.stroke} />
		<path d="M22 32 C23 27 27 24 31 23" fill="none" stroke="#FFFFFF" stroke-opacity="0.55" />
		<path
			d="M32 20 L26 14 L30 21 L20 20 L29 24 L24 30 L32 25 L40 30 L35 24 L44 20 L34 21 L38 14 Z"
			fill={LEAF}
			stroke={LEAF_STROKE}
		/>
		<path d="M32 20 V9 C32 7 34 6 36 6" fill="none" stroke={LEAF_STROKE} />
	{:else if art.kind === 'root'}
		<path d="M30 17 C27 11 22 7 16 6 M32 17 C32 11 33 7 35 3 M34 17 C38 12 43 10 49 10" fill="none" stroke={LEAF_STROKE} />
		<path d="M22 19 C22 16 42 16 42 19 C42 30 36 46 33 58 C32.5 60 31.5 60 31 58 C28 46 22 30 22 19 Z" fill={art.fill} stroke={art.stroke} />
		<path d="M26 27 h5 M33 34 h5 M27 41 h4 M32 48 h3" fill="none" stroke={art.stroke} />
	{:else if art.kind === 'pepper'}
		<path d="M32 22 C32 16 34 12 39 9" fill="none" stroke={LEAF_STROKE} />
		<path d="M24 22 C27 19 37 19 40 22" fill={LEAF} stroke={LEAF_STROKE} />
		<path d="M20 24 C13 29 13 46 19 54 C24 60 30 58 32 54 C34 58 40 60 45 54 C51 46 51 29 44 24 C40 21 36 23 32 24 C28 23 24 21 20 24 Z" fill={art.fill} stroke={art.stroke} />
		<path d="M32 26 C30 36 30 46 32 54" fill="none" stroke={art.stroke} />
		<path d="M23 30 C21 34 21 38 22 41" fill="none" stroke="#FFFFFF" stroke-opacity="0.5" />
	{:else if art.kind === 'cucumber'}
		<path d="M50 12 C52 9 55 8 58 9" fill="none" stroke={LEAF_STROKE} />
		<path d="M13 47 C9 41 13 33 21 27 L42 13 C48 9 54 13 52 19 C50 25 45 29 39 33 L21 47 C17 50 15 49 13 47 Z" fill={art.fill} stroke={art.stroke} />
		<path d="M20 38 L41 23" fill="none" stroke="#FFFFFF" stroke-opacity="0.35" />
		<circle cx="26" cy="38" r="1.3" fill={art.stroke} stroke="none" />
		<circle cx="34" cy="31" r="1.3" fill={art.stroke} stroke="none" />
		<circle cx="42" cy="25" r="1.3" fill={art.stroke} stroke="none" />
		<circle cx="22" cy="44" r="1.3" fill={art.stroke} stroke="none" />
		<circle cx="38" cy="33" r="1.3" fill={art.stroke} stroke="none" />
	{:else if art.kind === 'pumpkin'}
		<path d="M32 22 C31 17 32 13 36 10" fill="none" stroke={LEAF_STROKE} stroke-width="4" />
		<path d="M36 18 C42 12 50 14 52 20 C46 22 40 22 36 18 Z" fill={LEAF} stroke={LEAF_STROKE} />
		<ellipse cx="32" cy="39" rx="24" ry="17" fill={art.fill} stroke={art.stroke} />
		<path d="M32 22 C25 30 25 48 32 56 M32 22 C39 30 39 48 32 56 M20 25 C13 32 13 47 20 54 M44 25 C51 32 51 47 44 54" fill="none" stroke={art.stroke} />
	{:else if art.kind === 'cabbage'}
		<path d="M14 40 C8 30 12 18 22 16 C20 26 20 34 24 44 Z" fill={LEAF} stroke={LEAF_STROKE} />
		<path d="M50 40 C56 30 52 18 42 16 C44 26 44 34 40 44 Z" fill={LEAF} stroke={LEAF_STROKE} />
		<circle cx="32" cy="37" r="19" fill={art.fill} stroke={art.stroke} />
		<path d="M19 33 C25 26 39 26 45 33 M18 42 C26 36 38 36 46 42 M32 20 C28 28 28 46 32 55" fill="none" stroke={art.stroke} />
	{:else if art.kind === 'berry'}
		<path d="M32 18 C30 12 26 9 21 8 M32 18 C36 12 41 10 47 11" fill="none" stroke={LEAF_STROKE} />
		<path d="M32 18 C38 12 46 12 49 16 C44 20 37 20 32 18 Z" fill={LEAF} stroke={LEAF_STROKE} />
		<circle cx="26" cy="28" r="7" fill={art.fill} stroke={art.stroke} />
		<circle cx="39" cy="28" r="7" fill={art.fill} stroke={art.stroke} />
		<circle cx="20" cy="40" r="7" fill={art.fill} stroke={art.stroke} />
		<circle cx="33" cy="40" r="7" fill={art.fill} stroke={art.stroke} />
		<circle cx="45" cy="40" r="7" fill={art.fill} stroke={art.stroke} />
		<circle cx="27" cy="52" r="7" fill={art.fill} stroke={art.stroke} />
		<circle cx="40" cy="52" r="7" fill={art.fill} stroke={art.stroke} />
	{:else if art.kind === 'strawberry'}
		<path d="M32 56 C20 49 13 37 17 27 C20 20 27 20 32 23 C37 20 44 20 47 27 C51 37 44 49 32 56 Z" fill={art.fill} stroke={art.stroke} />
		<path d="M22 22 L28 18 L32 12 L36 18 L42 22 L36 24 L32 22 L28 24 Z" fill={LEAF} stroke={LEAF_STROKE} />
		<path d="M32 12 C32 9 33 7 35 6" fill="none" stroke={LEAF_STROKE} />
		<circle cx="25" cy="32" r="1.4" fill="#FFF6D6" stroke="none" />
		<circle cx="33" cy="30" r="1.4" fill="#FFF6D6" stroke="none" />
		<circle cx="40" cy="33" r="1.4" fill="#FFF6D6" stroke="none" />
		<circle cx="28" cy="40" r="1.4" fill="#FFF6D6" stroke="none" />
		<circle cx="37" cy="41" r="1.4" fill="#FFF6D6" stroke="none" />
		<circle cx="32" cy="48" r="1.4" fill="#FFF6D6" stroke="none" />
	{:else if art.kind === 'fruit'}
		<path d="M32 22 C32 16 33 12 36 9" fill="none" stroke={LEAF_STROKE} />
		<path d="M35 15 C40 9 49 10 51 15 C46 19 40 19 35 15 Z" fill={LEAF} stroke={LEAF_STROKE} />
		<path d="M32 23 C26 18 13 19 13 34 C13 47 22 56 32 55 C42 56 51 47 51 34 C51 19 38 18 32 23 Z" fill={art.fill} stroke={art.stroke} />
		<path d="M21 31 C21 28 23 26 26 25" fill="none" stroke="#FFFFFF" stroke-opacity="0.55" />
	{:else if art.kind === 'flower'}
		<path d="M32 40 V60 M32 52 C26 50 22 46 21 41 C27 42 31 46 32 52 Z" fill={LEAF} stroke={LEAF_STROKE} />
		{#each [0, 45, 90, 135, 180, 225, 270, 315] as angle (angle)}
			<ellipse cx="32" cy="16" rx="6" ry="10" transform="rotate({angle} 32 26)" fill={art.fill} stroke={art.stroke} />
		{/each}
		<circle cx="32" cy="26" r="7" fill="#F2C94C" stroke={art.stroke} />
	{:else if art.kind === 'sprig'}
		<path d="M30 58 C30 44 32 28 36 8" fill="none" stroke={art.stroke} />
		{#each [[22, 48, -35], [38, 44, 35], [24, 36, -35], [40, 32, 35], [27, 24, -30], [42, 20, 30], [32, 12, 0]] as [x, y, r] (`${x}-${y}`)}
			<ellipse cx={x} cy={y} rx="4" ry="8" transform="rotate({r} {x} {y})" fill={art.fill} stroke={art.stroke} />
		{/each}
	{:else if art.kind === 'corn'}
		<path d="M32 58 C22 52 16 40 18 26 C24 34 28 44 32 58 Z" fill={LEAF} stroke={LEAF_STROKE} />
		<path d="M32 58 C42 52 48 40 46 26 C40 34 36 44 32 58 Z" fill={LEAF} stroke={LEAF_STROKE} />
		<path d="M32 8 C40 8 42 22 41 34 C40 46 36 54 32 54 C28 54 24 46 23 34 C22 22 24 8 32 8 Z" fill={art.fill} stroke={art.stroke} />
		<path d="M27 18 H37 M25 26 H39 M25 34 H39 M26 42 H38 M32 10 V52" fill="none" stroke={art.stroke} stroke-width="1.5" />
	{:else if art.kind === 'tuber'}
		<path d="M15 35 C13 24 23 17 34 18 C46 19 53 27 51 38 C49 48 39 53 28 51 C20 50 16 43 15 35 Z" fill={art.fill} stroke={art.stroke} />
		<path d="M25 29 l2 1 M39 27 l2 1 M44 39 l2 1 M30 42 l2 1 M22 38 l2 1" fill="none" stroke={art.stroke} />
		<path d="M34 18 C34 13 36 10 40 8" fill="none" stroke={LEAF_STROKE} />
		<path d="M38 11 C42 7 48 8 49 12 C45 14 41 14 38 11 Z" fill={LEAF} stroke={LEAF_STROKE} />
	{:else if art.kind === 'stalk'}
		<path d="M30 30 C24 22 20 14 16 6 M32 30 C32 20 33 12 34 4 M34 30 C40 22 44 15 49 8" fill="none" stroke={LEAF_STROKE} stroke-width="4" />
		<path d="M26 28 C26 26 38 26 38 28 L37 56 C37 59 27 59 27 56 Z" fill={art.fill} stroke={art.stroke} />
		<path d="M30 32 V54 M34 32 V54" fill="none" stroke={art.stroke} stroke-width="1.5" />
		<path d="M27 57 l-2 4 M32 58 v4 M37 57 l2 4" fill="none" stroke={art.stroke} />
	{/if}
</svg>
