/**
 * Renders the app icons (lime sprout on the dark ink colour) as PNG and SVG
 * without any dependencies. Run with `npm run icons`.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { join } from 'node:path';

const OUT = join(import.meta.dirname, '..', 'static', 'icons');
const INK = [0x14, 0x20, 0x1a];
const LIME = [0xd9, 0xf2, 0xa6];
const SPROUT = 'M12 21v-9M12 12c0-4-3-6-7-6 0 4 3 6 7 6zM12 14c0-4 3-7 7-7 0 4-3 7-7 7z';

// The same sprout as the in-app icon, as polylines in a 24x24 box.
function cubic(p0, p1, p2, p3, n = 24) {
	const pts = [];
	for (let i = 0; i <= n; i++) {
		const t = i / n, u = 1 - t;
		pts.push([
			u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
			u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]
		]);
	}
	return pts;
}
const lines = [
	[[12, 21], [12, 12]],
	[...cubic([12, 12], [12, 8], [9, 6], [5, 6]), ...cubic([5, 6], [5, 10], [8, 12], [12, 12])],
	[...cubic([12, 14], [12, 10], [15, 7], [19, 7]), ...cubic([19, 7], [19, 11], [16, 14], [12, 14])]
];
const segments = lines.flatMap((pts) => pts.slice(1).map((p, i) => [pts[i], p]));

function distToSegment(px, py, [[ax, ay], [bx, by]]) {
	const dx = bx - ax, dy = by - ay;
	const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
	return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}

/** shape: 'circle' | 'square'; scale: share of the canvas the 24px box takes. */
function render(size, shape, scale) {
	const px = Buffer.alloc(size * size * 4);
	const box = size * scale;
	const offset = (size - box) / 2;
	const half = 2.2 / 2; // stroke width in icon units
	const SS = 4;
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			let bg = 0, fg = 0;
			for (let sy = 0; sy < SS; sy++) {
				for (let sx = 0; sx < SS; sx++) {
					const fx = x + (sx + 0.5) / SS, fy = y + (sy + 0.5) / SS;
					const inside = shape === 'square' || Math.hypot(fx - size / 2, fy - size / 2) <= size / 2;
					if (!inside) continue;
					bg++;
					const ux = ((fx - offset) / box) * 24, uy = ((fy - offset) / box) * 24;
					if (segments.some((s) => distToSegment(ux, uy, s) <= half)) fg++;
				}
			}
			const a = bg / (SS * SS), f = bg ? fg / bg : 0;
			const i = (y * size + x) * 4;
			for (let c = 0; c < 3; c++) px[i + c] = Math.round(INK[c] * (1 - f) + LIME[c] * f);
			px[i + 3] = Math.round(a * 255);
		}
	}
	return png(size, px);
}

const CRC = new Int32Array(256).map((_, n) => {
	let c = n;
	for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
	return c;
});
const crc32 = (buf) => {
	let c = -1;
	for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
	return (c ^ -1) >>> 0;
};
function chunk(type, data) {
	const len = Buffer.alloc(4);
	len.writeUInt32BE(data.length);
	const body = Buffer.concat([Buffer.from(type), data]);
	const crc = Buffer.alloc(4);
	crc.writeUInt32BE(crc32(body));
	return Buffer.concat([len, body, crc]);
}
function png(size, rgba) {
	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(size, 0);
	ihdr.writeUInt32BE(size, 4);
	ihdr[8] = 8; // bit depth
	ihdr[9] = 6; // RGBA
	const raw = Buffer.alloc(size * (size * 4 + 1));
	for (let y = 0; y < size; y++) rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
	return Buffer.concat([
		Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
		chunk('IHDR', ihdr),
		chunk('IDAT', deflateSync(raw, { level: 9 })),
		chunk('IEND', Buffer.alloc(0))
	]);
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'icon-192.png'), render(192, 'circle', 0.6));
writeFileSync(join(OUT, 'icon-512.png'), render(512, 'circle', 0.6));
writeFileSync(join(OUT, 'maskable-512.png'), render(512, 'square', 0.5));
writeFileSync(join(OUT, 'apple-touch-icon.png'), render(180, 'square', 0.6));
writeFileSync(
	join(OUT, 'icon.svg'),
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#14201A"/><g transform="translate(4.8 4.8) scale(0.6)"><path d="${SPROUT}" fill="none" stroke="#D9F2A6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g></svg>\n`
);
console.log('Icons written to static/icons');
