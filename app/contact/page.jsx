import { readPublicPageBody } from '../../lib/html-page';

export const metadata = {
  title: 'Let’s Talk — Syed Bilal Faheem',
  description: 'Contact Syed Bilal Faheem for video editing, channel management, software, data and AI projects.'
};

const contactMarkup = readPublicPageBody('contact-page.html');

export default function ContactPage() {
  return <div className="contact-page" dangerouslySetInnerHTML={{ __html: contactMarkup }} />;
}
