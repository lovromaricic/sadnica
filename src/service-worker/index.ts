/// <reference lib="webworker" />
import { self } from '$app/service-worker';
import { version } from '$app/env';
import { assets, immutable, prerendered } from '$app/manifest';

const APP_CACHE = `app-${version}`;
const FONT_CACHE = 'fonts-v1';
const ROOT = new URL('./', self.location.href).pathname;
const PRECACHE = [ROOT, ...[...immutable, ...assets, ...prerendered].map((f) => f.path)].filter(
	// Launch screens are read by iOS when the app is added to the home screen, not from this cache.
	(path, i, all) => !path.endsWith('service-worker.js') && !path.includes('/splash/') && all.indexOf(path) === i
);

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(APP_CACHE)
			.then((cache) => cache.addAll(PRECACHE))
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((k) => k !== APP_CACHE && k !== FONT_CACHE).map((k) => caches.delete(k))))
			.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') return;
	const url = new URL(request.url);

	// Google Fonts: cache first, so typography survives offline after the first visit.
	if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
		event.respondWith(
			caches.open(FONT_CACHE).then(async (cache) => {
				const hit = await cache.match(request);
				if (hit) return hit;
				const res = await fetch(request);
				if (res.ok || res.type === 'opaque') cache.put(request, res.clone());
				return res;
			})
		);
		return;
	}

	if (url.origin !== self.location.origin) return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(APP_CACHE);
			const navigate = request.mode === 'navigate';
			// ignoreVary: script requests carry headers (Origin) that the precache requests did not.
			const cached = await cache.match(request, { ignoreSearch: navigate, ignoreVary: true });
			// Built files never change for a given version: serve them from the cache.
			if (cached && !navigate) return cached;
			// Pages: network first so content stays fresh, cache when offline.
			try {
				const res = await fetch(request);
				if (res.ok && navigate) cache.put(request, res.clone());
				return res;
			} catch (err) {
				if (cached) return cached;
				// Unknown page while offline: fall back to the home shell. Never answer a script with HTML.
				const shell = navigate ? await cache.match(ROOT, { ignoreVary: true }) : undefined;
				if (shell) return shell;
				throw err;
			}
		})()
	);
});
