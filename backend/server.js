const http = require("http");
require("dotenv").config();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUrl = "http://127.0.0.1:3000";

const server = http.createServer((req, resp) => {
	resp.setHeader("Access-Control-Allow-Origin", "*");
	resp.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	resp.setHeader("Access-Control-Allow-Headers", "Content-Type");

	if (req.method === "OPTIONS") {
		resp.writeHead(200, {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		});
		resp.end();
		return;
	}

	if (req.method === "POST") {
		if (req.url === "/api/refresh") {
			let body = "";

			req.on("data", (chunk) => {
				body += chunk;
			});

			req.on("end", () => {
				const data = JSON.parse(body);

				if (data.code) {
					fetch("https://accounts.spotify.com/api/token", {
						method: "POST",
						headers: {
							Authorization:
								"Basic " +
								Buffer.from(
									clientId + ":" + clientSecret,
								).toString("base64"),
							"Content-Type": "application/x-www-form-urlencoded",
						},
						body: new URLSearchParams({
							code: data.code,
							redirect_uri: redirectUrl,
							grant_type: "authorization_code",
						}),
					})
						.then((resp) => resp.json())
						.then((data) => {
							resp.writeHead(200, {
								"Content-Type": "application/json",
							});
							return resp.end(
								JSON.stringify({
									token: data.access_token,
									refreshToken: data.refresh_token,
								}),
							);
						});
				} else if (data.refresh_token) {
					fetch("https://accounts.spotify.com/api/token", {
						method: "POST",
						headers: {
							Authorization:
								"Basic " +
								Buffer.from(
									clientId + ":" + clientSecret,
								).toString("base64"),
							"Content-Type": "application/x-www-form-urlencoded",
						},
						body: new URLSearchParams({
							refresh_token: data.refresh_token,
							grant_type: "refresh_token",
						}),
					})
						.then((resp) => resp.json())
						.then((data) => {
							resp.writeHead(200, {
								"Content-Type": "application/json",
							});

							return resp.end(
								JSON.stringify({
									token: data.access_token,
									refreshToken: data.refresh_token,
								}),
							);
						});
				}
			});

			return;
		}
	}

	resp.writeHead(404);
	resp.end("Not Found");
});

server.listen(5000, () => {
	console.log("Server Start on 5000 PORT");
});
