const { states } = require("./state");

class ApiProxy {
	#rateLimit;

	constructor() {
		this.#rateLimit = { max: 30, windowMs: 10000 };
	}

	async request(url, options = {}) {
		const method = options.method || "GET";
		const headers = {
			Authorization: `Bearer ${states.token}`,
			...options.headers,
		};

		const resp = await fetch(url, { method, headers });
		return resp;
	}
}
