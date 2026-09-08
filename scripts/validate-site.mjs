import { readFile, access } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const pages = ['public/home.html', 'public/portfolio-page.html', 'public/services-page.html', 'public/awards-page.html', 'public/contact-page.html'];
const routeFiles = ['app/layout.jsx', 'app/page.jsx', 'app/portfolio/page.jsx', 'app/services/page.jsx', 'app/awards/page.jsx', 'app/contact/page.jsx'];
const requiredAssets = [
  'public/style.css',
  'public/script.js',
  'public/cms.js',
  'public/assets/resumeimg-000.jpg',
  'public/assets/dashboards/hr-dashboard-green.png',
  'public/assets/dashboards/hr-dashboard-2024-2025.png',
  'public/assets/dashboards/sales-forecast-dashboard.png',
  'public/assets/dashboards/stock-market-live-data.png'
];

for (const file of [...pages, ...requiredAssets, ...routeFiles]) {
  await access(path.join(root, file));
}

for (const page of pages) {
  const html = await readFile(path.join(root, page), 'utf8');
  for (const marker of ['<title>', 'viewport', 'skip-link', 'script.js']) {
    if (!html.includes(marker)) throw new Error(`${page} is missing ${marker}`);
  }
  if (!html.includes('<meta name="theme-color" content="#08080C" />')) throw new Error(`${page} is missing the cinematic theme color.`);
}

const stylesheet = await readFile(path.join(root, 'public/style.css'), 'utf8');
for (const token of ['--bg: #08080c;', '--surface: #111118;', '--text: #ffffff;', '--muted: #94a3b8;', '--orange: #f97316;', '--blue: #38bdf8;', '--transition-smooth: 300ms;']) {
  if (!stylesheet.includes(token)) throw new Error(`Global cinematic token is missing: ${token}`);
}

const home = await readFile(path.join(root, 'public/home.html'), 'utf8');
for (const fallback of ['>6+</strong>', '>8+</strong>', '>4+</strong>', '<!-- HOME_FLAGSHIP_CARDS -->']) {
  if (!home.includes(fallback)) throw new Error(`Homepage is missing reliable first-load content: ${fallback}`);
}
if (/Project Showcase|Explore the Portfolio|id="project-slider"/.test(home)) throw new Error('Duplicate homepage showcase must be removed.');
if (!home.includes('Selected projects spanning enterprise engineering, public-sector digital delivery and independent AI.')) throw new Error('Homepage flagship introduction is incorrect.');
if (!home.includes('href="/portfolio#media-work">View Full Portfolio')) throw new Error('View Full Portfolio link must remain unchanged.');
if (home.includes('Project highlights are loading from the portfolio.')) {
  throw new Error('Homepage still exposes the project-loading placeholder.');
}
if ((home.match(/class="marquee-group"/g) ?? []).length !== 1) {
  throw new Error('Homepage must contain exactly one static marquee group.');
}
if (!home.includes('<span class="cinematic-orange" data-cms="home.cinematicBuilds">builds</span>')) throw new Error('Hero builds accent is missing.');
if (!home.includes('<span class="cinematic-cyan" data-cms="home.cinematicAnalyzes">analyzes</span>')) throw new Error('Hero analyzes accent is missing.');
for (const interaction of ['transform:scale(1.02)', 'transform:scale(1.05)', 'transition:transform 300ms ease-in-out']) {
  if (!stylesheet.includes(interaction)) throw new Error(`Selected Work interaction is missing: ${interaction}`);
}

for (const file of [
  'app/admin/page.jsx', 'app/admin/admin-panel.jsx', 'app/api/admin/route.js',
  'app/api/site-content/route.js', 'app/api/media/[key]/route.js',
  'db/index.js', 'lib/html-page.js', '.env.example', 'vercel.json'
]) await access(path.join(root, file));

const portfolio = await readFile(path.join(root, 'public/portfolio-page.html'), 'utf8');
for (const dashboard of ['HR Analytics Dashboard', 'HR Dashboard 2024–2025', 'Sales Forecast', 'Stock Market Live Data']) {
  if (!portfolio.includes(dashboard)) throw new Error(`Portfolio is missing ${dashboard}`);
}

const services = await readFile(path.join(root, 'public/services-page.html'), 'utf8');
for (const service of ['YouTube Video Editing', 'Short-Form Reels Editing', 'Color Grading &amp; Sound Design', 'Full Channel Management']) {
  if (!services.includes(service)) throw new Error(`Services page is missing ${service}`);
}
for (const price of ['$150', '$60', '$100', '$600']) {
  if (!services.includes(price)) throw new Error(`Services page is missing ${price}`);
}

const awards = await readFile(path.join(root, 'public/awards-page.html'), 'utf8');
for (const achievement of ['Best Editing Award 2024', 'Featured Editor', 'Guest Speaker']) {
  if (!awards.includes(achievement)) throw new Error(`Awards page is missing ${achievement}`);
}

const contact = await readFile(path.join(root, 'public/contact-page.html'), 'utf8');
for (const detail of ['bilalfaheem47@gmail.com', '+92 336 2607836', 'Contact Number', 'Project Category', 'Project Requirements &amp; Quote Request']) {
  if (!contact.includes(detail)) throw new Error(`Contact page is missing ${detail}`);
}
if (!contact.includes('mailto:bilalfaheem47@gmail.com?subject=Portfolio%20project%20enquiry')) throw new Error('Email card must open a prepared email to the portfolio address.');
if (!contact.includes('https://wa.me/923362607836?text=')) throw new Error('WhatsApp card must open a prepared chat to the portfolio number.');

for (const [key, category] of Object.entries({ software: 'Software Projects', data: 'Data Projects', ai: 'AI Solution Driven Projects', video: 'Video Editing Services' })) {
  if (!services.includes(category) || !services.includes(`/contact?category=${key}#project-form`)) throw new Error(`Missing quote link for ${category}`);
  if (!contact.includes(`value="${category}"`)) throw new Error(`Missing contact category ${category}`);
}

const admin = await readFile(path.join(root, 'app/admin/admin-panel.jsx'), 'utf8');
for (const capability of ['Page Text', 'Services', 'Awards', 'Portfolio', 'Contact & Social', 'Images', 'Themes', 'Security', 'Admin@123']) {
  if (!admin.includes(capability)) throw new Error(`Admin Panel is missing ${capability}`);
}

console.log('Validated all pages, CMS routes, Admin Panel, services, achievements, contact details, pricing and portfolio assets.');
