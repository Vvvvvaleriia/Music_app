import {
	deleteSaved,
	loadSavedTracks,
	playTrack,
	searchForType,
	saveTrack,
	authorize,
} from "./api.js";
import { renderHistory } from "./history.js";
import { render } from "./render.js";
import { buttonDownload } from "./utils.js";

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

export function log(level) {
	function decorator(fn) {
		let fnName = "anonymous";
		const isAsync = fn.constructor.name == "AsyncFunction";

		if (fn.name) {
			fnName = fn.name;
		}

		if (!isAsync) {
			return function (...args) {
				const start = Date.now();
				if (level != "ERROR") {
					writeLog({ level, fnName, phase: "call", args });

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
							error: e,
							fnName,
							phase: "error",
							duration,
						});
					}
				} else {
					const start = Date.now();
					try {
						const result = fn(...args);
						return result;
					} catch (e) {
						const duration = Date.now() - start;
						writeLog({
							level: "ERROR",
							error: e,
							fnName,
							phase: "error",
							duration,
						});
					}
				}
			};
		} else {
			return async function (...args) {
				const start = Date.now();
				if (level != "ERROR") {
					writeLog({ level, fnName, phase: "call", args });

					try {
						const result = await fn(...args);
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
							error: e,
							fnName,
							phase: "error",
							duration,
						});
					}
				} else {
					const start = Date.now();
					try {
						const result = await fn(...args);
						return result;
					} catch (e) {
						const duration = Date.now() - start;
						writeLog({
							level: "ERROR",
							error: e,
							fnName,
							phase: "error",
							duration,
						});
					}
				}
			};
		}
	}
	return decorator;
}

export const loggedAuthorize = log("ERROR")(authorize);
export const loggedSearch = log("INFO")(searchForType);
export const loggedPlayTrack = log("INFO")(playTrack);
export const loggedLoadSaved = log("INFO")(loadSavedTracks);
export const loggedSaveTrack = log("INFO")(saveTrack);
export const loggedDeleteTrack = log("INFO")(deleteSaved);
export const loggedHistoryRender = log("INFO")(renderHistory);
export const loggedRender = log("INFO")(render);
export const loggedButtonDownload = log("INFO")(buttonDownload);
