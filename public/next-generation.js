// Progressive enhancements for existing public templates. No API keys, user data or animation dependencies.
const industries = {
  healthcare: { name: 'hospital', services: ['General consultation', 'Follow-up visit'] },
  dental: { name: 'dental clinic', services: ['Dental check-up', 'Teeth cleaning'] },
  aesthetic: { name: 'aesthetic clinic', services: ['Skin consultation', 'Treatment consultation'] },
  roofing: { name: 'roofing company', services: ['Roof inspection', 'Repair estimate'] }
};

export function initNextGeneration(header) {
  const main = document.querySelector('main');
  if (!main || !header) return () => {};
  const removers = [], observers = [], animations = new Set(), countFrames = new Set();
  const listen = (target, event, fn, options) => {
    target?.addEventListener(event, fn, options);
    removers.push(() => target?.removeEventListener(event, fn, options));
  };
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const readPause = () => { try { return localStorage.getItem('portfolio-motion-paused') === 'true'; } catch { return false; } };
  let paused = readPause();
  const noMotion = () => paused || motion.matches;
  const toggle = document.createElement('button');
  toggle.type = 'button'; toggle.className = 'next-motion-toggle';
  const footer = document.querySelector('.footer');
  // A visible control outside the fixed header avoids crowding the navigation.
  const controlHost = main.querySelector('.hero-actions') || footer;
  controlHost?.append(toggle);
  const applyMotion = () => {
    document.body.classList.toggle('modern-motion-off', noMotion());
    toggle.textContent = motion.matches ? 'Motion: reduced (system)' : paused ? 'Motion: off · enable' : 'Motion: on · pause';
    toggle.setAttribute('aria-pressed', String(noMotion()));
    toggle.disabled = motion.matches;
    if (noMotion()) {
      animations.forEach(a => a.cancel());
      countFrames.forEach(cancelAnimationFrame); countFrames.clear();
      main.querySelectorAll('.counter').forEach(el => { el.textContent = `${el.dataset.target || 0}${el.dataset.suffix || ''}`; });
    }
  };
  listen(toggle, 'click', () => { paused = !paused; try { localStorage.setItem('portfolio-motion-paused', String(paused)); } catch {} applyMotion(); });
  listen(motion, 'change', applyMotion);
  applyMotion();

  const progress = document.createElement('div'); progress.className = 'next-scroll-progress'; progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  let frame = 0;
  const paint = () => {
    frame = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.max(0, Math.min(1, scrollY / max)) : 0})`;
  };
  const queue = () => { if (!frame) frame = requestAnimationFrame(paint); };
  listen(window, 'scroll', queue, { passive: true }); listen(window, 'resize', queue, { passive: true });
  listen(window, 'portfolio:cms-ready', queue); queue();

  // Finite hero entrance, separate from the existing scroll reveal controller.
  if (!noMotion() && main.querySelector('.cinematic-hero')) {
    main.querySelectorAll('.hero-copy > .reveal, .hero-portrait-wrap').forEach((el, i) => {
      if (!el.animate) return;
      const animation = el.animate([{ opacity: .3, translate: '0 12px' }, { opacity: 1, translate: '0 0' }], { duration: 550, delay: Math.min(i, 5)*65, easing: 'cubic-bezier(.2,.75,.2,1)', fill: 'backwards' });
      animations.add(animation); animation.onfinish = animation.oncancel = () => animations.delete(animation);
    });
  }
  if (!noMotion() && fine.matches) {
    main.querySelectorAll('.hero .floating-tech').forEach((el, i) => {
      if (!el.animate) return;
      const a = el.animate([{translate:'0 0'},{translate:'0 -7px'},{translate:'0 0'}], {duration:2200, delay:i*120, easing:'ease-in-out'});
      animations.add(a); a.onfinish = a.oncancel = () => animations.delete(a);
    });
  }
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(entries => entries.forEach(({target:el,isIntersecting})=>{
      if (!isIntersecting) return;
      counterObserver.unobserve(el);
      const value = Number(el.dataset.target), suffix = el.dataset.suffix || '';
      if (noMotion() || !Number.isFinite(value) || value<0) return;
      el.setAttribute('aria-label', `${value}${suffix}`);
      const start = performance.now(); let id;
      const tick = now => {
        countFrames.delete(id);
        if (noMotion()) { el.textContent = `${value}${suffix}`; return; }
        const t = Math.min(1, (now-start)/650);
        el.textContent = `${Math.round(value*(1-Math.pow(1-t,3)))}${suffix}`;
        if (t<1) { id=requestAnimationFrame(tick); countFrames.add(id); }
      };
      id=requestAnimationFrame(tick); countFrames.add(id);
    }),{threshold:.35});
    main.querySelectorAll('.counter').forEach(el=>counterObserver.observe(el)); observers.push(counterObserver);
  }
  // Event delegation handles cards replaced by CMS, without a listener per card.
  const hoverTargets = '.expertise-card,.scope-card,.tech-group,.home-featured-card,.media-project-card,.dashboard-card,.enterprise-portfolio-card,.product-portfolio-card,.credential-card,.contact-detail-card,.service-card,.achievement-card,.next-console';
  let activeCard;
  const clearSpotlight = () => { activeCard?.classList.remove('next-spotlight'); activeCard = null; };
  listen(main, 'pointermove', e => {
    if (!fine.matches || noMotion()) { clearSpotlight(); return; }
    const card = e.target instanceof Element ? e.target.closest(hoverTargets) : null;
    if (!card) { clearSpotlight(); return; }
    if (card !== activeCard) { clearSpotlight(); activeCard = card; card.classList.add('next-spotlight'); }
    const r = card.getBoundingClientRect();
    card.style.setProperty('--next-x', `${e.clientX-r.left}px`); card.style.setProperty('--next-y', `${e.clientY-r.top}px`);
  }, { passive: true });
  listen(main, 'pointerleave', clearSpotlight);

  if ('IntersectionObserver' in window) {
    const timeline = new IntersectionObserver(entries => entries.forEach(({target,isIntersecting}) => { if (isIntersecting) { target.classList.add('next-timeline-seen'); timeline.unobserve(target); } }), {threshold: .15});
    main.querySelectorAll('.experience-item').forEach(item => timeline.observe(item)); observers.push(timeline);
  }

  // Filter the existing skill cards, preserving the source text and all entries by default.
  const skillGrid = main.querySelector('.tech-stack-grid');
  let skillControls;
  if (skillGrid) {
    const groups = [...skillGrid.querySelectorAll('.tech-group')];
    skillControls = document.createElement('div'); skillControls.className = 'next-skill-filter'; skillControls.setAttribute('role','group'); skillControls.setAttribute('aria-label','Filter technologies');
    ['All', ...groups.map(g => g.querySelector('h3')?.textContent.trim())].forEach((name, i) => {
      const button = document.createElement('button'); button.type='button'; button.textContent=name; button.setAttribute('aria-pressed', String(i===0)); skillControls.append(button);
      listen(button,'click',()=>{ [...skillControls.children].forEach(b=>b.setAttribute('aria-pressed',String(b===button))); groups.forEach((g,j)=>g.hidden=i!==0 && j!==i-1); });
    });
    skillGrid.before(skillControls);
  }

  const demo = main.querySelector('[data-receptionist-demo]');
  if (demo) {
    const log = demo.querySelector('.next-chat'), choices = demo.querySelector('.next-choices'), status = demo.querySelector('[data-demo-state]');
    const tabs = [...demo.querySelectorAll('[data-industry]')];
    let industry = 'healthcare', service = '', slot = '';
    const addMessage = (text, role='agent') => { const p=document.createElement('p'); p.className=`next-msg next-msg-${role}`; p.textContent=text; log.append(p); log.scrollTop=log.scrollHeight; };
    const setStep = (n, text) => { status.textContent=text; main.querySelectorAll('[data-flow]').forEach(el => { const i=Number(el.dataset.flow); el.classList.toggle('is-complete', i<n); el.classList.toggle('is-current', i===n); }); };
    const options = (items) => { choices.replaceChildren(); items.forEach(([label, action]) => { const b=document.createElement('button'); b.type='button'; b.textContent=label; b.addEventListener('click',()=>{ const focusWasHere=choices.contains(document.activeElement); action(); if (focusWasHere) (choices.querySelector('button') || demo.querySelector('[data-demo-reset]'))?.focus({preventScroll:true}); }); choices.append(b); }); };
    const start = (key) => { industry=key; service=''; slot=''; log.replaceChildren(); tabs.forEach(b=>b.setAttribute('aria-pressed', String(b.dataset.industry===key))); addMessage(`Hello! Welcome to our demo ${industries[key].name}. How can I help you today?`); setStep(0,'Step 1 of 4 · Choose a service'); options(industries[key].services.map(name=>[name,()=>selectService(name)])); };
    const selectService = (name) => { service=name; addMessage(`I’d like to request: ${name}.`,'user'); addMessage('Of course. Here are two example appointment times. Which works for you?'); setStep(1,'Step 2 of 4 · Select a sample time'); options(['Tomorrow · 10:00 AM','Tomorrow · 2:30 PM'].map(time=>[time,()=>selectSlot(time)])); };
    const selectSlot = (time) => { slot=time; addMessage(time,'user'); addMessage(`Great. Your sample request is ${service} at ${slot}. Shall I confirm this demonstration?`); setStep(2,'Step 3 of 4 · Review'); options([['Confirm demo',confirm],['Choose another time',()=>selectService(service)]]); };
    const confirm = () => { addMessage('Confirm demo','user'); addMessage('Demo complete! In a deployed system, a calendar integration could check availability and create a real booking. No appointment has been made here.'); setStep(4,'Step 4 of 4 · Demo complete'); options([['Try again',()=>start(industry)]]); };
    tabs.forEach(b=>listen(b,'click',()=>start(b.dataset.industry))); listen(demo.querySelector('[data-demo-reset]'),'click',()=>start(industry)); start(industry);
  }
  return () => { removers.forEach(fn=>fn()); observers.forEach(o=>o.disconnect()); animations.forEach(a=>a.cancel()); countFrames.forEach(cancelAnimationFrame); countFrames.clear(); main.querySelectorAll('.counter').forEach(el=>{el.textContent=`${el.dataset.target || 0}${el.dataset.suffix || ''}`;}); cancelAnimationFrame(frame); clearSpotlight(); progress.remove(); toggle.remove(); skillControls?.remove(); main.querySelectorAll('.tech-group[hidden]').forEach(el=>el.hidden=false); document.body.classList.remove('modern-motion-off'); };
}
