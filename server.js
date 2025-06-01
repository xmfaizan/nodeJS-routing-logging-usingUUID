const http = require("http");
const fs = require("fs").promises;
const path = require("path");
const url = require("url");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";
const LOG_FILE = process.env.LOG_FILE || "server.log";
const PUBLIC_DIR = process.env.PUBLIC_DIR || "public";

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

async function logRequest(method, url, statusCode, requestId) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${requestId} - ${method} ${url} - Status: ${statusCode}\n`;

  try {
    await fs.appendFile(LOG_FILE, logEntry);
  } catch (error) {
    console.error("Error writing to log file:", error);
  }
}

async function serveFile(filePath, res, requestId) {
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": mimeType });
    res.end(data);
    return 200;
  } catch (error) {
    return await serve404(res, requestId);
  }
}

async function serve404(res, requestId) {
  const custom404Path = path.join(PUBLIC_DIR, "404.html");

  try {
    const custom404 = await fs.readFile(custom404Path);
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end(custom404);
  } catch (error) {
    const default404 = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>404 - Page Not Found</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
          h1 { color: #e74c3c; }
        </style>
      </head>
      <body>
        <h1>404 - Page Not Found</h1>
        <p>The requested resource could not be found.</p>
        <p>Request ID: ${requestId}</p>
      </body>
      </html>
    `;
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end(default404);
  }
  return 404;
}

function router(pathname, method) {
  const routes = {
    "/": "/index.html",
    "/home": "/index.html",
    "/about": "/about.html",
    "/contact": "/contact.html",
  };

  if (method === "GET" && routes[pathname]) {
    return routes[pathname];
  }

  return pathname;
}

async function requestHandler(req, res) {
  const requestId = uuidv4();
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  console.log(`[${requestId}] ${method} ${pathname}`);

  const routedPath = router(pathname, method);
  let filePath;
  let statusCode = 200;

  if (method === "GET") {
    if (routedPath.startsWith("/api/")) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "API endpoint",
          path: routedPath,
          requestId: requestId,
          timestamp: new Date().toISOString(),
        })
      );
      statusCode = 200;
    } else {
      filePath = path.join(PUBLIC_DIR, routedPath);
      statusCode = await serveFile(filePath, res, requestId);
    }
  } else {
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method Not Allowed");
    statusCode = 405;
  }

  await logRequest(method, pathname, statusCode, requestId);
}

const server = http.createServer(requestHandler);

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
  console.log(`Serving files from: ${PUBLIC_DIR}`);
  console.log(`Logging to: ${LOG_FILE}`);
});

server.on("error", (error) => {
  console.error("Server error:", error);
});
