import { createHmac, timingSafeEqual } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = process.cwd();
const SITE_JSON_PATH = join(ROOT, 'src/data/site.json');
const PORT = Number(process.env.CMS_PORT || 3001);
const CMS_USER = process.env.CMS_USER || 'admin';
const CMS_PASS = process.env.CMS_PASS || 'AlphardElite2026!';
const CMS_SECRET = process.env.CMS_SECRET || `alphard-cms-secret-${CMS_PASS}`;
const COOKIE_NAME = 'alphard_cms_session';

function signSession(user: string, exp: number): string {
  const payload = `${user}.${exp}`;
  const sig = createHmac('sha256', CMS_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifySession(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false;
  const match = cookieHeader
    .split(';')
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${COOKIE_NAME}=`));
  if (!match) return false;
  const token = decodeURIComponent(match.slice(COOKIE_NAME.length + 1));
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [user, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!exp || Date.now() > exp || user !== CMS_USER) return false;
  const expected = createHmac('sha256', CMS_SECRET).update(`${user}.${expStr}`).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

let buildPromise: Promise<void> | null = null;
async function rebuildStaticSite(): Promise<void> {
  if (buildPromise) return buildPromise;
  buildPromise = (async () => {
    try {
      const proc = Bun.spawn(['bun', '--bun', 'run', 'build'], {
        cwd: ROOT,
        stdout: 'pipe',
        stderr: 'pipe',
      });
      const code = await proc.exited;
      if (code !== 0) {
        const err = await new Response(proc.stderr).text();
        throw new Error(`Build gagal (exit ${code}): ${err}`);
      }
    } finally {
      buildPromise = null;
    }
  })();
  return buildPromise;
}

export const server = Bun.serve({
  port: PORT,
  hostname: '127.0.0.1',
  async fetch(req) {
    const url = new URL(req.url);
    if (req.method === 'GET' && (url.pathname === '/admin' || url.pathname === '/admin/' || url.pathname === '/admin/index.html')) {
      return new Response(Bun.file(join(ROOT, 'public/admin/index.html')), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    if (req.method === 'GET' && url.pathname.startsWith('/assets/')) {
      return new Response(Bun.file(join(ROOT, 'public', url.pathname)));
    }


    if (req.method === 'POST' && url.pathname === '/api/cms/login') {
      const body: unknown = await req.json().catch(() => ({}));
      const username = body && typeof body === 'object' && 'username' in body ? body.username : undefined;
      const password = body && typeof body === 'object' && 'password' in body ? body.password : undefined;
      if (username === CMS_USER && password === CMS_PASS) {
        const exp = Date.now() + 1000 * 60 * 60 * 24 * 7;
        const token = signSession(CMS_USER, exp);
        return Response.json(
          { ok: true, user: CMS_USER },
          {
            headers: {
              'Set-Cookie': `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
            },
          },
        );
      }
      return Response.json({ error: 'Username atau password salah.' }, { status: 401 });
    }

    if (req.method === 'POST' && url.pathname === '/api/cms/logout') {
      return Response.json(
        { ok: true },
        {
          headers: {
            'Set-Cookie': `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
          },
        },
      );
    }

    if (url.pathname === '/api/cms/site') {
      if (!verifySession(req.headers.get('cookie'))) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (req.method === 'GET') {
        const raw = await readFile(SITE_JSON_PATH, 'utf8');
        return new Response(raw, {
          headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
        });
      }
      if (req.method === 'PUT') {
        const raw = await readFile(SITE_JSON_PATH, 'utf8');
        try {
          const next: unknown = await req.json();
          if (
            !next ||
            typeof next !== 'object' ||
            !('contact' in next) ||
            !next.contact ||
            typeof next.contact !== 'object' ||
            !('whatsappNumber' in next.contact) ||
            typeof next.contact.whatsappNumber !== 'string' ||
            !('pricing' in next) ||
            !next.pricing ||
            typeof next.pricing !== 'object' ||
            !('dropOff' in next.pricing) ||
            !('harian' in next.pricing)
          ) {
            return Response.json({ error: 'Struktur data tidak lengkap.' }, { status: 400 });
          }
          await writeFile(SITE_JSON_PATH, JSON.stringify(next, null, 2) + '\n', 'utf8');
          await rebuildStaticSite();
          return Response.json({ ok: true });
        } catch (err: unknown) {
          await writeFile(SITE_JSON_PATH, raw, 'utf8');
          const message = err instanceof Error ? err.message : 'Gagal menyimpan dan mem-build halaman.';
          return Response.json({ error: message }, { status: 500 });
        }
      }
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
  },
});

console.log(`CMS API listening on http://127.0.0.1:${server.port}`);
