import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div data-theme="admin">
      {children}
    </div>
  );
}
