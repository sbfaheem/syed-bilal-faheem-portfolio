'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initPortfolioScroll } from '../public/scroll-effects.js';

// Rebind on Next.js navigation; release the previous route's listeners.
export default function MotionEnhancements() {
  const pathname = usePathname();
  useEffect(() => initPortfolioScroll(), [pathname]);
  return null;
}
