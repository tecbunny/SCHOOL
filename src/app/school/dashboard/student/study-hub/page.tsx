"use client";

import StudyHub from '@/features/student-portal/StudyHub';

export default function StudentStudyHubPage() {
  return (
    <section className="min-h-screen bg-[#050505] p-10">
      <div className="max-w-[1400px] mx-auto h-[calc(100vh-5rem)]">
        <StudyHub />
      </div>
    </section>
  );
}
