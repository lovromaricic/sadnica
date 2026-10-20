/** One-off position for picking the nearest city. Nothing is stored or sent anywhere. */
export type LocateResult = { lat: number; lng: number } | 'denied' | 'unavailable';

export function canLocate(): boolean {
	return typeof navigator !== 'undefined' && 'geolocation' in navigator && window.isSecureContext;
}

export function locate(timeout = 10000): Promise<LocateResult> {
	return new Promise((resolve) => {
		if (!canLocate()) return resolve('unavailable');
		navigator.geolocation.getCurrentPosition(
			(pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
			(err) => resolve(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable'),
			// City level is enough, so a quick, low-power fix; a recent one is fine.
			{ enableHighAccuracy: false, timeout, maximumAge: 10 * 60 * 1000 }
		);
	});
}
