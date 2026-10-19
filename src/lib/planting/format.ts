/** "10 cm", "0,5 cm", "4 m", "1,5 m": centimetres, switching to metres from 100 cm. */
export function formatCm(cm: number): string {
	const [value, unit] = cm >= 100 ? [cm / 100, 'm'] : [cm, 'cm'];
	return `${String(Math.round(value * 10) / 10).replace('.', ',')} ${unit}`;
}
