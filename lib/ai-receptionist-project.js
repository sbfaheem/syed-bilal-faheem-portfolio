// Initial portfolio entry. After the one-time import, the Admin Panel owns it.
export const aiReceptionistProject = {
  id: 'ai-receptionist-dental-booking',
  title: 'AI Receptionist — Patient Intake & Booking',
  category: 'AI & Web Projects',
  description: 'What Happens to a $20,000 Invisalign Lead After 8 PM?',
  details: 'What Happens to a $20,000 Invisalign Lead After 8 PM?\n\nTo solve this, we developed a dedicated patient intake and booking system designed specifically to capture every single inquiry that was previously slipping through.\n\nThe system handles incoming patient calls 24/7 in natural, fluent English and Arabic. It answers clinic questions, routes cases according to your specialist roster, qualifies treatment intent, and logs consultation requests directly into your calendar in real time.',
  tags: 'ElevenLabs, Voice AI, English & Arabic, Appointment Booking',
  imageUrl: '/assets/projects/ai-receptionist.svg',
  link: 'https://elevenlabs.io/app/talk-to?agent_id=agent_7601m39hqvy9fxss6jdnaj1nhg41&branch_id=agtbrch_1901m39hqvyae4qr938457jtwpf8',
  impactMetric: '24/7 patient intake · English & Arabic',
  featured: true,
  homeFlagship: false
};

const releaseKey = 'contentReleaseAiReceptionistV1';

export async function ensureAiReceptionistRelease(DB) {
  const released = await DB.prepare('SELECT value FROM cms_settings WHERE key = ?').bind(releaseKey).first();
  if (released) return;
  const now = Date.now();

  // Serialize the first import with collection writes. Calculate the next
  // position inside the transaction; never replace an existing project or
  // restore this entry after an administrator has edited or deleted it.
  await DB.batch([
    DB.prepare('LOCK TABLE cms_collection_items IN SHARE ROW EXCLUSIVE MODE'),
    DB.prepare(`
      INSERT INTO cms_collection_items (collection, id, position, data, updated_at)
      SELECT 'projects', ?, COALESCE(MAX(position), -1) + 1, ?, ?
      FROM cms_collection_items WHERE collection = 'projects'
      HAVING NOT EXISTS (SELECT 1 FROM cms_settings WHERE key = ?)
      ON CONFLICT (collection, id) DO NOTHING
    `).bind(aiReceptionistProject.id, JSON.stringify(aiReceptionistProject), now, releaseKey),
    DB.prepare('INSERT INTO cms_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO NOTHING')
      .bind(releaseKey, JSON.stringify(true), now)
  ]);
}
