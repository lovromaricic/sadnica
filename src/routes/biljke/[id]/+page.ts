import { plants } from '#lib/data/index.ts';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => plants.map((p) => ({ id: p.id }));

export const load: PageLoad = ({ params }) => ({ id: params.id });
