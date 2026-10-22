import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApiAndMedia } from './src/server/api-handler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, 'dist');
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

function serveStaticFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const stream = fs.createReadStream(filePath);
  stream.on('open', () => {
    res.writeHead(200, { 'Content-Type': contentType });
    stream.pipe(res);
  });
  stream.on('error', () => {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  });
}

export function createAppServer() {
  return http.createServer(async (req, res) => {
    try {
      const urlObj = new URL(req.url || '/', 'http://localhost');
      const pathname = decodeURIComponent(urlObj.pathname);

      // 1. Delegate /api/*, /media/*, /avatars/*, /auth/*
      if (
        pathname.startsWith('/api/') ||
        pathname.startsWith('/media/') ||
        pathname.startsWith('/avatars/') ||
        pathname.startsWith('/auth/')
      ) {
        await handleApiAndMedia(req, res);
        return;
      }

      // 2. Check static files in dist/ then public/
      const cleanRel = pathname.replace(/^\/+/, '');
      if (cleanRel) {
        for (const baseDir of [DIST_DIR, PUBLIC_DIR]) {
          const candidate = path.resolve(baseDir, cleanRel);
          if (candidate.startsWith(baseDir) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
            serveStaticFile(res, candidate);
            return;
          }
        }
      }

      // 3. SPA fallback -> dist/index.html (or index.html)
      const distIndex = path.join(DIST_DIR, 'index.html');
      const rootIndex = path.join(__dirname, 'index.html');
      if (fs.existsSync(distIndex)) {
        serveStaticFile(res, distIndex);
      } else {
        serveStaticFile(res, rootIndex);
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'internal_error', message: err?.message }));
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const port = Number(process.env.PORT || 4173);
  const server = createAppServer();
  server.listen(port, '0.0.0.0', () => {
    console.log(`Gánh Mưu Sinh × Betech Digital server running at http://localhost:${port}`);
  });
}
