import { ReactNode } from 'react';

export default function SchoolLayout({ children }: { children: ReactNode }) {
  return (
    <div data-theme="school">
      {children}
    </div>
  );
}
