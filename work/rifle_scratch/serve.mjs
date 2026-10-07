// static server: / -> scratch dir, /game/ -> ~/astrocade-game5/game (read only)
import { createServer } from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = path.dirname(new URL(import.meta.url).pathname), GAME = path.join(process.env.HOME, 'astrocade-game5/game');
const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html', '.json': 'application/json', '.png': 'image/png' };
export function serve(port) {
  return new Promise((res) => {
    const s = createServer((req, r) => {
      const u = decodeURIComponent(req.url.split('?')[0]);
      const f = u.startsWith('/game/') ? path.join(GAME, u.slice(6)) : path.join(ROOT, u);
      fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); });
    }).listen(port, () => res(s));
  });
}
