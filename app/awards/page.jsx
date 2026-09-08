import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Awards — Syed Bilal Faheem',
  description: 'Awards and achievements by Syed Bilal Faheem.'
};

export default function AwardsPage() {
  redirect('/#awards');
}
