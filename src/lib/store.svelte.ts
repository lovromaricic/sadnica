import { STAGES, loadState, saveState, type AppState, type Place, type Stage } from './storage';
import type { Region } from './data/schema';
import type { Experience } from './season';

class AppStore {
	state = $state<AppState>(loadState());

	private persist() {
		saveState($state.snapshot(this.state) as AppState);
	}

	completeOnboarding(answers: { city: string; region: Region; regionManual: boolean; place: Place; experience: Experience }) {
		Object.assign(this.state, answers, { onboarded: true });
		this.persist();
	}

	inGarden(plantId: string) {
		return this.state.garden.find((g) => g.plantId === plantId);
	}

	addPlant(plantId: string) {
		if (this.inGarden(plantId)) return;
		this.state.garden.push({ plantId, addedAt: new Date().toISOString(), stage: 'toPlant', stepsDone: [] });
		this.persist();
	}

	removePlant(plantId: string) {
		this.state.garden = this.state.garden.filter((g) => g.plantId !== plantId);
		this.persist();
	}

	advanceStage(plantId: string) {
		const item = this.inGarden(plantId);
		if (!item) return;
		const i = STAGES.indexOf(item.stage);
		item.stage = STAGES[Math.min(i + 1, STAGES.length - 1)];
		this.persist();
	}

	setStage(plantId: string, stage: Stage) {
		const item = this.inGarden(plantId);
		if (!item) return;
		item.stage = stage;
		this.persist();
	}

	toggleStep(plantId: string, index: number) {
		const item = this.inGarden(plantId);
		if (!item) return;
		item.stepsDone = item.stepsDone.includes(index)
			? item.stepsDone.filter((n) => n !== index)
			: [...item.stepsDone, index];
		this.persist();
	}

	/** Tick or untick a weekly task. Ticking a planting task also marks the plant as sown. */
	toggleTask(week: string, taskId: string) {
		const key = `${week}:${taskId}`;
		const done = !this.state.tasksDone[key];
		if (done) this.state.tasksDone[key] = true;
		else delete this.state.tasksDone[key];
		const [kind, plantId] = taskId.split(':');
		const item = kind === 'plant' ? this.inGarden(plantId) : undefined;
		if (item && done && item.stage === 'toPlant') item.stage = 'sown';
		if (item && !done && item.stage === 'sown') item.stage = 'toPlant';
		this.persist();
	}
}

export const store = new AppStore();
