import type { Plant } from './data/schema';
import { t } from './i18n/hr';

export type PetRisk = Extract<NonNullable<Plant['pets']>, { severity: unknown }>;

/** The risk for dogs or cats, or null when there is none on record. */
export function petRisk(plant: Plant): PetRisk | null {
	const pets = plant.pets;
	return pets && 'severity' in pets && (pets.dogs || pets.cats) ? pets : null;
}

/** Only plants the source names as non-toxic count as safe; unchecked ones do not. */
export function petSafe(plant: Plant): boolean {
	return !!plant.pets && 'safe' in plant.pets;
}

/** "Otrovno za pse i mačke", "Može naškoditi psima" and so on. */
export function petLabel(risk: PetRisk): string {
	const who = risk.dogs && risk.cats ? 'both' : risk.dogs ? 'dogs' : 'cats';
	return t.pets.label[risk.severity][who];
}
