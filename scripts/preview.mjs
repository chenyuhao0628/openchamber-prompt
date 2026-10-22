import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const routes = new Map([
  ['/', ['scripts/preview.html', 'text/html']],
  ['/preview.js', ['scripts/preview.js', 'text/javascript']],
  ['/panel/index.html', ['panel/index.html', 'text/html']],
  ['/panel/section.html', ['panel/section.html', 'text/html']],
  ['/panel/main.js', ['panel/main.js', 'text/javascript']],
  ['/panel/section.js', ['panel/section.js', 'text/javascript']],
]);
const server = createServer(async (request, response) => {
  const route = routes.get(new URL(request.url, 'http://localhost').pathname);
  if (!route || request.method !== 'GET') { response.writeHead(404).end(); return; }
  try {
    const body = await readFile(fileURLToPath(new URL(route[0], root)));
    response.writeHead(200, { 'Content-Type': `${route[1]}; charset=utf-8`, 'Cache-Control': 'no-store' }).end(body);
  } catch {
    response.writeHead(500).end('Run npm run build first.');
  }
});
server.listen(Number(process.env.PREVIEW_PORT ?? 0), '127.0.0.1', () => console.log(`Synthetic preview: http://127.0.0.1:${server.address().port}/`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
