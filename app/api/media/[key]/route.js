import { getBindings } from '../../../../db/index';

export const dynamic = 'force-dynamic';

export async function GET(_request, context) {
  const params = await context?.params;
  const key = String(params?.key ?? '').replace(/[^a-zA-Z0-9_-]/g, '');
  if (!key) return new Response('Not found', { status: 404 });
  const { BUCKET } = getBindings();
  const object = await BUCKET.get(`cms/${key}`);
  if (!object) return new Response('Not found', { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('ETag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=300');
  return new Response(object.body, { headers });
}
