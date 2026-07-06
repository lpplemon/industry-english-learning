const http = require("http");
const fs = require("fs");
const path = require("path");

const apiHandlers = {
  "/api/generate-learning-items": require("./api/generate-learning-items"),
  "/api/coach-chat": require("./api/coach-chat"),
  "/api/pronunciation-feedback": require("./api/pronunciation-feedback"),
  "/api/parse-document": require("./api/parse-document")
};

const root = path.join(__dirname, "dist");
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

function handleApi(request, response, handler) {
  let rawBody = "";
  request.on("data", (chunk) => {
    rawBody += chunk;
    if (rawBody.length > 2_000_000) request.destroy();
  });
  request.on("end", async () => {
    let body = {};
    try {
      body = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      response.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ error: "Invalid JSON body" }));
      return;
    }

    const adapter = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      setHeader(name, value) { response.setHeader(name, value); return this; },
      end(payload) { response.statusCode = this.statusCode; response.end(payload); }
    };

    try {
      await handler({ method: request.method, headers: request.headers, body }, adapter);
    } catch (error) {
      response.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ error: error.message || "Local API failed" }));
    }
  });
}

http.createServer((request, response) => {
  const pathname = decodeURIComponent(String(request.url || "/").split("?")[0]);
  if (apiHandlers[pathname]) {
    handleApi(request, response, apiHandlers[pathname]);
    return;
  }
  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const requestedFile = path.resolve(root, relativePath);
  const filePath = requestedFile.startsWith(root) && fs.existsSync(requestedFile)
    ? requestedFile
    : path.join(root, "index.html");

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Application build not found.");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache"
    });
    response.end(data);
  });
}).listen(4173, "127.0.0.1", () => {
  console.log("Pro English is available at http://127.0.0.1:4173");
});
