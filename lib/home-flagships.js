// The selection is a saved setting, independent of the full portfolio collection.
export function normalizeHomeFlagships(projects, selectedIds = []) {
  const selected = new Set(selectedIds.slice(0, 4));
  return projects.map((project) => ({ ...project, homeFlagship: selected.has(project.id) }));
}

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const safeUrl = (value) => {
  if (!value) return '';
  try {
    const parsed = new URL(value, 'https://portfolio.invalid');
    return ['https:', 'http:'].includes(parsed.protocol) ? value : '';
  } catch { return ''; }
};

export function renderHomeFlagships(projects) {
  return projects.filter((project) => project.homeFlagship === true).slice(0, 4).map((project) => {
    const image = safeUrl(project.imageUrl);
    const link = safeUrl(project.link);
    const badges = String(project.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
    return `<article class="project-card home-featured-card"><div class="project-visual">${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(project.title)} thumbnail" loading="lazy">` : ''}</div><div class="project-content"><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.description)}</p><div class="project-impact"><span>Impact Metrics</span><strong>${escapeHtml(project.impactMetric || project.category)}</strong></div><a class="home-project-link" href="${escapeHtml(link || '/portfolio#media-work')}"${link ? ' target="_blank" rel="noopener noreferrer"' : ''} aria-label="View ${escapeHtml(project.title)}">View project ↗</a><div class="tag-row" aria-label="Project technology and specialisms">${badges}</div></div></article>`;
  }).join('');
}
