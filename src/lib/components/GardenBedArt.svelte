<script lang="ts">
	/** An empty raised bed waiting for plants: shovel in the soil, watering can, seed packet. Decorative. */
	const D = '#3D2A18';
</script>

<svg class="garden-bed" viewBox="0 0 360 210" aria-hidden="true" focusable="false">
	<ellipse cx="185" cy="194" rx="150" ry="11" fill="#14201A" opacity=".07" />
	<!-- soil and furrows -->
	<polygon points="92,102 278,102 298,128 72,128" fill="#7A5A3A" stroke={D} stroke-width="3.5" stroke-linejoin="round" />
	<path d="M100 109 Q185 105 270 109M88 116 Q185 112 282 116M80 123 Q185 119 290 123" fill="none" stroke="#5A3F26" stroke-width="3" stroke-linecap="round" />
	<!-- wooden frame -->
	<rect x="66" y="120" width="18" height="68" rx="5" fill="#B07444" stroke={D} stroke-width="3.5" />
	<rect x="286" y="120" width="18" height="68" rx="5" fill="#B07444" stroke={D} stroke-width="3.5" />
	<rect x="78" y="126" width="214" height="58" rx="6" fill="#C98B55" stroke={D} stroke-width="3.5" />
	<path d="M82 155H288" stroke={D} stroke-width="2.5" />
	<path d="M104 140h28M180 169h34M238 140h24M120 170h18" stroke="#A86E3E" stroke-width="2.5" stroke-linecap="round" />
	<!-- shovel -->
	<path d="M262 30 L254 96" stroke="#8A5A2E" stroke-width="7" stroke-linecap="round" />
	<path d="M252 28h20" stroke="#8A5A2E" stroke-width="7" stroke-linecap="round" />
	<path d="M243 92 Q254 84 265 93 L262 112 Q253 118 245 112 Z" fill="#C9D3D6" stroke={D} stroke-width="3" stroke-linejoin="round" />
	<!-- watering can -->
	<path d="M54 160 L80 134" stroke="#24506E" stroke-width="6" stroke-linecap="round" />
	<rect x="74" y="126" width="14" height="10" rx="3" transform="rotate(-45 81 131)" fill="#8CC0E3" stroke="#24506E" stroke-width="3" />
	<path d="M22 142 Q36 116 52 142" fill="none" stroke="#24506E" stroke-width="5" stroke-linecap="round" />
	<rect x="12" y="140" width="46" height="46" rx="9" fill="#8CC0E3" stroke="#24506E" stroke-width="3.5" />
	<path d="M20 156h30" stroke="#24506E" stroke-width="2.5" stroke-linecap="round" opacity=".5" />
	<!-- seed packet -->
	<g transform="rotate(-8 330 160)">
		<rect x="310" y="134" width="40" height="52" rx="4" fill="#F2C94C" stroke="#8A6A12" stroke-width="3" />
		<path d="M310 144h40" stroke="#8A6A12" stroke-width="2.5" />
		<path
			d="M330 176v-14M330 166c0-5-4-8-9-8 0 5 4 8 9 8zM330 168c0-5 4-9 9-9 0 5-4 9-9 9z"
			fill="#7CC46A"
			stroke="#2F5E2A"
			stroke-width="2.2"
			stroke-linejoin="round"
			stroke-linecap="round"
		/>
	</g>
</svg>

<style>
	.garden-bed {
		display: block;
		width: 100%;
		height: auto;
	}
</style>
