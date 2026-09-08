import { readPublicPageBody } from '../../lib/html-page';

export const metadata = {
  title: 'Portfolio — Syed Bilal Faheem',
  description: 'Enterprise web development, Power BI dashboards, AI applications and media production by Syed Bilal Faheem.'
};

const portfolioMarkup = readPublicPageBody('portfolio-page.html');

export default function PortfolioPage() {
  return <div className="portfolio-page" dangerouslySetInnerHTML={{ __html: portfolioMarkup }} />;
}
