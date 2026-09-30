// Shared by Next.js and the standalone HTML fallback. No wheel/touch hijacking,
// scroll-driven transforms, permanent animation layers, or animation libraries.
const controllerKey = '__portfolioScrollController';
const revealSelector = '.reveal, [data-scroll-reveal], .service-card, .achievement-card';
const styles = `
  html.portfolio-scroll-ready { scroll-behavior: smooth; overflow-x: clip; }
  html.portfolio-scroll-ready body { overflow-x: clip; }
  .portfolio-scroll-ready [id] { scroll-margin-top: var(--portfolio-anchor-offset, 110px); }
  .portfolio-scroll-ready .anchor-alias { top: 0; }
  .portfolio-scroll-ready .reveal,
  .portfolio-scroll-ready .achievement-card { will-change: auto; }
  .portfolio-scroll-ready .ambient { animation: none; }
  .portfolio-scroll-ready .nav a.active { animation: none; }
  @media (max-width: 920px), (pointer: coarse) {
    .portfolio-scroll-ready .ambient { display: none; }
    .portfolio-scroll-ready .grain { display: none; }
    .portfolio-scroll-ready .site-header,
    .portfolio-scroll-ready .site-header.scrolled,
    .portfolio-scroll-ready .nav { backdrop-filter: none; background-color: #0a0a0f; }
  }
  @media (max-width: 920px) {
    .portfolio-scroll-ready .nav { max-height: calc(100dvh - 110px); overflow-y: auto; visibility: hidden; }
    .portfolio-scroll-ready .nav.open { visibility: visible; }
  }
  html.portfolio-scroll-ready:has(body.modern-motion-off) { scroll-behavior: auto; }
  @media (prefers-reduced-motion: reduce) {
    html.portfolio-scroll-ready { scroll-behavior: auto; }
  }
`;

export function initPortfolioScroll() {
  if (typeof window === 'undefined') return undefined;
  const header = document.querySelector('.site-header');
  const previous = window[controllerKey];
  if (previous?.header === header && header) return previous.destroy;
  previous?.destroy();
  if (!header) return undefined;

  if (!document.getElementById('portfolio-scroll-styles')) {
    const style = document.createElement('style');
    style.id = 'portfolio-scroll-styles';
    style.textContent = styles;
    document.head.append(style);
  }
  const root = document.documentElement;
  root.classList.add('portfolio-scroll-ready');
  const nav = header.querySelector('.nav');
  const menu = header.querySelector('.menu-toggle');
  const links = [...(nav?.querySelectorAll('a[href]') || [])];
  const cleanPath = (path) => path.replace(/\/+$/, '') || '/';
  const isHome = cleanPath(location.pathname) === '/' || location.pathname === '/home.html';
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const lowMotion = () => preference.matches || document.body.classList.contains('modern-motion-off');
  const removers = [];
  const listen = (target, name, handler, options) => {
    target?.addEventListener(name, handler, options);
    removers.push(() => target?.removeEventListener(name, handler, options));
  };
  const hashTarget = (hash) => {
    try {
      const id = decodeURIComponent(hash.replace(/^#/, ''));
      return document.getElementById(id === 'awards' && isHome ? 'achievements' : id);
    } catch { return null; }
  };
  const homeLink = links.find((link) => {
    const url = new URL(link.href);
    return cleanPath(url.pathname) === '/' && !url.hash;
  });
  const sections = links.flatMap((link) => {
    const target = hashTarget(new URL(link.href).hash);
    return target && target !== header ? [{ link, target, top: 0 }] : [];
  });
  let activeLink;
  let frame = 0;
  let destroyed = false;
  let geometryDirty = true;
  let offset = 110;
  let pendingLink = null;
  let pendingTimer;
  let settleTimer;
  let restoreInitialHash = Boolean(location.hash);
  const activate = (link) => {
    if (activeLink === link) return;
    activeLink = link;
    links.forEach((item) => {
      item.classList.toggle('active', item === link);
      if (item === link) item.setAttribute('aria-current', 'location');
      else item.removeAttribute('aria-current');
    });
  };
  const closeMenu = () => {
    nav?.classList.remove('open');
    menu?.classList.remove('open');
    menu?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-label', 'Open navigation');
  };
  const targetY = (target) => Math.max(0, Math.min(
    root.scrollHeight - window.innerHeight,
    target === header ? 0 : target.getBoundingClientRect().top + window.scrollY - offset
  ));
  const measure = () => {
    geometryDirty = false;
    offset = Math.ceil(header.getBoundingClientRect().bottom + 16);
    root.style.setProperty('--portfolio-anchor-offset', `${offset}px`);
    sections.forEach((item) => { item.top = item.target.getBoundingClientRect().top + window.scrollY; });
    sections.sort((a, b) => a.top - b.top);
  };
  const update = () => {
    frame = 0;
    if (destroyed) return;
    if (geometryDirty) {
      measure();
      // Correct layout shifts while the initial hash loads, but never pull the
      // reader back after they touch, scroll, type, or click anywhere.
      const target = restoreInitialHash && hashTarget(location.hash);
      if (target && Math.abs(window.scrollY - targetY(target)) > 2) {
        window.scrollTo({ top: targetY(target), behavior: 'instant' });
      }
    }
    header.classList.toggle('scrolled', window.scrollY > 18);
    if (!isHome) return;
    if (pendingLink) { activate(pendingLink); return; }
    let selected = homeLink;
    const marker = window.scrollY + offset + 32;
    sections.forEach((item) => { if (item.top <= marker) selected = item.link; });
    activate(selected);
  };
  const queue = () => { if (!frame && !destroyed) frame = requestAnimationFrame(update); };
  const remeasure = () => { geometryDirty = true; queue(); };
  const releasePending = () => {
    pendingLink = null;
    clearTimeout(pendingTimer);
    clearTimeout(settleTimer);
    queue();
  };
  const userInput = () => { restoreInitialHash = false; releasePending(); };
  const goTo = (target, hash, link, smooth = true) => {
    restoreInitialHash = false;
    measure();
    closeMenu();
    pendingLink = link;
    if (link) activate(link);
    clearTimeout(pendingTimer);
    clearTimeout(settleTimer);
    pendingTimer = setTimeout(releasePending, 2200);
    if (hash && location.hash !== hash) history.pushState(history.state, '', hash);
    window.scrollTo({ top: targetY(target), behavior: smooth && !lowMotion() ? 'smooth' : 'instant' });
    // Native scroll remains interruptible. Keyboard users continue from the
    // section they selected, without focus triggering a second scroll.
    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    }
    target.focus({ preventScroll: true });
  };
  listen(menu, 'click', () => {
    const open = !nav?.classList.contains('open');
    nav?.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  listen(document, 'click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || url.search !== location.search) return;
    const samePage = cleanPath(url.pathname) === cleanPath(location.pathname);
    const homeTop = isHome && link === homeLink && !url.hash;
    const target = homeTop ? header : samePage && hashTarget(url.hash);
    if (!target) { if (nav?.contains(link)) closeMenu(); return; }
    event.preventDefault();
    const matchingLink = homeTop ? homeLink : sections.find((item) => item.target === target)?.link;
    goTo(target, url.hash || '#top', matchingLink);
  });
  listen(document, 'keydown', (event) => {
    if (event.key === 'Escape' && nav?.classList.contains('open')) { closeMenu(); menu?.focus(); }
  });
  listen(document, 'pointerdown', (event) => {
    userInput();
    if (!header.contains(event.target)) closeMenu();
  }, { passive: true });
  listen(window, 'wheel', userInput, { passive: true });
  listen(window, 'touchstart', userInput, { passive: true });
  listen(window, 'keydown', userInput);
  listen(window, 'scroll', () => {
    queue();
    if (pendingLink) { clearTimeout(settleTimer); settleTimer = setTimeout(releasePending, 150); }
  }, { passive: true });
  listen(window, 'scrollend', releasePending);
  listen(window, 'resize', remeasure, { passive: true });
  listen(window, 'load', remeasure);
  listen(window, 'hashchange', () => {
    const target = hashTarget(location.hash);
    if (target) goTo(target, location.hash, sections.find((item) => item.target === target)?.link, false);
    else queue();
  });

  // Only observe entries, not every scroll frame. Reveals use opacity/translate
  // and release their styles on completion, preserving CSS hover transforms.
  const seen = new WeakSet();
  const animations = new Set();
  const coarse = matchMedia('(pointer: coarse)');
  const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      observer.unobserve(target);
      if (lowMotion() || !target.animate) return;
      const animation = target.animate([
        { opacity: 0.35, translate: coarse.matches ? '0 6px' : '0 14px' },
        { opacity: 1, translate: '0 0' }
      ], { duration: coarse.matches ? 240 : 420, easing: 'cubic-bezier(.2,.7,.2,1)' });
      animations.add(animation);
      animation.onfinish = animation.oncancel = () => animations.delete(animation);
    });
  }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
  const observeReveals = (initial = false) => {
    document.querySelectorAll(revealSelector).forEach((element) => {
      if (seen.has(element)) return;
      seen.add(element);
      // Avoid nested animations and fading text already visible at startup.
      if (element.parentElement?.closest(revealSelector)) return;
      if (initial && element.getBoundingClientRect().top < window.innerHeight) return;
      observer?.observe(element);
    });
  };
  const cancelAnimations = () => {
    if (lowMotion()) animations.forEach((animation) => animation.cancel());
  };
  listen(preference, 'change', cancelAnimations);
  const pauseObserver = new MutationObserver(cancelAnimations);
  pauseObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  listen(window, 'portfolio:cms-ready', () => { observeReveals(); remeasure(); });
  const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(remeasure);
  [document.body, header, ...sections.map((item) => item.target)].forEach((element) => resizeObserver?.observe(element));
  document.fonts?.ready.then(() => { if (!destroyed) remeasure(); });
  const initialTimer = setTimeout(() => { restoreInitialHash = false; }, 5000);
  if (!isHome) activate(links.find((link) => cleanPath(new URL(link.href).pathname) === cleanPath(location.pathname) && !new URL(link.href).hash));
  observeReveals(true);
  queue();

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    removers.forEach((remove) => remove());
    cancelAnimationFrame(frame);
    clearTimeout(initialTimer);
    clearTimeout(pendingTimer);
    clearTimeout(settleTimer);
    observer?.disconnect();
    resizeObserver?.disconnect();
    pauseObserver.disconnect();
    animations.forEach((animation) => animation.cancel());
    root.classList.remove('portfolio-scroll-ready');
    root.style.removeProperty('--portfolio-anchor-offset');
    if (window[controllerKey]?.destroy === destroy) delete window[controllerKey];
  };
  window[controllerKey] = { header, destroy };
  return destroy;
}
