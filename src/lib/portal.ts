import type { Attachment } from 'svelte/attachments';

/**
 * Moves an overlay (modal, full-screen camera) to the end of <body>, so nothing in the page,
 * like the scrolling content area or the fixed bottom nav, can end up on top of it.
 */
export const portal: Attachment<HTMLElement> = (node) => {
	document.body.appendChild(node);
	return () => node.remove();
};
