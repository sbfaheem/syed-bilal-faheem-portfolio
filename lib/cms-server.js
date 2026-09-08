import { getBindings } from '../db/index';
import { defaultCollections, defaultDocuments, defaultSettings } from './cms-defaults';
import { normalizeHomeFlagships } from './home-flagships';

export const SESSION_COOKIE = 'sb_admin_session';
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'Admin@123';
const SESSION_TTL_SECONDS = 60 * 60 * 12;
const PASSWORD_ITERATIONS = 210000;
const CMS_INITIALIZED_KEY = 'vercelCmsInitializedV1';
const KARACHI_TO_KASHMIR_RELEASE_KEY = 'contentReleaseKarachiToKashmirV1';
const RELEASE_HOME_FLAGSHIP_IDS = ['honda-middle-east', 'dubai-culture', 'plan-my-trip', 'karachi-to-kashmir'];

const clone = (value) => JSON.parse(JSON.stringify(value));
const safeJson = (value, fallback) => {
  try { return JSON.parse(value); } catch { return fallback; }
};

async function ensureCmsInitialized() {
  const { DB } = getBindings();
  const initialized = await DB.prepare('SELECT value FROM cms_settings WHERE key = ?').bind(CMS_INITIALIZED_KEY).first();
  if (initialized) return;

  const now = Date.now();
  const statements = [];
  for (const [key, value] of Object.entries(defaultSettings)) {
    statements.push(DB.prepare('INSERT INTO cms_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO NOTHING')
      .bind(key, JSON.stringify(value), now));
  }
  for (const [page, content] of Object.entries(defaultDocuments)) {
    statements.push(DB.prepare('INSERT INTO cms_documents (page, content, updated_at) VALUES (?, ?, ?) ON CONFLICT(page) DO NOTHING')
      .bind(page, JSON.stringify(content), now));
  }
  for (const [collection, items] of Object.entries(defaultCollections)) {
    items.forEach((item, position) => {
      statements.push(DB.prepare('INSERT INTO cms_collection_items (collection, id, position, data, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT DO NOTHING')
        .bind(collection, item.id, position, JSON.stringify(item), now));
    });
  }
  statements.push(DB.prepare('INSERT INTO cms_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at')
    .bind(CMS_INITIALIZED_KEY, JSON.stringify(true), now));
  await DB.batch(statements);
}

async function ensureKarachiToKashmirRelease() {
  const { DB } = getBindings();
  const released = await DB.prepare('SELECT value FROM cms_settings WHERE key = ?').bind(KARACHI_TO_KASHMIR_RELEASE_KEY).first();
  if (released) return;

  const summary = await DB.prepare("SELECT COUNT(*) AS project_count, COALESCE(MAX(position), -1) AS max_position FROM cms_collection_items WHERE collection = 'projects'").first();
  const project = defaultCollections.projects.find((item) => item.id === 'karachi-to-kashmir');
  const now = Date.now();
  const statements = [];

  // An empty collection uses cms-defaults directly. A populated collection is
  // admin-managed, so add this release once without restoring later deletions.
  if (Number(summary?.project_count ?? 0) > 0 && project) {
    statements.push(DB.prepare('INSERT OR IGNORE INTO cms_collection_items (collection, id, position, data, updated_at) VALUES (?, ?, ?, ?, ?)')
      .bind('projects', project.id, Number(summary.max_position) + 1, JSON.stringify(project), now));
  }

  statements.push(DB.prepare('INSERT INTO cms_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at')
    .bind('homeFlagshipIds', JSON.stringify(RELEASE_HOME_FLAGSHIP_IDS), now));
  statements.push(DB.prepare('INSERT INTO cms_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at')
    .bind(KARACHI_TO_KASHMIR_RELEASE_KEY, JSON.stringify(true), now));
  await DB.batch(statements);
}

export async function loadCmsState() {
  const { DB } = getBindings();
  await ensureCmsInitialized();
  await ensureKarachiToKashmirRelease();
  const [settingsResult, documentsResult, collectionsResult] = await Promise.all([
    DB.prepare('SELECT key, value FROM cms_settings').all(),
    DB.prepare('SELECT page, content FROM cms_documents').all(),
    DB.prepare('SELECT collection, data FROM cms_collection_items ORDER BY collection, position, id').all()
  ]);

  const settings = clone(defaultSettings);
  for (const row of settingsResult.results ?? []) settings[row.key] = safeJson(row.value, settings[row.key]);

  const documents = clone(defaultDocuments);
  for (const row of documentsResult.results ?? []) documents[row.page] = { ...(documents[row.page] ?? {}), ...safeJson(row.content, {}) };

  const grouped = {};
  for (const row of collectionsResult.results ?? []) {
    if (!grouped[row.collection]) grouped[row.collection] = [];
    grouped[row.collection].push(safeJson(row.data, {}));
  }
  const collections = Object.fromEntries(Object.keys(defaultCollections).map((key) => [key, []]));
  for (const [key, value] of Object.entries(grouped)) collections[key] = value;
  collections.projects = normalizeHomeFlagships(collections.projects.map((project) => {
    const defaults = defaultCollections.projects.find((item) => item.id === project.id);
    return { ...project, imageUrl: project.imageUrl || defaults?.imageUrl || '', impactMetric: project.impactMetric ?? defaults?.impactMetric ?? project.category };
  }), settings.homeFlagshipIds);

  return { settings, documents, collections };
}

function bytesToBase64(bytes) {
  return Buffer.from(bytes).toString('base64');
}

function base64ToBytes(value) {
  return new Uint8Array(Buffer.from(value, 'base64'));
}

async function derivePassword(password, saltBase64, iterations = PASSWORD_ITERATIONS) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: base64ToBytes(saltBase64), iterations },
    key,
    256
  );
  return bytesToBase64(new Uint8Array(bits));
}

function secureEqual(left, right) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return result === 0;
}

async function sha256(value) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function randomToken(byteLength = 32) {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return bytesToBase64(bytes).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

async function ensureDefaultAdmin() {
  const { DB } = getBindings();
  const existing = await DB.prepare('SELECT id, username, password_hash, salt, iterations FROM admins WHERE username = ?').bind(DEFAULT_USERNAME).first();
  if (existing) return existing;

  const now = Date.now();
  const salt = bytesToBase64(crypto.getRandomValues(new Uint8Array(18)));
  const passwordHash = await derivePassword(DEFAULT_PASSWORD, salt, PASSWORD_ITERATIONS);
  await DB.prepare('INSERT INTO admins (username, password_hash, salt, iterations, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(username) DO NOTHING')
    .bind(DEFAULT_USERNAME, passwordHash, salt, PASSWORD_ITERATIONS, now, now)
    .run();
  return DB.prepare('SELECT id, username, password_hash, salt, iterations FROM admins WHERE username = ?').bind(DEFAULT_USERNAME).first();
}

export async function login(username, password) {
  const { DB } = getBindings();
  const normalizedUsername = String(username ?? '').trim();
  if (normalizedUsername === DEFAULT_USERNAME) await ensureDefaultAdmin();
  const admin = await DB.prepare('SELECT id, username, password_hash, salt, iterations FROM admins WHERE username = ?').bind(normalizedUsername).first();
  if (!admin) return null;
  const candidate = await derivePassword(String(password ?? ''), admin.salt, admin.iterations);
  if (!secureEqual(candidate, admin.password_hash)) return null;

  const token = randomToken();
  const tokenHash = await sha256(token);
  const now = Date.now();
  await DB.prepare('DELETE FROM admin_sessions WHERE expires_at < ?').bind(now).run();
  await DB.prepare('INSERT INTO admin_sessions (token_hash, admin_id, expires_at, created_at) VALUES (?, ?, ?, ?)')
    .bind(tokenHash, admin.id, now + SESSION_TTL_SECONDS * 1000, now)
    .run();
  return { token, username: admin.username };
}

function readCookie(request, name) {
  const cookies = request.headers.get('cookie') ?? '';
  for (const part of cookies.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return '';
}

export async function requireAdmin(request) {
  const { DB } = getBindings();
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = await sha256(token);
  const session = await DB.prepare(`SELECT a.id, a.username, a.must_change_password, s.token_hash
    FROM admin_sessions s JOIN admins a ON a.id = s.admin_id
    WHERE s.token_hash = ? AND s.expires_at > ?`).bind(tokenHash, Date.now()).first();
  return session ? { ...session, tokenHash } : null;
}

export async function areDefaultCredentialsActive() {
  const { DB } = getBindings();
  const admin = await DB.prepare('SELECT must_change_password FROM admins WHERE username = ?').bind(DEFAULT_USERNAME).first();
  return !admin || Boolean(admin.must_change_password);
}

export async function logout(request) {
  const admin = await requireAdmin(request);
  if (!admin) return;
  const { DB } = getBindings();
  await DB.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(admin.tokenHash).run();
}

export async function changePassword(adminId, currentPassword, newPassword) {
  const { DB } = getBindings();
  const admin = await DB.prepare('SELECT id, password_hash, salt, iterations FROM admins WHERE id = ?').bind(adminId).first();
  if (!admin) return { ok: false, error: 'Admin account not found.' };
  const currentHash = await derivePassword(String(currentPassword ?? ''), admin.salt, admin.iterations);
  if (!secureEqual(currentHash, admin.password_hash)) return { ok: false, error: 'Current password is incorrect.' };
  if (String(newPassword ?? '').length < 10) return { ok: false, error: 'New password must contain at least 10 characters.' };

  const salt = bytesToBase64(crypto.getRandomValues(new Uint8Array(18)));
  const passwordHash = await derivePassword(newPassword, salt, PASSWORD_ITERATIONS);
  const now = Date.now();
  await DB.batch([
    DB.prepare('UPDATE admins SET password_hash = ?, salt = ?, iterations = ?, must_change_password = FALSE, updated_at = ? WHERE id = ?')
      .bind(passwordHash, salt, PASSWORD_ITERATIONS, now, admin.id),
    DB.prepare('DELETE FROM admin_sessions WHERE admin_id = ?').bind(admin.id)
  ]);
  return { ok: true };
}

export function sessionCookie(token) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export function jsonResponse(body, init = {}) {
  const headers = new Headers(init.headers ?? {});
  headers.set('Cache-Control', 'no-store');
  return Response.json(body, { ...init, headers });
}

export function isPortfolioOwner(request) {
  return true;
}
