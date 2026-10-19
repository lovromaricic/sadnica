import { cameraPitch, compassHeading } from './arc';

export type Unavailable = 'desktop' | 'insecure' | 'denied' | 'noCamera' | 'noSensor';

/** Why the camera check cannot run here, or null when it can be tried. */
export function cameraUnavailable(): Unavailable | null {
	if (typeof window === 'undefined') return 'desktop';
	if (!window.matchMedia('(pointer: coarse)').matches) return 'desktop';
	if (!window.isSecureContext) return 'insecure';
	if (!navigator.mediaDevices?.getUserMedia) return 'noCamera';
	if (!('DeviceOrientationEvent' in window)) return 'noSensor';
	return null;
}

type IOSOrientationEvent = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> };

/** iOS asks for motion access, and only from a tap. Elsewhere this resolves to true. */
export async function requestOrientationPermission(): Promise<boolean> {
	const Event = window.DeviceOrientationEvent as IOSOrientationEvent;
	if (typeof Event?.requestPermission !== 'function') return true;
	try {
		return (await Event.requestPermission()) === 'granted';
	} catch {
		return false;
	}
}

/** Rear camera. Rejects with a DOMException (NotAllowedError when refused). */
export function startCamera(): Promise<MediaStream> {
	return navigator.mediaDevices.getUserMedia({
		audio: false,
		video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 1280 } }
	});
}

export function stopStream(stream: MediaStream | null | undefined) {
	stream?.getTracks().forEach((track) => track.stop());
}

export interface Orientation {
	/** Compass heading of the camera in degrees, or null without a compass. */
	heading: number | null;
	/** Camera elevation in degrees (0 = horizon). */
	pitch: number;
}

type CompassEvent = DeviceOrientationEvent & { webkitCompassHeading?: number };

/**
 * Calls `onChange` with the camera's heading and pitch. iOS gives a compass heading directly;
 * Android Chrome sends `deviceorientationabsolute`. Returns a function that stops listening.
 */
export function watchOrientation(onChange: (o: Orientation) => void): () => void {
	const absoluteEvent = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : null;
	const handler = (e: Event) => {
		const ev = e as CompassEvent;
		if (ev.beta === null || ev.gamma === null) return;
		const pitch = cameraPitch(ev.beta, ev.gamma);
		let heading: number | null = null;
		if (typeof ev.webkitCompassHeading === 'number' && ev.webkitCompassHeading >= 0) heading = ev.webkitCompassHeading;
		else if ((absoluteEvent || ev.absolute) && ev.alpha !== null) heading = compassHeading(ev.alpha, ev.beta, ev.gamma);
		onChange({ heading, pitch });
	};
	const name = absoluteEvent ?? 'deviceorientation';
	window.addEventListener(name, handler);
	return () => window.removeEventListener(name, handler);
}

/** Resolves with the first reading that has a compass heading, or null after `timeout` ms. */
export function waitForCompass(timeout = 2000): Promise<boolean> {
	return new Promise((resolve) => {
		const stop = watchOrientation((o) => {
			if (o.heading === null) return;
			clearTimeout(timer);
			stop();
			resolve(true);
		});
		const timer = setTimeout(() => {
			stop();
			resolve(false);
		}, timeout);
	});
}

/** Device location, or null when refused, unavailable or slow. Never stored. */
export function getLocation(timeout = 6000): Promise<{ lat: number; lng: number } | null> {
	return new Promise((resolve) => {
		if (!navigator.geolocation) return resolve(null);
		navigator.geolocation.getCurrentPosition(
			(pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
			() => resolve(null),
			{ enableHighAccuracy: false, timeout, maximumAge: 60 * 60 * 1000 }
		);
	});
}
