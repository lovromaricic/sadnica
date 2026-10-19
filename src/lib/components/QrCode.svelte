<script lang="ts">
	let { url, size = 112, label }: { url: string; size?: number; label: string } = $props();

	let path = $state('');
	let modules = $state(21);

	// The encoder is only loaded where a code is shown (desktop), so phones never download it.
	$effect(() => {
		const data = url;
		let cancelled = false;
		import('qrcode-generator').then(({ default: qrcode }) => {
			if (cancelled) return;
			const qr = qrcode(0, 'M');
			qr.addData(data);
			qr.make();
			const n = qr.getModuleCount();
			let d = '';
			for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
			modules = n;
			path = d;
		});
		return () => (cancelled = true);
	});
</script>

<svg
	class="qr"
	role="img"
	aria-label={label}
	width={size}
	height={size}
	viewBox="-2 -2 {modules + 4} {modules + 4}"
	shape-rendering="crispEdges"
>
	<rect x="-2" y="-2" width={modules + 4} height={modules + 4} fill="#FFFFFF" />
	<path d={path} fill="#14201A" />
</svg>

<style>
	.qr {
		border-radius: 12px;
		flex: none;
	}
</style>
