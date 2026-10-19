import { describe, expect, it } from 'vitest';
import { plantsById } from './data';
import { petLabel, petRisk, petSafe } from './pets';

const P = (id: string) => plantsById.get(id)!;

describe('pets', () => {
	it('labels serious and mild risks', () => {
		expect(petLabel(petRisk(P('narcis'))!)).toBe('Otrovno za pse i mačke');
		expect(petLabel(petRisk(P('cesnjak'))!)).toBe('Otrovno za pse i mačke');
		expect(petLabel(petRisk(P('tulipan'))!)).toBe('Može naškoditi psima i mačkama');
		expect(petLabel({ dogs: true, cats: false, severity: 'serious', part: 'x', signs: 'y' })).toBe('Otrovno za pse');
	});

	it('tells safe, risky and unchecked plants apart', () => {
		expect(petSafe(P('bosiljak'))).toBe(true);
		expect(petRisk(P('bosiljak'))).toBeNull();
		expect(petSafe(P('cesnjak'))).toBe(false);
		expect(petRisk(P('bob'))).toBeNull();
		expect(petSafe(P('bob'))).toBe(false);
	});
});
