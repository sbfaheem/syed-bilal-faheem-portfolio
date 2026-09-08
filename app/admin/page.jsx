import AdminPanel from './admin-panel';

export const metadata = {
  title: 'Admin Panel — Syed Bilal Portfolio',
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return <AdminPanel />;
}
