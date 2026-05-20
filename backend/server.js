const http = require("http");
require("dotenv").config();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUrl = "http://127.0.0.1:3000";

const authHeader =
	"Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64");

function sendJson(resp, data, status = 200) {
	resp.writeHead(status, { "Content-Type": "application/json" });
	resp.end(JSON.stringify(data));
}

function readBody(req) {
	return new Promise((resolve, reject) => {
		let body = "";
		req.on("data", (chunk) => {
			body += chunk;
		});
		req.on("end", () => {
			try {
				resolve(JSON.parse(body));
			} catch {
				reject(new Error("Invalid JSON"));
			}
		});
		req.on("error", reject);
	});
}

const server = http.createServer(async (req, resp) => {
	resp.setHeader("Access-Control-Allow-Origin", "*");
	resp.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	resp.setHeader("Access-Control-Allow-Headers", "Content-Type");

	if (req.method === "OPTIONS") {
		resp.writeHead(200);
		resp.end();
		return;
	}

	if (req.method === "POST" && req.url === "/api/access") {
		try {
			const data = await readBody(req);
			const spotifyResp = await fetch(
				"https://accounts.spotify.com/api/token",
				{
					method: "POST",
					headers: {
						Authorization: authHeader,
						"Content-Type": "application/x-www-form-urlencoded",
					},
					body: new URLSearchParams({
						code: data.code,
						redirect_uri: redirectUrl,
						grant_type: "authorization_code",
					}),
				},
			);
			const result = await spotifyResp.json();
			sendJson(resp, {
				token: result.access_token,
				refreshToken: result.refresh_token,
			});
		} catch (e) {
			sendJson(resp, { error: e.message }, 500);
		}
		return;
	}

	if (req.method === "POST" && req.url === "/api/refresh") {
		try {
			const data = await readBody(req);
			const spotifyResp = await fetch(
				"https://accounts.spotify.com/api/token",
				{
					method: "POST",
					headers: {
						Authorization: authHeader,
						"Content-Type": "application/x-www-form-urlencoded",
					},
					body: new URLSearchParams({
						refresh_token: data.refresh_token,
						grant_type: "refresh_token",
					}),
				},
			);
			const result = await spotifyResp.json();
			sendJson(resp, { token: result.access_token });
		} catch (e) {
			sendJson(resp, { error: e.message }, 500);
		}
		return;
	}

	resp.writeHead(404);
	resp.end("Not Found");
});

server.listen(5000, () => {
	console.log("Server Start on 5000 PORT");
});
