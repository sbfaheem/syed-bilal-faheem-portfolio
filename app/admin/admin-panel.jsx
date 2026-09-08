'use client';

import { useEffect, useState } from 'react';

const pageDefinitions = {
  home: [
    ['heroEyebrow', 'Hero eyebrow'], ['cinematicName', 'Hero — name (white)'], ['cinematicBuilds', 'Hero — orange word'],
    ['cinematicAnalyzes', 'Hero — cyan word'], ['cinematicClosing', 'Hero — closing line (white)'], ['cinematicSubtitle', 'Hero subtitle'], ['featuredPrefix', 'Featured work heading — white'],
    ['featuredOrange', 'Featured work heading — orange'], ['featuredBlue', 'Featured work heading — blue'],
    ['ctaPrefix', 'Home CTA heading — white'], ['ctaOrange', 'Home CTA heading — orange'],
    ['ctaBlue', 'Home CTA heading — blue'], ['ctaBody', 'Home CTA client-benefit line']
  ],
  about: [
    ['kicker', 'Section label'], ['clientTitlePrefix', 'Heading — white'], ['clientTitleOrange', 'Heading — orange'],
    ['clientTitleBlue', 'Heading — blue'], ['clientLead', 'Client-benefit introduction'], ['body', 'Supporting paragraph']
  ],
  portfolio: [
    ['eyebrow', 'Hero eyebrow'], ['titlePrefix', 'Heading — white'], ['titleOrange', 'Heading — orange'],
    ['titleBlue', 'Heading — blue'], ['lead', 'Hero introduction']
  ],
  services: [
    ['scopeEyebrow', 'Hero eyebrow'], ['scopeTitlePrefix', 'Heading — white'], ['scopeTitleOrange', 'Heading — orange'],
    ['scopeTitleBlue', 'Heading — blue'], ['scopeLead', 'Hero introduction']
  ],
  contact: [
    ['eyebrow', 'Hero eyebrow'], ['titlePrefix', 'Heading — white'], ['titleOrange', 'Heading — orange'],
    ['titleBlue', 'Heading — blue'], ['quoteLead', 'Hero introduction'], ['quoteFormPrefix', 'Form heading — white'],
    ['quoteFormOrange', 'Form heading — orange'], ['quoteFormBlue', 'Form heading — blue'], ['quoteFormIntro', 'Form introduction']
  ]
};

const navItems = [
  ['overview', 'Overview'], ['pages', 'Page Text'], ['services', 'Services'], ['awards', 'Awards'],
  ['projects', 'Portfolio'], ['contact', 'Contact & Social'], ['images', 'Images'], ['typography', 'Font Size'],
  ['themes', 'Themes'], ['security', 'Security']
];

const fontSections = [
  ['navigation', 'Header navigation'],
  ['homeHero', 'Home — Hero'],
  ['homeStats', 'Home — Statistics'],
  ['homeAbout', 'Home — About'],
  ['homeExpertise', 'Home — Core Expertise'],
  ['homeClients', 'Home — Client Slider'],
  ['homeWork', 'Home — Selected Work'],
  ['homeExperience', 'Home — Experience'],
  ['homeToolkit', 'Home — Technical Toolkit'],
  ['homeCredentials', 'Home — Credentials'],
  ['homeMedia', 'Home — Creative Media'],
  ['homeStatement', 'Home — Statement'],
  ['homeContact', 'Home — Contact'],
  ['portfolioHero', 'Portfolio — Hero'],
  ['portfolioProjects', 'Portfolio — Creative Projects'],
  ['portfolioDashboards', 'Portfolio — Power BI'],
  ['portfolioEnterprise', 'Portfolio — Enterprise'],
  ['portfolioProducts', 'Portfolio — Digital Products'],
  ['portfolioContact', 'Portfolio — Contact'],
  ['servicesHero', 'Services — Hero'],
  ['servicesCatalog', 'Services — Service Cards'],
  ['servicesApproach', 'Services — Process'],
  ['servicesContact', 'Services — Contact'],
  ['awardsHero', 'Awards — Hero'],
  ['awardsTimeline', 'Awards — Timeline'],
  ['awardsContact', 'Awards — Contact'],
  ['contactHero', 'Let’s Talk — Hero'],
  ['contactForm', 'Let’s Talk — Form'],
  ['footer', 'Footer']
];

const themes = [
  { id: 'midnight-blue', name: 'Midnight Blue', colors: ['#07111f', '#48b5ff', '#9bd8ff'] },
  { id: 'charcoal-orange', name: 'Charcoal Orange', colors: ['#08080C', '#F97316', '#38BDF8'] },
  { id: 'slate-purple', name: 'Slate Purple', colors: ['#101019', '#a779ff', '#ff9f70'] },
  { id: 'emerald-dark', name: 'Emerald Dark', colors: ['#07120f', '#37d99a', '#8cdcff'] }
];

const imageSlots = [
  ['profile', 'Profile photo'], ['dashboardHr', 'HR dashboard thumbnail'], ['dashboardHr2025', 'HR 2024–2025 thumbnail'],
  ['dashboardSales', 'Sales forecast thumbnail'], ['dashboardStocks', 'Stock market thumbnail']
];

const isHomeFlagship = (item) => item.homeFlagship === true;

async function requestAdmin(payload, options = {}) {
  const response = await fetch('/api/admin', options.body instanceof FormData ? { method: 'POST', body: options.body } : {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Request failed.');
  return result;
}

function Field({ label, value, onChange, multiline = false, type = 'text', placeholder = '' }) {
  const Component = multiline ? 'textarea' : 'input';
  return <label className="admin-field"><span>{label}</span><Component type={multiline ? undefined : type} rows={multiline ? 4 : undefined} value={value ?? ''} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Status({ message }) {
  if (!message) return null;
  return <div className={`admin-status ${message.type}`}>{message.text}</div>;
}

function Login({ onSuccess, defaultCredentialsActive }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState(defaultCredentialsActive ? 'Admin@123' : '');
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setMessage(null);
    try { await requestAdmin({ action: 'login', username, password }); await onSuccess(); }
    catch (error) { setMessage({ type: 'error', text: error.message }); }
    finally { setBusy(false); }
  };

  return <main className="admin-login-shell">
    <section className="admin-login-card">
      <a className="admin-brand" href="/"><span>SB</span><strong>Portfolio Admin</strong></a>
      <p className="admin-kicker">Protected content management</p>
      <h1>Welcome back.</h1>
      <p>Sign in to edit every connected area of the portfolio.</p>
      {defaultCredentialsActive ? <div className="admin-credential-note"><strong>Testing credentials</strong><span>Username: <b>admin</b></span><span>Password: <b>Admin@123</b></span><small>Change this password immediately after your first login.</small></div> : <div className="admin-credential-note"><strong>Default password changed</strong><small>Use the private password you set in the Security section.</small></div>}
      <form onSubmit={submit} className="admin-login-form">
        <Field label="Username" value={username} onChange={setUsername} autoComplete="username" />
        <Field label="Password" type="password" value={password} onChange={setPassword} />
        <button className="admin-primary-button" disabled={busy}>{busy ? 'Signing in…' : 'Sign In'}</button>
      </form>
      <Status message={message} />
    </section>
  </main>;
}

export default function AdminPanel() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [data, setData] = useState(null);
  const [defaultCredentialsActive, setDefaultCredentialsActive] = useState(true);
  const [active, setActive] = useState('overview');
  const [message, setMessage] = useState(null);

  const load = async () => {
    setLoading(true);
    const response = await fetch('/api/admin', { cache: 'no-store' });
    const result = await response.json();
    if (response.status === 401) { setAuthenticated(false); setDefaultCredentialsActive(result.defaultCredentialsActive !== false); setLoading(false); return; }
    if (!response.ok) throw new Error(result.error || 'Unable to open the Admin Panel.');
    setData(result); setAuthenticated(true); setLoading(false);
  };

  useEffect(() => { load().catch((error) => { setMessage({ type: 'error', text: error.message }); setLoading(false); }); }, []);

  const notify = (text, type = 'success') => { setMessage({ text, type }); window.setTimeout(() => setMessage(null), 3200); };
  const saveDocument = async (page) => {
    await requestAdmin({ action: 'saveDocument', page, content: data.documents[page] }); notify(`${page[0].toUpperCase()}${page.slice(1)} text saved.`);
  };
  const saveCollection = async (collection) => {
    if (collection === 'projects' && data.collections.projects.filter(isHomeFlagship).length > 4) {
      notify('Select up to four homepage flagship projects.', 'error');
      return;
    }
    await requestAdmin({ action: 'saveCollection', collection, items: data.collections[collection] }); notify(`${collection[0].toUpperCase()}${collection.slice(1)} saved.`);
  };
  const saveSetting = async (key, value, success = 'Setting saved.') => {
    await requestAdmin({ action: 'saveSettings', key, value }); notify(success);
  };
  const updateDocument = (page, key, value) => setData((current) => ({ ...current, documents: { ...current.documents, [page]: { ...current.documents[page], [key]: value } } }));
  const updateSetting = (key, value) => setData((current) => ({ ...current, settings: { ...current.settings, [key]: value } }));
  const updateItem = (collection, index, key, value) => setData((current) => {
    const items = [...current.collections[collection]]; items[index] = { ...items[index], [key]: value };
    return { ...current, collections: { ...current.collections, [collection]: items } };
  });
  const addItem = (collection, seed) => setData((current) => ({ ...current, collections: { ...current.collections, [collection]: [...current.collections[collection], { id: `${collection}-${Date.now()}`, ...seed }] } }));
  const removeItem = (collection, index) => setData((current) => ({ ...current, collections: { ...current.collections, [collection]: current.collections[collection].filter((_, itemIndex) => itemIndex !== index) } }));
  const moveItem = (collection, index, direction) => setData((current) => {
    const items = [...current.collections[collection]];
    const target = index + direction;
    if (target < 0 || target >= items.length) return current;
    [items[index], items[target]] = [items[target], items[index]];
    return { ...current, collections: { ...current.collections, [collection]: items } };
  });
  const updateHomeFlagship = (index, checked) => {
    const projects = data.collections.projects;
    if (checked && !isHomeFlagship(projects[index]) && projects.filter(isHomeFlagship).length >= 4) {
      notify('Four flagship projects are already selected. Uncheck one before choosing another.', 'error');
      return;
    }
    updateItem('projects', index, 'homeFlagship', checked);
  };

  const upload = async (file, key) => {
    const form = new FormData(); form.append('action', 'upload'); form.append('key', key); form.append('file', file);
    const result = await requestAdmin(null, { body: form }); notify('Image uploaded.'); return result.url;
  };

  if (loading) return <div className="admin-loading">Loading Admin Panel…</div>;
  if (!authenticated) return <Login onSuccess={load} defaultCredentialsActive={defaultCredentialsActive} />;
  if (!data) return <div className="admin-loading">Unable to load Admin Panel.</div>;

  const logout = async () => { await requestAdmin({ action: 'logout' }); setAuthenticated(false); setData(null); };

  return <div className="admin-app">
    <aside className="admin-sidebar">
      <a className="admin-brand" href="/"><span>SB</span><div><strong>Portfolio Admin</strong><small>Content control center</small></div></a>
      <nav>{navItems.map(([id, label]) => <button key={id} className={active === id ? 'active' : ''} onClick={() => setActive(id)}>{label}</button>)}</nav>
      <div className="admin-sidebar-bottom"><a href="/" target="_blank">View Website ↗</a><button onClick={logout}>Sign Out</button></div>
    </aside>

    <main className="admin-main">
      <header className="admin-topbar"><div><p>Signed in as {data.username}</p><h1>{navItems.find(([id]) => id === active)?.[1]}</h1></div><span className="admin-live-badge"><i></i> Live CMS</span></header>
      <Status message={message} />

      {active === 'overview' && <section className="admin-section">
        {data.mustChangePassword && <div className="admin-warning"><strong>Security reminder</strong><p>You are using the default password <b>Admin@123</b>. Open Security and change it before public launch.</p></div>}
        <div className="admin-stat-grid">
          <article><span>Pages</span><strong>{Object.keys(data.documents).length}</strong><p>Editable content areas</p></article>
          <article><span>Services</span><strong>{data.collections.services.length}</strong><p>Active service cards</p></article>
          <article><span>Awards</span><strong>{data.collections.awards.length}</strong><p>Published achievements</p></article>
          <article><span>Projects</span><strong>{data.collections.projects.length}</strong><p>Portfolio entries</p></article>
        </div>
        <div className="admin-card"><p className="admin-kicker">How publishing works</p><h2>Save once. Update everywhere.</h2><p>Every Save button writes directly to the live content database. Public pages load the newest saved text, collections, contact details, images and theme automatically.</p></div>
      </section>}

      {active === 'pages' && <section className="admin-section admin-editor-stack">
        {Object.entries(pageDefinitions).map(([page, fields]) => <article className="admin-card" key={page}>
          <div className="admin-card-heading"><div><p className="admin-kicker">Page content</p><h2>{page[0].toUpperCase()}{page.slice(1)}</h2></div><button className="admin-save-button" onClick={() => saveDocument(page)}>Save {page}</button></div>
          <div className="admin-form-grid">{fields.map(([key, label]) => <Field key={key} label={label} value={data.documents[page]?.[key]} multiline={['scopeLead','quoteLead','quoteFormIntro','heroClientLead','clientLead','ctaBody','lead','body','formIntro'].includes(key)} onChange={(value) => updateDocument(page, key, value)} />)}</div>
        </article>)}
      </section>}

      {active === 'services' && <CollectionSection title="Services" onSave={() => saveCollection('services')} onAdd={() => addItem('services', { title: 'New Service', category: 'Creative Service', description: '', price: '$0', unit: 'per project', icon: '✦' })}>
        {data.collections.services.map((item, index) => <ItemCard key={item.id} title={item.title} onRemove={() => removeItem('services', index)}>
          <Field label="Service name" value={item.title} onChange={(value) => updateItem('services', index, 'title', value)} />
          <Field label="Category" value={item.category} onChange={(value) => updateItem('services', index, 'category', value)} />
          <Field label="Description" multiline value={item.description} onChange={(value) => updateItem('services', index, 'description', value)} />
          <Field label="Starting price" value={item.price} onChange={(value) => updateItem('services', index, 'price', value)} />
          <Field label="Price unit" value={item.unit} onChange={(value) => updateItem('services', index, 'unit', value)} />
          <Field label="Icon text" value={item.icon} onChange={(value) => updateItem('services', index, 'icon', value)} />
        </ItemCard>)}
      </CollectionSection>}

      {active === 'awards' && <CollectionSection title="Awards & Achievements" onSave={() => saveCollection('awards')} onAdd={() => addItem('awards', { title: 'New Achievement', year: new Date().getFullYear().toString(), issuer: '', description: '', impact: '' })}>
        {data.collections.awards.map((item, index) => <ItemCard key={item.id} title={item.title} onRemove={() => removeItem('awards', index)}>
          <Field label="Award name" value={item.title} onChange={(value) => updateItem('awards', index, 'title', value)} />
          <Field label="Year" value={item.year} onChange={(value) => updateItem('awards', index, 'year', value)} />
          <Field label="Awarded by" value={item.issuer} onChange={(value) => updateItem('awards', index, 'issuer', value)} />
          <Field label="Description" multiline value={item.description} onChange={(value) => updateItem('awards', index, 'description', value)} />
          <Field label="Why it matters" multiline value={item.impact} onChange={(value) => updateItem('awards', index, 'impact', value)} />
        </ItemCard>)}
      </CollectionSection>}

      {active === 'projects' && <CollectionSection title="Portfolio Projects & Homepage Flagships" onSave={() => saveCollection('projects')} onAdd={() => addItem('projects', { title: 'New Project', category: 'AI & Web Projects', description: '', details: '', tags: '', imageUrl: '', link: '', homeFlagship: false })}>
        <div className="admin-flagship-summary"><strong>{data.collections.projects.filter(isHomeFlagship).length} of 4 selected</strong><span>Check “Homepage flagship” on up to four projects. Their order here controls their order on the homepage. Names, short descriptions, impact metrics, thumbnails and links are shared with the full Portfolio page. Save all to publish your selection.</span></div>
        {data.collections.projects.map((item, index) => <ItemCard key={item.id} title={item.title} onRemove={() => removeItem('projects', index)} onMoveUp={() => moveItem('projects', index, -1)} onMoveDown={() => moveItem('projects', index, 1)} disableUp={index === 0} disableDown={index === data.collections.projects.length - 1}>
          <Field label="Project name" value={item.title} onChange={(value) => updateItem('projects', index, 'title', value)} />
          <Field label="Category" value={item.category} placeholder="Middle East & GCC, Video Editing & Media, Power BI, or AI & Web Projects" onChange={(value) => updateItem('projects', index, 'category', value)} />
          <Field label="Short card description" multiline value={item.description} onChange={(value) => updateItem('projects', index, 'description', value)} />
          <Field label="Impact metric or outcome" value={item.impactMetric || ''} placeholder="Enterprise Scale — use only verified figures" onChange={(value) => updateItem('projects', index, 'impactMetric', value)} />
          <Field label="Full project details" multiline value={item.details || ''} onChange={(value) => updateItem('projects', index, 'details', value)} />
          <Field label="Tags (comma separated)" value={item.tags} onChange={(value) => updateItem('projects', index, 'tags', value)} />
          <Field label="Project link" value={item.link} onChange={(value) => updateItem('projects', index, 'link', value)} />
          <Field label="Thumbnail URL" value={item.imageUrl} onChange={(value) => updateItem('projects', index, 'imageUrl', value)} />
          <label className="admin-upload-field"><span>Upload thumbnail</span><input type="file" accept="image/*" onChange={async (event) => { const file = event.target.files?.[0]; if (file) updateItem('projects', index, 'imageUrl', await upload(file, `project-${item.id}`)); }} /></label>
          <label className="admin-checkbox"><input type="checkbox" checked={isHomeFlagship(item)} disabled={!isHomeFlagship(item) && data.collections.projects.filter(isHomeFlagship).length >= 4} onChange={(event) => updateHomeFlagship(index, event.target.checked)} /><span>Homepage flagship (maximum 4)</span></label>
        </ItemCard>)}
      </CollectionSection>}

      {active === 'contact' && <section className="admin-section"><article className="admin-card">
        <div className="admin-card-heading"><div><p className="admin-kicker">Global details</p><h2>Contact & Social</h2></div><button className="admin-save-button" onClick={() => saveSetting('contact', data.settings.contact, 'Contact details saved.')}>Save contact</button></div>
        <div className="admin-form-grid">
          <Field label="Email" type="email" value={data.settings.contact.email} onChange={(value) => updateSetting('contact', { ...data.settings.contact, email: value })} />
          <Field label="WhatsApp number" value={data.settings.contact.whatsapp} onChange={(value) => updateSetting('contact', { ...data.settings.contact, whatsapp: value })} />
          <Field label="Instagram profile URL" value={data.settings.contact.instagram} placeholder="https://instagram.com/yourprofile" onChange={(value) => updateSetting('contact', { ...data.settings.contact, instagram: value })} />
          <Field label="YouTube channel URL" value={data.settings.contact.youtube} placeholder="https://youtube.com/@yourchannel" onChange={(value) => updateSetting('contact', { ...data.settings.contact, youtube: value })} />
        </div>
      </article></section>}

      {active === 'images' && <section className="admin-section"><article className="admin-card">
        <div className="admin-card-heading"><div><p className="admin-kicker">Vercel Blob image storage</p><h2>Website Images</h2></div><button className="admin-save-button" onClick={() => saveSetting('images', data.settings.images, 'Image assignments saved.')}>Save image assignments</button></div>
        <div className="admin-image-grid">{imageSlots.map(([key, label]) => <div className="admin-image-card" key={key}>
          <div className="admin-image-preview">{data.settings.images[key] ? <img src={data.settings.images[key]} alt="" /> : <span>No image</span>}</div>
          <Field label={label} value={data.settings.images[key]} onChange={(value) => updateSetting('images', { ...data.settings.images, [key]: value })} />
          <label className="admin-upload-field"><span>Upload replacement</span><input type="file" accept="image/*" onChange={async (event) => { const file = event.target.files?.[0]; if (file) updateSetting('images', { ...data.settings.images, [key]: await upload(file, key) }); }} /></label>
        </div>)}</div>
      </article></section>}

      {active === 'typography' && <section className="admin-section"><article className="admin-card">
        <div className="admin-card-heading"><div><p className="admin-kicker">Section-by-section readability</p><h2>Font Size</h2></div><button className="admin-save-button" onClick={() => saveSetting('typography', data.settings.typography, 'Font sizes are now live.')}>Save font sizes</button></div>
        <p className="admin-typography-note">Increase text independently in every section. These controls change only font size; the website’s font family and styling stay unchanged.</p>
        <div className="admin-font-grid">{fontSections.map(([key, label]) => {
          const value = Number(data.settings.typography?.[key] ?? 0);
          return <label className="admin-font-control" key={key}>
            <span><strong>{label}</strong><b>{value === 0 ? 'Default' : `+${value}px`}</b></span>
            <input type="range" min="0" max="10" step="1" value={value} onChange={(event) => updateSetting('typography', { ...data.settings.typography, [key]: Number(event.target.value) })} />
          </label>;
        })}</div>
        <div className="admin-font-actions"><button className="admin-secondary-button" onClick={() => updateSetting('typography', Object.fromEntries(fontSections.map(([key]) => [key, 0])))}>Reset all to default</button><span>Available increase: 0–10 pixels per section</span></div>
      </article></section>}

      {active === 'themes' && <section className="admin-section"><article className="admin-card">
        <div className="admin-card-heading"><div><p className="admin-kicker">Whole-site appearance</p><h2>Color Theme</h2></div></div>
        <div className="admin-theme-grid">{themes.map((theme) => <button key={theme.id} className={data.settings.theme === theme.id ? 'active' : ''} onClick={async () => { updateSetting('theme', theme.id); await saveSetting('theme', theme.id, `${theme.name} is now live.`); }}>
          <span className="theme-swatches">{theme.colors.map((color) => <i key={color} style={{ background: color }} />)}</span><strong>{theme.name}</strong><small>{data.settings.theme === theme.id ? 'Current live theme' : 'Select theme'}</small>
        </button>)}</div>
      </article></section>}

      {active === 'security' && <SecuritySection onChanged={() => { setAuthenticated(false); setData(null); }} notify={notify} />}
    </main>
  </div>;
}

function CollectionSection({ title, onSave, onAdd, children }) {
  return <section className="admin-section"><div className="admin-collection-toolbar"><div><p className="admin-kicker">Live collection</p><h2>{title}</h2></div><div><button className="admin-secondary-button" onClick={onAdd}>+ Add new</button><button className="admin-save-button" onClick={onSave}>Save all</button></div></div><div className="admin-editor-stack">{children}</div></section>;
}

function ItemCard({ title, onRemove, onMoveUp, onMoveDown, disableUp, disableDown, children }) {
  return <article className="admin-card"><div className="admin-item-heading"><h3>{title}</h3><div className="admin-item-actions">{onMoveUp && <button type="button" disabled={disableUp} onClick={onMoveUp} aria-label={`Move ${title} up`}>↑ Up</button>}{onMoveDown && <button type="button" disabled={disableDown} onClick={onMoveDown} aria-label={`Move ${title} down`}>↓ Down</button>}<button type="button" className="admin-remove-button" onClick={onRemove}>Remove</button></div></div><div className="admin-form-grid">{children}</div></article>;
}

function SecuritySection({ onChanged, notify }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) { notify('New passwords do not match.', 'error'); return; }
    try { await requestAdmin({ action: 'changePassword', currentPassword, newPassword }); notify('Password changed. Sign in again.'); window.setTimeout(onChanged, 900); }
    catch (error) { notify(error.message, 'error'); }
  };
  return <section className="admin-section"><article className="admin-card admin-security-card"><p className="admin-kicker">Account security</p><h2>Change Admin Password</h2><p>Choose a unique password containing at least 10 characters. Changing it signs out every active Admin Panel session.</p><form onSubmit={submit} className="admin-form-grid"><Field type="password" label="Current password" value={currentPassword} onChange={setCurrentPassword} /><Field type="password" label="New password" value={newPassword} onChange={setNewPassword} /><Field type="password" label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} /><button className="admin-primary-button">Change Password</button></form></article></section>;
}
