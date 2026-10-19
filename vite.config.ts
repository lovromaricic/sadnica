import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// Fully static output: every route is prerendered as an app shell (see docs/decisions.md).
			adapter: adapter({ strict: true })
		})
	],
	test: {
		include: ['src/**/*.test.ts']
	}
});
