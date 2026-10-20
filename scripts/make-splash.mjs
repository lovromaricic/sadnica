/**
 * Renders the iOS launch screens (lime background, round sprout icon, "Sadnica") for every
 * iPhone size into static/splash/. The name uses the app's own font, so this drives a local
 * Google Chrome over the DevTools protocol. Run with `npm run splash`; the matching
 * <link rel="apple-touch-startup-image"> tags are in src/app.html.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const OUT = join(import.meta.dirname, '..', 'static', 'splash');
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/** Portrait iPhone screens in CSS pixels, with their pixel ratio. */
export const DEVICES = [
	[440, 956, 3], // 16 Pro Max
	[402, 874, 3], // 16 Pro
	[430, 932, 3], // 14 Pro Max, 15 Plus, 15 Pro Max, 16 Plus
	[393, 852, 3], // 14 Pro, 15, 15 Pro, 16
	[428, 926, 3], // 12 Pro Max, 13 Pro Max, 14 Plus
	[390, 844, 3], // 12, 13, 14, 12 Pro, 13 Pro
	[375, 812, 3], // X, XS, 11 Pro, 12 mini, 13 mini
	[414, 896, 3], // XS Max, 11 Pro Max
	[414, 896, 2], // XR, 11
	[414, 736, 3], // 6s Plus, 7 Plus, 8 Plus
	[375, 667, 2] // SE (2nd and 3rd), 6s, 7, 8
];

const page = (w, h) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&display=block" rel="stylesheet">
<style>
	html, body { margin: 0; width: ${w}px; height: ${h}px; background: #D9F2A6; }
	body { display: flex; flex-direction: column; align-items: center; justify-content: center; }
	.icon { width: 128px; height: 128px; border-radius: 50%; background: #14201A; display: grid; place-items: center; }
	.name { margin-top: 18px; font: 800 46px 'Bricolage Grotesque', sans-serif; letter-spacing: -0.02em; color: #14201A; }
</style></head><body>
	<div class="icon"><svg width="77" height="77" viewBox="0 0 24 24"><path d="M12 21v-9M12 12c0-4-3-6-7-6 0 4 3 6 7 6zM12 14c0-4 3-7 7-7 0 4-3 7-7 7z" fill="none" stroke="#D9F2A6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
	<div class="name">Sadnica</div>
</body></html>`;

const PORT = 9335;
const profile = mkdtempSync(join(tmpdir(), 'sadnica-splash-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', '--hide-scrollbars', 'about:blank'], {
	stdio: 'ignore'
});
process.on('exit', () => {
	chrome.kill();
	// Chrome may still be writing its profile while it shuts down; a leftover temp folder is harmless.
	try {
		rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
	} catch {}
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 150 && !target; i++) {
	try {
		target = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page');
	} catch {
		await sleep(200);
	}
}
if (!target) throw new Error(`Could not start Chrome at ${CHROME}. Set CHROME to its path.`);
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
	const m = JSON.parse(e.data);
	pending.get(m.id)?.(m);
	pending.delete(m.id);
});
const send = (method, params = {}) =>
	new Promise((resolve, reject) => {
		const n = ++id;
		pending.set(n, (m) => (m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result)));
		ws.send(JSON.stringify({ id: n, method, params }));
	});

mkdirSync(OUT, { recursive: true });
await send('Page.enable');
for (const [w, h, dpr] of DEVICES) {
	await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: dpr, mobile: false });
	await send('Page.navigate', { url: `data:text/html;charset=utf-8,${encodeURIComponent(page(w, h))}` });
	await sleep(400);
	await send('Runtime.evaluate', { expression: 'document.fonts.ready.then(() => true)', awaitPromise: true });
	const { data } = await send('Page.captureScreenshot', { format: 'png' });
	const file = `splash-${w * dpr}x${h * dpr}.png`;
	writeFileSync(join(OUT, file), Buffer.from(data, 'base64'));
	console.log(file);
}
process.exit(0);
