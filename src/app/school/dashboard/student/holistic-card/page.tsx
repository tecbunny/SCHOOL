"use client";

import HPCViewer from '@/features/student-portal/HPCViewer';

export default function StudentHolisticCardPage() {
  return (
    <section className="min-h-screen bg-[#050505] p-10">
      <div className="max-w-[1400px] mx-auto h-[calc(100vh-5rem)]">
        <HPCViewer />
      </div>
    </section>
  );
}
