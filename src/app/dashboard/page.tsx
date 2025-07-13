import type { Metadata } from 'next';

import DashboardContent from '@/app/dashboard/DashboardContent';

export const metadata: Metadata = {
  title: 'Dashboard | Game Diary',
  description: 'Your personal game diary dashboard',
};

export default function DashboardPage() {
  return <DashboardContent />;
}
