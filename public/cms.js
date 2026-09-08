(async () => {
  const text = (tag, className, value) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = value ?? '';
    return element;
  };
  const safeLink = (value) => {
    try {
      const url = new URL(value, window.location.origin);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  };

  const animateIn = (element, index = 0) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    element.animate(
      [{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 520, delay: Math.min(index * 70, 280), easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' }
    );
  };

  const fontSectionSelectors = {
    navigation: '.site-header',
    homeHero: '.hero',
    homeStats: '.stats',
    homeAbout: '.about',
    homeExpertise: '#expertise',
    homeClients: '.client-strip',
    homeProjectSlider: '.project-slider-section',
    homeWork: '.projects',
    homeExperience: '.experience',
    homeToolkit: '.skills',
    homeCredentials: '.credentials',
    homeMedia: '.media-section',
    homeStatement: '.statement',
    homeContact: '.contact:not(.portfolio-contact):not(.services-contact):not(.awards-contact)',
    portfolioHero: '.portfolio-hero',
    portfolioProjects: '#media-work',
    portfolioDashboards: '#power-bi',
    portfolioEnterprise: '#enterprise',
    portfolioProducts: '#digital-products',
    portfolioContact: '.portfolio-contact',
    servicesHero: '.services-hero',
    servicesCatalog: '.services-catalog',
    servicesApproach: '.service-approach',
    servicesContact: '.services-contact',
    awardsHero: '.awards-hero',
    awardsTimeline: '.awards-timeline-section',
    awardsContact: '.awards-contact',
    contactHero: '.contact-hero',
    contactForm: '.contact-form-section',
    footer: '.footer'
  };
  const textSelector = 'h1,h2,h3,h4,p,a,button,span,strong,small,em,b,label,li,input,select,textarea,.project-meta';

  const applyFontSizes = (fontSizes = {}) => {
    const sections = Object.entries(fontSectionSelectors).flatMap(([key, selector]) =>
      [...document.querySelectorAll(selector)].map((section) => ({ key, section }))
    );
    const elements = [...new Set(sections.flatMap(({ section }) => [...section.querySelectorAll(textSelector)]))];
    elements.forEach((element) => { element.style.fontSize = ''; });
    sections.forEach(({ key, section }) => {
      const increase = Math.min(10, Math.max(0, Number(fontSizes[key]) || 0));
      if (!increase) return;
      section.querySelectorAll(textSelector).forEach((element) => {
        const baseSize = Number.parseFloat(getComputedStyle(element).fontSize);
        if (Number.isFinite(baseSize)) element.style.fontSize = `${baseSize + increase}px`;
      });
    });
  };

  const renderServices = (container, services) => {
    container.replaceChildren();
    const count = document.querySelector('.services-hero-panel > strong'); if (count) count.textContent = String(services.length).padStart(2, '0');
    const firstPrice = document.querySelector('.services-hero-price b'); if (firstPrice && services[0]?.price) firstPrice.textContent = services[0].price;
    services.forEach((service, index) => {
      const card = document.createElement('article'); card.className = 'service-card';
      const top = document.createElement('div'); top.className = 'service-card-top';
      top.append(text('span', 'service-icon', service.icon || '✦'), text('span', 'service-number', String(index + 1).padStart(2, '0')));
      const copy = document.createElement('div'); copy.className = 'service-card-copy';
      copy.append(text('span', '', service.category), text('h3', '', service.title), text('p', '', service.description));
      const price = document.createElement('div'); price.className = 'service-price';
      price.append(text('span', '', 'Starting at'), text('strong', '', service.price), text('small', '', service.unit));
      card.append(top, copy, price); container.append(card); animateIn(card, index);
    });
  };

  const renderAwards = (container, awards) => {
    container.replaceChildren();
    const count = document.querySelector('.awards-hero-panel > strong'); if (count) count.textContent = String(awards.length).padStart(2, '0');
    awards.forEach((award, index) => {
      const card = document.createElement('article'); card.className = 'achievement-card';
      const rail = document.createElement('div'); rail.className = 'achievement-rail'; rail.setAttribute('aria-hidden', 'true');
      rail.append(text('span', '', String(index + 1).padStart(2, '0')), document.createElement('i'));
      const body = document.createElement('div'); body.className = 'achievement-card-body';
      const meta = document.createElement('div'); meta.className = 'achievement-meta'; meta.append(text('span', '', award.year), text('span', '', award.issuer));
      const icon = text('div', `achievement-icon ${index % 2 ? 'achievement-icon-blue' : ''}`, index % 2 ? '◆' : '★'); icon.setAttribute('aria-hidden', 'true');
      const why = document.createElement('div'); why.className = 'achievement-why'; why.append(text('span', '', 'Why it matters'), text('strong', '', award.impact));
      body.append(meta, icon, text('h3', '', award.title), text('p', '', award.description), why);
      card.append(rail, body); container.append(card); animateIn(card, index);
    });
  };

  const projectImage = (project, className) => {
    if (project.imageUrl) {
      const wrap = document.createElement('div'); wrap.className = className;
      const image = document.createElement('img'); image.src = project.imageUrl; image.alt = `${project.title} thumbnail`; image.loading = 'lazy'; wrap.append(image); return wrap;
    }
    const placeholder = document.createElement('div'); placeholder.className = `${className} cms-project-placeholder`;
    placeholder.append(text('span', '', project.category || 'Project'), text('em', '', project.title)); return placeholder;
  };

  const tags = (value) => {
    const row = document.createElement('div'); row.className = 'tag-row';
    String(value || '').split(',').map((tag) => tag.trim()).filter(Boolean).forEach((tag) => row.append(text('span', '', tag)));
    return row;
  };

  const configureProjectDetails = (card, project, copy) => {
    card.dataset.projectTitle = project.title || 'Project';
    card.dataset.projectDetails = project.details || project.description || '';
    const projectUrl = safeLink(project.link);
    if (projectUrl) card.dataset.projectLink = projectUrl;
    const button = text('button', 'project-detail-button', 'View More');
    button.type = 'button';
    button.setAttribute('aria-label', `View full details for ${project.title || 'project'}`);
    copy.append(button);
  };

  const projectCategoryKey = (project) => {
    const label = String(project.category || '').toLowerCase();
    const searchable = `${project.title || ''} ${project.category || ''} ${project.tags || ''}`.toLowerCase();
    if (/middle east|gcc/.test(label)) return 'middle-east';
    if (/video editing|media/.test(label)) return 'media';
    if (/power bi/.test(label)) return 'power-bi';
    if (/ai|web/.test(label)) return 'ai-web';
    if (/sitecore|honda|dubai culture|dunlop/.test(searchable)) return 'middle-east';
    if (/youtube|reel|color grading|sound design|post-production/.test(searchable)) return 'media';
    if (/power bi|dax|forecast|market data/.test(searchable)) return 'power-bi';
    return 'ai-web';
  };

  const renderPortfolioProjects = (container, projects) => {
    container.replaceChildren();
    document.querySelector('.portfolio-filter-row')?.setAttribute('hidden', '');
    projects.forEach((project, index) => {
      const card = document.createElement('article'); card.className = 'media-project-card';
      card.append(projectImage(project, 'media-placeholder'));
      const copy = document.createElement('div'); copy.className = 'media-project-copy';
      copy.append(text('span', '', project.category), text('h3', '', project.title), text('p', '', project.description), tags(project.tags));
      configureProjectDetails(card, project, copy);
      card.append(copy); container.append(card); animateIn(card, index);
    });
  };

  const renderFeaturedProjects = (container, projects) => {
    container.replaceChildren();
    const orderedProjects = projects.filter((project) => project.homeFlagship === true).slice(0, 4);
    orderedProjects.forEach((project, index) => {
      const card = document.createElement('article'); card.className = 'project-card home-featured-card';
      card.dataset.category = projectCategoryKey(project);
      card.append(projectImage(project, 'project-visual'));
      const copy = document.createElement('div'); copy.className = 'project-content';
      copy.append(text('h3', '', project.title), text('p', '', project.description));
      const impact = document.createElement('div'); impact.className = 'project-impact';
      impact.append(text('span', '', 'Impact Metrics'), text('strong', '', project.impactMetric || project.category));
      copy.append(impact);
      const link = text('a', 'home-project-link', 'View project ↗');
      link.href = (project.link && safeLink(project.link)) || '/portfolio#media-work';
      if (project.link && safeLink(project.link)) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
      link.setAttribute('aria-label', `View ${project.title || 'project'}`);
      copy.append(link);
      const stack = tags(project.tags); stack.setAttribute('aria-label', 'Project technology and specialisms'); copy.append(stack);
      card.append(copy); container.append(card); animateIn(copy, index);
    });
  };

  try {
    const response = await fetch('/api/site-content', { cache: 'no-store' });
    if (!response.ok) return;
    const cms = await response.json();
    document.documentElement.dataset.theme = cms.settings?.theme || 'charcoal-orange';

    document.querySelectorAll('[data-cms]').forEach((element) => {
      const [page, key] = element.dataset.cms.split('.');
      const value = cms.documents?.[page]?.[key];
      if (typeof value === 'string') element.textContent = value;
    });

    const contact = cms.settings?.contact || {};
    document.querySelectorAll('[data-contact-value="email"]').forEach((element) => { element.textContent = contact.email || ''; });
    document.querySelectorAll('[data-contact-value="whatsapp"]').forEach((element) => { element.textContent = contact.whatsapp || ''; });
    const emailSubject = encodeURIComponent('Portfolio project enquiry');
    document.querySelectorAll('[data-contact-link="email"]').forEach((element) => { element.href = `mailto:${contact.email || ''}?subject=${emailSubject}`; });
    const whatsappDigits = String(contact.whatsapp || '').replace(/\D/g, '');
    const whatsappMessage = encodeURIComponent('Hello Bilal, I visited your portfolio and would like to discuss a project.');
    document.querySelectorAll('[data-contact-link="whatsapp"]').forEach((element) => { element.href = `https://wa.me/${whatsappDigits}?text=${whatsappMessage}`; });
    const contactForm = document.querySelector('#project-contact-form'); if (contactForm && contact.email) contactForm.dataset.recipient = contact.email;
    document.querySelectorAll('[data-social]').forEach((element) => {
      const url = safeLink(contact[element.dataset.social]);
      element.href = url || '#'; element.setAttribute('aria-disabled', url ? 'false' : 'true');
      if (url) { element.target = '_blank'; element.rel = 'noreferrer'; }
      element.addEventListener('click', (event) => { if (!url) event.preventDefault(); });
    });

    const images = cms.settings?.images || {};
    document.querySelectorAll('[data-image-key]').forEach((image) => { const value = images[image.dataset.imageKey]; if (value) image.src = value; });

    const collections = cms.collections || {};

    document.querySelectorAll('[data-cms-collection="services"]').forEach((container) => renderServices(container, collections.services || []));
    document.querySelectorAll('[data-cms-collection="awards"]').forEach((container) => renderAwards(container, collections.awards || []));
    document.querySelectorAll('[data-cms-collection="projects"]').forEach((container) => renderPortfolioProjects(container, collections.projects || []));
    document.querySelectorAll('[data-cms-collection="featured-projects"]').forEach((container) => renderFeaturedProjects(container, collections.projects || []));
    const fontSizes = cms.settings?.typography || {};
    applyFontSizes(fontSizes);
    let fontResizeTimer;
    window.addEventListener('resize', () => {
      window.clearTimeout(fontResizeTimer);
      fontResizeTimer = window.setTimeout(() => applyFontSizes(fontSizes), 160);
    }, { passive: true });
    window.dispatchEvent(new CustomEvent('portfolio:cms-ready', { detail: cms }));
  } catch {
    // Static page content remains available when the CMS endpoint is temporarily unavailable.
  }
})();
