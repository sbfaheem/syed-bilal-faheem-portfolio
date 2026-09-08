import { getBindings } from '../../../db/index';
import {
  areDefaultCredentialsActive,
  changePassword,
  clearSessionCookie,
  jsonResponse,
  isPortfolioOwner,
  loadCmsState,
  login,
  logout,
  requireAdmin,
  sessionCookie
} from '../../../lib/cms-server';

export const dynamic = 'force-dynamic';

const allowedCollections = new Set(['services', 'awards', 'projects']);
const allowedPages = new Set(['home', 'about', 'portfolio', 'services', 'contact']);

export async function GET(request) {
  try {
    if (!isPortfolioOwner(request)) return jsonResponse({ error: 'Owner ChatGPT sign-in required.' }, { status: 403 });
    const admin = await requireAdmin(request);
    if (!admin) return jsonResponse({ authenticated: false, defaultCredentialsActive: await areDefaultCredentialsActive() }, { status: 401 });
    return jsonResponse({ authenticated: true, username: admin.username, mustChangePassword: Boolean(admin.must_change_password), ...(await loadCmsState()) });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unable to load the Admin Panel.' }, { status: 500 });
  }
}

async function handleUpload(request, admin) {
  if (!admin) return jsonResponse({ error: 'Authentication required.' }, { status: 401 });
  const form = await request.formData();
  const file = form.get('file');
  const requestedKey = String(form.get('key') ?? 'image');
  const key = requestedKey.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').slice(0, 80);
  if (!(file instanceof File) || !file.size) return jsonResponse({ error: 'Choose an image to upload.' }, { status: 400 });
  if (!file.type.startsWith('image/')) return jsonResponse({ error: 'Only image files are supported.' }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return jsonResponse({ error: 'Images must be 8 MB or smaller.' }, { status: 400 });

  const { DB, BUCKET } = getBindings();
  await BUCKET.put(`cms/${key}`, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
  await DB.prepare(`INSERT INTO cms_media (key, filename, content_type, size, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET filename = excluded.filename, content_type = excluded.content_type,
    size = excluded.size, updated_at = excluded.updated_at`)
    .bind(key, file.name, file.type, file.size, Date.now())
    .run();
  return jsonResponse({ ok: true, key, url: `/api/media/${encodeURIComponent(key)}?v=${Date.now()}` });
}

export async function POST(request) {
  try {
    if (!isPortfolioOwner(request)) return jsonResponse({ error: 'Owner ChatGPT sign-in required.' }, { status: 403 });
    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes('multipart/form-data')) {
      return handleUpload(request, await requireAdmin(request));
    }

    const payload = await request.json();
    if (payload.action === 'login') {
      const result = await login(payload.username, payload.password);
      if (!result) return jsonResponse({ error: 'Invalid username or password.' }, { status: 401 });
      return jsonResponse({ ok: true, username: result.username }, { headers: { 'Set-Cookie': sessionCookie(result.token) } });
    }

    const admin = await requireAdmin(request);
    if (!admin) return jsonResponse({ error: 'Authentication required.' }, { status: 401 });
    const { DB } = getBindings();
    const now = Date.now();

    if (payload.action === 'logout') {
      await logout(request);
      return jsonResponse({ ok: true }, { headers: { 'Set-Cookie': clearSessionCookie() } });
    }

    if (payload.action === 'changePassword') {
      const result = await changePassword(admin.id, payload.currentPassword, payload.newPassword);
      return jsonResponse(result, result.ok ? { headers: { 'Set-Cookie': clearSessionCookie() } } : { status: 400 });
    }

    if (payload.action === 'saveDocument') {
      if (!allowedPages.has(payload.page)) return jsonResponse({ error: 'Unknown page.' }, { status: 400 });
      await DB.prepare(`INSERT INTO cms_documents (page, content, updated_at) VALUES (?, ?, ?)
        ON CONFLICT(page) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at`)
        .bind(payload.page, JSON.stringify(payload.content ?? {}), now)
        .run();
      return jsonResponse({ ok: true });
    }

    if (payload.action === 'saveSettings') {
      if (!['theme', 'typography', 'contact', 'images'].includes(payload.key)) return jsonResponse({ error: 'Unknown setting.' }, { status: 400 });
      await DB.prepare(`INSERT INTO cms_settings (key, value, updated_at) VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`)
        .bind(payload.key, JSON.stringify(payload.value), now)
        .run();
      return jsonResponse({ ok: true });
    }

    if (payload.action === 'saveCollection') {
      if (!allowedCollections.has(payload.collection) || !Array.isArray(payload.items)) return jsonResponse({ error: 'Invalid collection.' }, { status: 400 });
      if (payload.collection === 'projects') {
        const flagshipCount = payload.items.slice(0, 100).filter((item) => item?.homeFlagship === true).length;
        if (flagshipCount > 4) return jsonResponse({ error: 'Select up to four homepage flagship projects.' }, { status: 400 });
      }
      const statements = [DB.prepare('DELETE FROM cms_collection_items WHERE collection = ?').bind(payload.collection)];
      if (payload.collection === 'projects') {
        const selectedIds = payload.items.slice(0, 100).filter((item) => item.homeFlagship === true).map((item) => String(item.id).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 80));
        statements.push(DB.prepare('INSERT INTO cms_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at').bind('homeFlagshipIds', JSON.stringify(selectedIds), now));
      }
      payload.items.slice(0, 100).forEach((item, index) => {
        const id = String(item.id || crypto.randomUUID()).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 80);
        statements.push(DB.prepare('INSERT INTO cms_collection_items (collection, id, position, data, updated_at) VALUES (?, ?, ?, ?, ?)')
          .bind(payload.collection, id, index, JSON.stringify({ ...item, id }), now));
      });
      await DB.batch(statements);
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ error: 'Unknown action.' }, { status: 400 });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Admin request failed.' }, { status: 500 });
  }
}
