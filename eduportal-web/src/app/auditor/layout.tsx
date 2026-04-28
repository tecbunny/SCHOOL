import { ReactNode } from 'react';

export default function AuditorLayout({ children }: { children: ReactNode }) {
  return (
    <div data-theme="auditor">
      {children}
    </div>
  );
}
