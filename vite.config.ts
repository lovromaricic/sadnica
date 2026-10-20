import adapter from '@sveltejs/adapter-static';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
	plugins: [
		// `npm run dev:phone`: self-signed https, because phones only allow camera and compass over https.
		mode === 'phone' && basicSsl(),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// Fully static output: every route is prerendered as an app shell (see docs/decisions.md).
			// 404.html is the app shell for addresses that do not exist; it shows the app's error page.
			adapter: adapter({ strict: true, fallback: '404.html' }),
			// Served from a subfolder (e.g. /sadnica) when built with BASE_PATH; the root otherwise.
			paths: { base: (process.env.BASE_PATH ?? '').replace(/\/$/, '') as '' | `/${string}` }
		})
	],
	server: {
		// The production build in build/ is not part of the dev app; don't reload when it changes.
		watch: { ignored: ['**/build/**'] }
	},
	test: {
		include: ['src/**/*.test.ts'],
		// Tests use local dates and hours as a Croatian phone sees them; CI machines run in UTC.
		env: { TZ: 'Europe/Zagreb' },
		// The persistent module cache does not notice new data/plants/*.json files picked up by
		// import.meta.glob, so tests would silently run against the old plant list.
		fsModuleCache: false
	}
}));
