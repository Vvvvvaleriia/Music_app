export class BiDirectionalPriorityQueue {
	#items;
	#insertCounter;

	constructor() {
		this.#items = [];
		this.#insertCounter = 0;
	}

	enqueue(track, priority = 0) {
		this.#items.push({
			track,
			priority,
			insertIndex: this.#insertCounter++,
		});
	}

	dequeue(strategy = "oldest") {
		if (this.#items.length === 0) return null;
		const idx = this.#findIndex(strategy);
		return this.#items.splice(idx, 1)[0].track;
	}

	peek(strategy = "oldest") {
		if (this.#items.length === 0) return null;
		const idx = this.#findIndex(strategy);
		return this.#items[idx].track;
	}

	get size() {
		return this.#items.length;
	}

	all() {
		return [...this.#items].map((i) => ({
			track: i.track,
			priority: i.priority,
		}));
	}

	#findIndex(strategy) {
		switch (strategy) {
			case "highest":
				return this.#items.reduce(
					(bestIdx, item, idx) =>
						item.priority > this.#items[bestIdx].priority
							? idx
							: bestIdx,
					0,
				);
			case "lowest":
				return this.#items.reduce(
					(bestIdx, item, idx) =>
						item.priority < this.#items[bestIdx].priority
							? idx
							: bestIdx,
					0,
				);
			case "newest":
				return this.#items.reduce(
					(bestIdx, item, idx) =>
						item.insertIndex > this.#items[bestIdx].insertIndex
							? idx
							: bestIdx,
					0,
				);
			case "oldest":
			default:
				return this.#items.reduce(
					(bestIdx, item, idx) =>
						item.insertIndex < this.#items[bestIdx].insertIndex
							? idx
							: bestIdx,
					0,
				);
		}
	}
}

export const trackQueue = new BiDirectionalPriorityQueue();
