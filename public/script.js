const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const updateHeader = () => {
  header?.classList.toggle('scrolled', window.scrollY > 18);
};
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuButton?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.classList.toggle('open', isOpen);
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});

const navLinks = [...document.querySelectorAll('.nav a')];
const cleanPath = (path) => path.replace(/\/+$/, '') || '/';
const currentPath = cleanPath(window.location.pathname);
const homeSectionIds = ['about', 'expertise', 'projects', 'services', 'experience', 'credentials', 'achievements'];
const activateNavLink = (activeLink) => {
  navLinks.forEach((link) => {
    const isActive = link === activeLink;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
};

const closeMobileNav = () => {
  nav?.classList.remove('open');
  menuButton?.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Open navigation');
};
const getHashTarget = (hash) => {
  if (!hash) return null;
  const id = decodeURIComponent(hash.replace(/^#/, ''));
  return document.getElementById(id);
};
const scrollToHash = (target, hash, replace = true) => {
  target?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  if (replace && hash) window.history.replaceState(null, '', hash);
};

navLinks.forEach((link) => {
  const url = new URL(link.getAttribute('href'), window.location.href);
  link.addEventListener('click', (event) => {
    const destination = new URL(link.getAttribute('href'), window.location.href);
    const isHomeDestination = cleanPath(destination.pathname) === '/' && destination.hash;
    const target = currentPath === '/' && isHomeDestination ? getHashTarget(destination.hash) : null;
    if (target) {
      event.preventDefault();
      scrollToHash(target, destination.hash);
      activateNavLink(link);
    }
    closeMobileNav();
  });
});

const routeLink = navLinks.find((link) => cleanPath(new URL(link.getAttribute('href'), window.location.href).pathname) === currentPath && !new URL(link.getAttribute('href'), window.location.href).hash);
if (currentPath !== '/' && routeLink) activateNavLink(routeLink);

if (currentPath === '/') {
  const sectionNavLinks = homeSectionIds.map((id) => ({ id, target: document.getElementById(id), link: navLinks.find((item) => new URL(item.getAttribute('href'), window.location.href).hash === `#${id}`) })).filter((item) => item.target && item.link);
  const homeLink = navLinks.find((link) => cleanPath(new URL(link.getAttribute('href'), window.location.href).pathname) === '/' && !new URL(link.getAttribute('href'), window.location.href).hash);
  let spyFrame = 0;
  const updateScrollSpy = () => {
    spyFrame = 0;
    const marker = window.scrollY + (header?.offsetHeight || 72) + 140;
    let active = null;
    sectionNavLinks.forEach((item) => { if (item.target.offsetTop <= marker) active = item; });
    activateNavLink(active?.link || homeLink);
  };
  const queueScrollSpy = () => { if (!spyFrame) spyFrame = requestAnimationFrame(updateScrollSpy); };
  window.addEventListener('scroll', queueScrollSpy, { passive: true });
  window.addEventListener('resize', queueScrollSpy, { passive: true });
  updateScrollSpy();
  if (window.location.hash) {
    window.setTimeout(() => scrollToHash(getHashTarget(window.location.hash), window.location.hash, false), 80);
  }
}

const counters = document.querySelectorAll('.counter');
const showCounterValue = (el) => {
  const target = Number(el.dataset.target || 0);
  const suffix = el.dataset.suffix || '';
  el.textContent = `${target}${suffix}`;
};
counters.forEach(showCounterValue);

const marqueeTrack = document.querySelector('.marquee-track');
if (marqueeTrack && !reducedMotion && !marqueeTrack.classList.contains('is-ready')) {
  const marqueeGroup = marqueeTrack.querySelector('.marquee-group');
  if (marqueeGroup) {
    const marqueeClone = marqueeGroup.cloneNode(true);
    marqueeClone.setAttribute('aria-hidden', 'true');
    marqueeTrack.append(marqueeClone);
    requestAnimationFrame(() => marqueeTrack.classList.add('is-ready'));
  }
}

const filterButtons = document.querySelectorAll('.filter-button');
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');

    document.querySelectorAll('.project-card').forEach((card) => {
      const categories = (card.dataset.category || '').split(' ');
      const show = filter === 'all' || categories.includes(filter);
      card.classList.toggle('hidden', !show);
    });
  });
});

const prepareProjectCards = () => {
  document.querySelectorAll('.project-card, .media-project-card').forEach((card) => {
    if (!card.dataset.projectTitle) card.dataset.projectTitle = card.querySelector('h3')?.textContent?.trim() || 'Project';
    if (!card.dataset.projectDetails) card.dataset.projectDetails = card.querySelector('p')?.textContent?.trim() || '';
    const existingLink = card.querySelector('a.project-link');
    if (existingLink?.href && !card.dataset.projectLink) card.dataset.projectLink = existingLink.href;
    if (card.querySelector('.project-detail-button')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'project-detail-button';
    button.textContent = 'View More';
    button.setAttribute('aria-label', `View full details for ${card.dataset.projectTitle}`);
    const copy = card.querySelector('.project-content, .media-project-copy');
    if (copy) copy.append(button);
  });
};

let projectDetailsDialog;
const ensureProjectDetailsDialog = () => {
  if (projectDetailsDialog) return projectDetailsDialog;
  const dialog = document.createElement('dialog');
  dialog.className = 'project-details-dialog';
  dialog.innerHTML = '<div class="project-details-dialog-inner"><button type="button" class="project-details-close" aria-label="Close project details">×</button><p class="project-details-kicker">Project Details</p><h2></h2><p class="project-details-copy"></p><a class="project-details-link" target="_blank" rel="noreferrer">View Project <span aria-hidden="true">↗</span></a></div>';
  dialog.querySelector('.project-details-close')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  document.body.append(dialog);
  projectDetailsDialog = dialog;
  return dialog;
};

document.addEventListener('click', (event) => {
  const button = event.target.closest('.project-detail-button');
  if (!button) return;
  const card = button.closest('.project-card, .media-project-card');
  if (!card) return;
  const dialog = ensureProjectDetailsDialog();
  dialog.querySelector('h2').textContent = card.dataset.projectTitle || 'Project';
  dialog.querySelector('.project-details-copy').textContent = card.dataset.projectDetails || 'More project information will be added soon.';
  const link = dialog.querySelector('.project-details-link');
  if (card.dataset.projectLink) {
    link.href = card.dataset.projectLink;
    link.hidden = false;
  } else {
    link.removeAttribute('href');
    link.hidden = true;
  }
  dialog.showModal();
});

prepareProjectCards();
window.addEventListener('portfolio:cms-ready', prepareProjectCards);

const toast = document.querySelector('.toast');
let toastTimer;
const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
};

document.querySelectorAll('.placeholder-action').forEach((button) => {
  button.addEventListener('click', () => showToast(button.dataset.message || 'This link is ready for your real contact details.'));
});

const projectContactForm = document.querySelector('#project-contact-form');
const quoteCategories = {
  software: 'Software Projects',
  data: 'Data Projects',
  ai: 'AI Solution Driven Projects',
  video: 'Video Editing Services'
};
const requestedCategory = new URLSearchParams(window.location.search).get('category');
if (projectContactForm && Object.hasOwn(quoteCategories, requestedCategory)) {
  projectContactForm.elements.projectType.value = quoteCategories[requestedCategory];
}
projectContactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!projectContactForm.reportValidity()) return;

  const formData = new FormData(projectContactForm);
  const recipient = projectContactForm.dataset.recipient || 'bilalfaheem47@gmail.com';
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const projectType = String(formData.get('projectType') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const message = String(formData.get('message') || '').trim();
  const subject = `Project enquiry — ${projectType}`;
  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Contact Number: ${phone}`,
    `Project Category: ${projectType}`,
    '',
    'Project Requirements & Quote Request:',
    message
  ].join('\n');

  showToast('Opening your prepared email draft…');
  window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

const yearNode = document.querySelector('#year');
if (yearNode) yearNode.textContent = new Date().getFullYear();

// Dedicated portfolio page: media filters + project lightbox.
const mediaFilterButtons = document.querySelectorAll('.portfolio-filter-button');
const mediaProjectCards = [...document.querySelectorAll('.media-project-card')];

mediaFilterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.mediaFilter;
    mediaFilterButtons.forEach((item) => item.classList.toggle('active', item === button));

    mediaProjectCards.forEach((card, index) => {
      const show = card.dataset.mediaCategory === filter;
      card.classList.toggle('is-filtered-out', !show);
      if (show) {
        card.classList.remove('filter-enter');
        // Force a reflow so the soft stagger animation can replay on filter change.
        void card.offsetWidth;
        card.style.animationDelay = `${Math.min(index * 45, 180)}ms`;
        card.classList.add('filter-enter');
      }
    });
  });
});

const portfolioLightbox = document.querySelector('#portfolio-lightbox');
const lightboxVisual = document.querySelector('#lightbox-visual');
const lightboxTitle = document.querySelector('#lightbox-title');
const lightboxDescription = document.querySelector('#lightbox-description');
let lastLightboxTrigger = null;

const openPortfolioLightbox = (trigger) => {
  if (!portfolioLightbox || !lightboxVisual || !lightboxTitle || !lightboxDescription) return;

  lastLightboxTrigger = trigger;
  const title = trigger.dataset.lightboxTitle || 'Project';
  const description = trigger.dataset.lightboxDescription || '';
  const type = trigger.dataset.lightboxType || 'placeholder';

  lightboxTitle.textContent = title;
  lightboxDescription.textContent = description;
  lightboxVisual.innerHTML = '';

  if (type === 'image' && trigger.dataset.lightboxImage) {
    const image = document.createElement('img');
    image.src = trigger.dataset.lightboxImage;
    image.alt = title;
    image.loading = 'eager';
    lightboxVisual.appendChild(image);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'lightbox-placeholder';
    const code = document.createElement('strong');
    code.textContent = trigger.dataset.lightboxCode || 'PROJECT';
    const label = document.createElement('span');
    label.textContent = 'Placeholder visual — replace through the future Admin Panel';
    placeholder.append(code, label);
    lightboxVisual.appendChild(placeholder);
  }

  portfolioLightbox.classList.add('open');
  portfolioLightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');
  setTimeout(() => portfolioLightbox.querySelector('.lightbox-close')?.focus(), 30);
};

const closePortfolioLightbox = () => {
  if (!portfolioLightbox) return;
  portfolioLightbox.classList.remove('open');
  portfolioLightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');
  lastLightboxTrigger?.focus();
};

document.querySelectorAll('[data-lightbox-title]').forEach((trigger) => {
  trigger.addEventListener('click', () => openPortfolioLightbox(trigger));
  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPortfolioLightbox(trigger);
    }
  });
});

document.querySelectorAll('[data-lightbox-close]').forEach((control) => {
  control.addEventListener('click', closePortfolioLightbox);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && portfolioLightbox?.classList.contains('open')) {
    closePortfolioLightbox();
  }
});
