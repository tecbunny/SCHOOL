"use client";

import { ReactNode } from 'react';

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <div data-theme="admin">
      {children}
    </div>
  );
}
