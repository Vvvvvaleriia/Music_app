function formatMessage(data) {
	const time = new Date().toLocaleDateString("en-En", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		fractionalSecondDigits: 3,
	});
	const prefix = `[${time}] [${data.level}] ${data.fnName}()`;
	if (data.phase === "error") {
		return `${prefix} error: ${data.error.message} (${data.duration} ms)`;
	} else if (data.phase === "call") {
		return `${prefix} called with arguments: ${JSON.stringify(data.args)}`;
	} else if (data.phase === "result") {
		return `${prefix} returned: ${JSON.stringify(data.result)} (${data.duration}ms)`;
	}
}

function writeLog(data) {
	const message = formatMessage(data);

	if (data.phase === "error") {
		console.error(message);
		console.groupEnd();
	} else if (data.phase == "call") {
		console.group(`${data.fnName}()`);
		if (data.level === "INFO") {
			console.info(message);
		} else {
			console.info(message);
		}
	} else if (data.phase === "result") {
		console.log(message);
		console.groupEnd();
	}
}

function log(level) {
	function decorator(fn) {
		let fnName = "anonymous";

		if (fn.name) {
			fnName = fn.Name;
		}

		return function (...args) {
			const start = Date.now();

			if (level != "ERROR") {
				writeLog({
					level,
					fnName,
					phase: "call",
					args,
				});

				try {
					const result = fn(...args);
					const duration = Date.now() - start;

					writeLog({
						level,
						fnName,
						phase: "result",
						result,
						duration,
					});

					return result;
				} catch (e) {
					const duration = Date.now() - start;

					writeLog({
						level: "ERROR",
						fnName,
						phase: "error",
						error: e,
						duration,
					});
				}
			} else {
				try {
					const result = fn(...args);
					return result;
				} catch (e) {
					const duration = Date.now() - start;

					writeLog({
						level: "ERROR",
						fnName,
						phase: "error",
						error: e,
						duration,
					});
				}
			}
		};
	}

	return decorator;
}
