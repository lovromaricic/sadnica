<script lang="ts">
	import { t } from '../i18n/hr';
	import type { ChipKind } from '../timing';

	let { kind }: { kind: ChipKind } = $props();
</script>

<span class="chip {kind}">{t.status[kind]}</span>

<style>
	.chip {
		display: inline-flex;
		align-items: center;
		padding: 5px 11px;
		border-radius: 999px;
		font-size: 0.8125rem;
		font-weight: 700;
		white-space: nowrap;
	}
	.now {
		background: var(--ink);
		color: var(--white);
	}
	.late {
		background: var(--white);
		color: var(--ink);
	}
	.off {
		background: rgb(20 32 26 / 0.08);
		color: var(--muted-2);
	}
</style>
