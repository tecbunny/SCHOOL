import { ReactNode } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-layout">
      <AdminSidebar />
      <main className="flex flex-col h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
