import { readPublicPageBody } from '../../lib/html-page';

export const metadata = {
  title: 'Awards & Achievements — Syed Bilal Faheem',
  description: 'Awards, professional recognition and speaking achievements earned by video editor and digital media professional Syed Bilal Faheem.'
};

const awardsMarkup = readPublicPageBody('awards-page.html');

export default function AwardsPage() {
  return <div className="awards-page" dangerouslySetInnerHTML={{ __html: awardsMarkup }} />;
}
