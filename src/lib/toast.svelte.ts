interface Toast {
	id: number;
	message: string;
	link?: { href: string; label: string };
}

class ToastStore {
	current = $state<Toast | null>(null);
	private timer: ReturnType<typeof setTimeout> | undefined;
	private seq = 0;

	show(message: string, link?: Toast['link']) {
		clearTimeout(this.timer);
		this.current = { id: ++this.seq, message, link };
		this.timer = setTimeout(() => this.dismiss(), 6000);
	}

	dismiss() {
		clearTimeout(this.timer);
		this.current = null;
	}
}

export const toast = new ToastStore();
