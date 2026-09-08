import postgres from 'postgres';
import { head as blobHead, put as blobPut } from '@vercel/blob';

let client;
let schemaReady;

function getClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing. Connect a Postgres database to this Vercel project.');
  }
  if (!client) {
    client = postgres(process.env.DATABASE_URL, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 15,
      prepare: false
    });
  }
  return client;
}

async function ensureSchema() {
  if (!schemaReady) {
    const sql = getClient();
    schemaReady = (async () => {
      await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS admins (
          id BIGSERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          salt TEXT NOT NULL,
          iterations INTEGER NOT NULL DEFAULT 210000,
          must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
          created_at BIGINT NOT NULL,
          updated_at BIGINT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS admin_sessions (
          token_hash TEXT PRIMARY KEY,
          admin_id BIGINT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
          expires_at BIGINT NOT NULL,
          created_at BIGINT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS cms_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at BIGINT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS cms_documents (
          page TEXT PRIMARY KEY,
          content TEXT NOT NULL,
          updated_at BIGINT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS cms_collection_items (
          collection TEXT NOT NULL,
          id TEXT NOT NULL,
          position INTEGER NOT NULL DEFAULT 0,
          data TEXT NOT NULL,
          updated_at BIGINT NOT NULL,
          PRIMARY KEY (collection, id),
          UNIQUE (collection, position)
        );
        CREATE TABLE IF NOT EXISTS cms_media (
          key TEXT PRIMARY KEY,
          filename TEXT NOT NULL,
          content_type TEXT NOT NULL,
          size BIGINT NOT NULL,
          updated_at BIGINT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_admin_sessions_expiry ON admin_sessions(expires_at);
      `);
    })().catch((error) => {
      schemaReady = undefined;
      throw error;
    });
  }
  await schemaReady;
}

function postgresQuery(query) {
  let index = 0;
  let converted = query.replace(/\?/g, () => `$${++index}`);
  if (/^\s*INSERT\s+OR\s+IGNORE\s+/i.test(converted)) {
    converted = converted.replace(/^\s*INSERT\s+OR\s+IGNORE\s+/i, 'INSERT ');
    converted += ' ON CONFLICT DO NOTHING';
  }
  return converted;
}

class Statement {
  constructor(query, values = []) {
    this.query = query;
    this.values = values;
  }

  bind(...values) {
    return new Statement(this.query, values);
  }

  async rows(executor = getClient()) {
    await ensureSchema();
    return executor.unsafe(postgresQuery(this.query), this.values);
  }

  async first() {
    const rows = await this.rows();
    return rows[0] ?? null;
  }

  async all() {
    return { results: await this.rows() };
  }

  async run() {
    await this.rows();
    return { success: true };
  }
}

const DB = {
  prepare(query) {
    return new Statement(query);
  },
  async batch(statements) {
    await ensureSchema();
    const sql = getClient();
    return sql.begin(async (transaction) => {
      const results = [];
      for (const statement of statements) {
        results.push(await transaction.unsafe(postgresQuery(statement.query), statement.values));
      }
      return results;
    });
  }
};

const BUCKET = {
  async put(pathname, bytes, options = {}) {
    return blobPut(pathname, Buffer.from(bytes), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: options.httpMetadata?.contentType || 'application/octet-stream'
    });
  },
  async get(pathname) {
    try {
      const metadata = await blobHead(pathname);
      const response = await fetch(metadata.url, { cache: 'no-store' });
      if (!response.ok) return null;
      return {
        body: response.body,
        httpEtag: metadata.etag || '',
        writeHttpMetadata(headers) {
          headers.set('Content-Type', metadata.contentType || response.headers.get('content-type') || 'application/octet-stream');
          if (metadata.size != null) headers.set('Content-Length', String(metadata.size));
        }
      };
    } catch {
      return null;
    }
  }
};

export function getBindings() {
  return { DB, BUCKET };
}
