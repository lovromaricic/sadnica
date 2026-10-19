/**
 * Moving a garden between devices without a server: the garden is packed into a link
 * (`/uvoz#g=…`, the part after # never reaches any server) or a small JSON file.
 */
import { STAGES, sanitize, type AppState, type GardenItem, type Place } from './storage';
import type { Region } from './data/schema';

export interface GardenPayload {
	city: string;
	region: Region;
	regionManual: boolean;
	place: Place;
	garden: GardenItem[];
}

export type ImportMode = 'merge' | 'replace';

const APP_TAG = 'sadnica';

export function payloadFromState(state: AppState): GardenPayload {
	const { city, region, regionManual, place, garden } = state;
	return structuredClone({ city, region, regionManual, place, garden });
}

/**
 * Validate anything that claims to be a garden. Reuses the storage sanitiser, then drops plants
 * this version of the app does not know. Null when it is not a garden at all.
 */
export function validatePayload(raw: unknown, knownPlantIds: ReadonlySet<string>): GardenPayload | null {
	if (!raw || typeof raw !== 'object' || !Array.isArray((raw as { garden?: unknown }).garden)) return null;
	const clean = sanitize({ ...(raw as object), version: 1, onboarded: true, tasksDone: {} });
	return payloadFromState({ ...clean, garden: clean.garden.filter((g) => knownPlantIds.has(g.plantId)) });
}

/** Same plant on both sides: the one further along wins. New plants are added at the end. */
export function mergeGardens(current: GardenItem[], incoming: GardenItem[]): GardenItem[] {
	const byId = new Map(current.map((g) => [g.plantId, g]));
	for (const item of incoming) {
		const existing = byId.get(item.plantId);
		if (!existing || STAGES.indexOf(item.stage) > STAGES.indexOf(existing.stage)) byId.set(item.plantId, item);
	}
	return [...byId.values()];
}

/**
 * The state after an import. Replace takes the incoming garden and answers. Merge keeps this
 * device's answers, unless it was never set up (a fresh phone), then it takes the incoming ones.
 */
export function applyImport(state: AppState, payload: GardenPayload, mode: ImportMode): AppState {
	const answers = { city: payload.city, region: payload.region, regionManual: payload.regionManual, place: payload.place };
	if (mode === 'replace') {
		return { ...state, ...answers, onboarded: true, garden: structuredClone(payload.garden), tasksDone: {} };
	}
	return {
		...state,
		...(state.onboarded ? {} : answers),
		onboarded: true,
		garden: mergeGardens(structuredClone(state.garden), structuredClone(payload.garden))
	};
}

// --- Link encoding -------------------------------------------------------------------------

const toBase64Url = (bytes: Uint8Array) =>
	btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

function fromBase64Url(text: string): Uint8Array {
	const b64 = text.replace(/-/g, '+').replace(/_/g, '/');
	const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
	return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
	const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream as unknown as ReadableWritablePair<Uint8Array, Uint8Array>);
	return new Uint8Array(await new Response(out).arrayBuffer());
}

/** Compact text for a link or QR code: "z…" compressed, "j…" plain where compression is missing. */
export async function encodePayload(payload: GardenPayload): Promise<string> {
	const bytes = new TextEncoder().encode(JSON.stringify(payload));
	if (typeof CompressionStream === 'function') {
		return `z${toBase64Url(await pipe(bytes, new CompressionStream('deflate-raw')))}`;
	}
	return `j${toBase64Url(bytes)}`;
}

export async function decodePayload(text: string, knownPlantIds: ReadonlySet<string>): Promise<GardenPayload | null> {
	try {
		const body = fromBase64Url(text.slice(1));
		let bytes: Uint8Array;
		if (text.startsWith('z') && typeof DecompressionStream === 'function') {
			bytes = await pipe(body, new DecompressionStream('deflate-raw'));
		} else if (text.startsWith('j')) {
			bytes = body;
		} else {
			return null;
		}
		return validatePayload(JSON.parse(new TextDecoder().decode(bytes)), knownPlantIds);
	} catch {
		return null;
	}
}

/** Full link that opens the import screen on another device. */
export async function transferLink(origin: string, importPath: string, payload: GardenPayload): Promise<string> {
	return `${origin}${importPath}#g=${await encodePayload(payload)}`;
}

/** The encoded garden from a location hash like "#g=z…". */
export function payloadFromHash(hash: string): string | null {
	const match = hash.match(/^#g=([zj][A-Za-z0-9_-]+)$/);
	return match ? match[1] : null;
}

// --- Backup file ---------------------------------------------------------------------------

export function backupFileContent(payload: GardenPayload, now: Date): string {
	return JSON.stringify({ app: APP_TAG, version: 1, exportedAt: now.toISOString(), ...payload }, null, 2);
}

export function parseBackupFile(text: string, knownPlantIds: ReadonlySet<string>): GardenPayload | null {
	try {
		const raw = JSON.parse(text);
		if (raw?.app !== APP_TAG) return null;
		return validatePayload(raw, knownPlantIds);
	} catch {
		return null;
	}
}
