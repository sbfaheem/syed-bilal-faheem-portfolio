import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export function readPublicPageBody(filename) {
  const document = readFileSync(join(process.cwd(), 'public', filename), 'utf8');
  return document.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1]
    ?.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '') ?? '';
}
