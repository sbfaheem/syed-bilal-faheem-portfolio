'use client';

import { useEffect } from 'react';

export default function ClientScripts() {
  useEffect(() => {
    if (document.querySelector('[data-portfolio-script-loader]')) return;

    const behaviorScript = document.createElement('script');
    behaviorScript.src = '/script.js';
    behaviorScript.dataset.portfolioScriptLoader = 'behavior';
    behaviorScript.addEventListener('load', () => {
      if (document.querySelector('script[src="/cms.js"]')) return;
      const cmsScript = document.createElement('script');
      cmsScript.src = '/cms.js';
      cmsScript.dataset.portfolioScriptLoader = 'cms';
      document.body.append(cmsScript);
    }, { once: true });
    document.body.append(behaviorScript);
  }, []);

  return null;
}
