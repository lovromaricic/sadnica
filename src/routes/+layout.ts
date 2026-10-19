// Fully static site. Content depends on the visitor's localStorage and today's
// date, so pages render in the browser; each route is prerendered as a shell.
export const prerender = true;
export const ssr = false;
export const trailingSlash = 'never';
