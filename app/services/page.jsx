import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Services — Syed Bilal Faheem',
  description: 'Software, data, AI and video editing services by Syed Bilal Faheem.'
};

export default function ServicesPage() {
  redirect('/#services');
}
