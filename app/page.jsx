import { loadCmsState } from '../lib/cms-server';
import { renderHomeFlagships } from '../lib/home-flagships';
import { readPublicPageBody } from '../lib/html-page';

export const dynamic = 'force-dynamic';

const homeMarkup = readPublicPageBody('home.html');

export default async function HomePage() {
  let cards;
  try {
    const cms = await loadCmsState();
    cards = renderHomeFlagships(cms.collections.projects);
  } catch (error) {
    console.error('Unable to load homepage flagship projects', error);
    cards = '<p>Selected projects are temporarily unavailable. Please visit the full Portfolio below.</p>';
  }
  return <div dangerouslySetInnerHTML={{ __html: homeMarkup.replace('<!-- HOME_FLAGSHIP_CARDS -->', cards) }} />;
}
