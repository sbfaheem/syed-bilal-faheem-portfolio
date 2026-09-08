import { readPublicPageBody } from '../../lib/html-page';

export const metadata = {
  title: 'Video Editing Services — Syed Bilal Faheem',
  description: 'YouTube editing, short-form reels, color grading, sound design and full channel management services by Syed Bilal Faheem.'
};

const servicesMarkup = readPublicPageBody('services-page.html');

export default function ServicesPage() {
  return <div className="services-page" dangerouslySetInnerHTML={{ __html: servicesMarkup }} />;
}
