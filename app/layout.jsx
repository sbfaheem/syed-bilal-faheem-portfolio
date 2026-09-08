import MotionEnhancements from './motion-enhancements';
import ClientScripts from './client-scripts';

export const metadata = {
  title: 'Syed Bilal — Software, Data, AI & Media',
  description: 'Portfolio of Syed Bilal Faheem: enterprise Sitecore development, data analytics, AI-powered web applications and digital media.',
  icons: { icon: '/assets/favicon.svg' }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#08080C'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        {children}
        <MotionEnhancements />
        <ClientScripts />
      </body>
    </html>
  );
}
