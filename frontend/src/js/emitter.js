class EventEmitter {
	constructor() {
		this.events = {};
	}

	on(event, listener) {
		if (this.events[event]) {
			this.events[event].push(listener);
		} else {
			this.events[event] = [listener];
		}
	}

	off(event, listener) {
		this.events[event] = this.events[event].filter((l) => l !== listener);
	}

	emit(event, data) {
		for (const listener of this.events[event]) {
			listener(data);
		}
	}
}

export const events = new EventEmitter();
