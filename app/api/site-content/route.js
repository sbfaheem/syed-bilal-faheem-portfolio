import { jsonResponse, loadCmsState } from '../../../lib/cms-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return jsonResponse(await loadCmsState());
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unable to load site content.' }, { status: 500 });
  }
}
