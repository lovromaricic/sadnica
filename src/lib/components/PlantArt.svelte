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
	{/if}
</svg>
