import TimetableManager from '@/features/school-operations/TimetableManager';

export default function TeacherTimetablePage() {
  return (
    <section className="min-h-screen bg-[#050505] text-white p-10">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
        <header>
          <h1 className="text-4xl font-black">Staff Timetable Management</h1>
          <p className="text-muted mt-2">Manage class periods, assignments, and substitutions in real-time.</p>
        </header>

        <TimetableManager />
      </div>
    </section>
  );
}
