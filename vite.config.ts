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
			adapter: adapter({ strict: true })
		})
	],
	server: {
		// The production build in build/ is not part of the dev app; don't reload when it changes.
		watch: { ignored: ['**/build/**'] }
	},
	test: {
		include: ['src/**/*.test.ts']
	}
}));
