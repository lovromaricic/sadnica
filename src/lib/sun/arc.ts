import SunCalc from 'suncalc';

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

export interface SunDirection {
	/** Compass bearing in degrees, 0 = north, 90 = east. */
	bearing: number;
	/** Degrees above the horizon (negative = below). */
	altitude: number;
}

export function sunDirection(date: Date, lat: number, lng: number): SunDirection {
	const { azimuth, altitude } = SunCalc.getPosition(date, lat, lng);
	// suncalc measures azimuth from south, positive towards west.
	return { bearing: (((azimuth * DEG + 180) % 360) + 360) % 360, altitude: altitude * DEG };
}

/** Sun position at each whole hour of the given day (local time). */
export function hourDirections(date: Date, lat: number, lng: number, hours: readonly number[]) {
	return hours.map((hour) => {
		const at = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, 0, 0);
		return { hour, ...sunDirection(at, lat, lng) };
	});
}

/** The day's sun path, sampled every `stepMinutes`, above the horizon only. */
export function arcDirections(date: Date, lat: number, lng: number, stepMinutes = 15): SunDirection[] {
	const out: SunDirection[] = [];
	for (let m = 0; m < 24 * 60; m += stepMinutes) {
		const at = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, m, 0);
		const dir = sunDirection(at, lat, lng);
		if (dir.altitude > -1) out.push(dir);
	}
	return out;
}

/** Signed smallest difference a - b in degrees, in (-180, 180]. */
export function angleDiff(a: number, b: number): number {
	const d = (((a - b) % 360) + 540) % 360 - 180;
	return d === -180 ? 180 : d;
}

/** Low-pass filter for an angle, so the overlay does not jitter. Handles the 359 → 0 wrap. */
export function smoothAngle(prev: number | null, next: number, factor = 0.2): number {
	if (prev === null) return next;
	return (prev + angleDiff(next, prev) * factor + 360) % 360;
}

/**
 * Elevation of the rear camera's axis in degrees from W3C device orientation angles
 * (0 = phone upright looking at the horizon, positive = tilted up at the sky).
 */
export function cameraPitch(beta: number, gamma: number): number {
	return Math.asin(Math.max(-1, Math.min(1, -Math.cos(beta * RAD) * Math.cos(gamma * RAD)))) * DEG;
}

/**
 * Compass heading the rear camera looks towards, from absolute device orientation angles
 * (W3C Device Orientation spec, worked example).
 */
export function compassHeading(alpha: number, beta: number, gamma: number): number {
	const [x, y, z] = [beta * RAD, gamma * RAD, alpha * RAD];
	const vx = -Math.cos(z) * Math.sin(y) - Math.sin(z) * Math.sin(x) * Math.cos(y);
	const vy = -Math.sin(z) * Math.sin(y) + Math.cos(z) * Math.sin(x) * Math.cos(y);
	let heading = Math.atan(vx / vy);
	if (vy < 0) heading += Math.PI;
	else if (vx < 0) heading += 2 * Math.PI;
	return heading * DEG;
}

export interface Projected {
	x: number;
	y: number;
	/** In front of the camera and inside the frame. */
	visible: boolean;
	/** In front of the camera at all (may still be outside the frame). */
	ahead: boolean;
}

/**
 * Pinhole projection of a sun direction onto a portrait camera frame of `width` x `height` px,
 * for a camera pointing at `heading` / `pitch` (degrees). `vFov` is the vertical field of view.
 */
export function project(
	dir: SunDirection,
	heading: number,
	pitch: number,
	width: number,
	height: number,
	vFov = 64
): Projected {
	const [az, alt, h, p] = [dir.bearing * RAD, dir.altitude * RAD, heading * RAD, pitch * RAD];
	// World vectors (east, north, up).
	const v = [Math.cos(alt) * Math.sin(az), Math.cos(alt) * Math.cos(az), Math.sin(alt)];
	const forward = [Math.cos(p) * Math.sin(h), Math.cos(p) * Math.cos(h), Math.sin(p)];
	const right = [Math.cos(h), -Math.sin(h), 0];
	const up = [-Math.sin(p) * Math.sin(h), -Math.sin(p) * Math.cos(h), Math.cos(p)];
	const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	const z = dot(v, forward);
	const f = height / 2 / Math.tan((vFov / 2) * RAD);
	if (z <= 0.05) return { x: NaN, y: NaN, visible: false, ahead: false };
	const x = width / 2 + (f * dot(v, right)) / z;
	const y = height / 2 - (f * dot(v, up)) / z;
	return { x, y, ahead: true, visible: x >= 0 && x <= width && y >= 0 && y <= height };
}
