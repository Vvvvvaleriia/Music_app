import { states } from "./state.js";

class ApiProxy {
	#rateLimit;
	#requestsLog;

	constructor() {
		this.#rateLimit = { max: 30, windowMs: 10000 };
		this.#requestsLog = [];
	}

	#checkRateLimit() {
		const now = Date.now;
		this.#requestsLog = this.#requestsLog.filter(
			(t) => now - t < this.#rateLimit.windowMs,
		);

		if (this.#requestsLog.length >= this.#rateLimit.max) {
			return true;
		}
		return false;
	}

	async request(url, options = {}) {
		if (this.#checkRateLimit()) {
			console.warn("Rate limit error");
			await new Promise((r) =>
				setTimeout(r, this.#checkRateLimit.windowMs),
			);
			return this.request(url, options);
		}
		const method = options.method || "GET";
		const headers = {
			...options.headers,
		};

		if (states.token) {
			headers["Authorization"] = `Bearer ${states.token}`;
		}
		if (!options?.headers?.["Content-Type"]) {
			headers["Content-Type"] = "application/json";
		}

		this.#requestsLog.push(Date.now());
		const resp = await fetch(url, { method, headers, body: options.body });
		return resp;
	}
}

export default new ApiProxy();
