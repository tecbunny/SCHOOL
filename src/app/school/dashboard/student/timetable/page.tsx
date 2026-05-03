"use client";

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, Clock, MapPin, RefreshCw, UserRound } from 'lucide-react';
import { analyticsService } from '@/services/analytics.service';
import { createClient } from '@/lib/supabase';

type TimetableSlot = {
  id: string;
  subject: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room?: string | null;
  teacher_id?: string | null;
};

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function StudentTimetablePage() {
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return days.includes(today) ? today : 'Monday';
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const loadTimetable = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('profiles')
          .select('school_id, class_id, full_name')
          .eq('id', user.id)
          .single();

        if (!data?.school_id) return;
        setProfile(data);

        const { data: weekSlots, error } = await supabase
          .from('timetable')
          .select('*')
          .eq('school_id', data.school_id)
          .eq('class_id', data.class_id || '10-A')
          .order('start_time', { ascending: true });

        if (error) {
          const todaySlots = await analyticsService.getTimetable(data.class_id || '10-A', data.school_id);
          setSlots(todaySlots);
          return;
        }

        setSlots(weekSlots || []);
      } finally {
        setLoading(false);
      }
    };

    loadTimetable();
  }, [supabase]);

  const visibleSlots = useMemo(
    () => slots.filter((slot) => slot.day_of_week === selectedDay),
    [selectedDay, slots]
  );

  return (
    <section className="min-h-screen bg-[#050505] text-white p-10">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-xs mb-3">
              <CalendarDays className="w-5 h-5" />
              Class timetable
            </div>
            <h1 className="text-4xl font-black">Weekly learning schedule</h1>
            <p className="text-muted mt-2">
              {profile?.class_id || 'Class'} periods, rooms, and teacher allocations in one view.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl px-6 py-4 text-right">
            <div className="text-[10px] text-muted font-black uppercase tracking-widest">Synced schedule</div>
            <div className="font-bold flex items-center gap-2 mt-1">
              <RefreshCw className="w-4 h-4 text-success" />
              Live from school desk
            </div>
          </div>
        </header>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-6 py-3 rounded-2xl border text-sm font-black transition-all ${
                selectedDay === day
                  ? 'bg-primary border-primary text-white'
                  : 'bg-white/5 border-white/10 text-muted hover:text-white'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {loading ? (
            <div className="xl:col-span-2 border border-white/10 bg-white/5 rounded-3xl p-10 text-muted">
              Loading timetable...
            </div>
          ) : visibleSlots.length > 0 ? (
            visibleSlots.map((slot) => (
              <article key={slot.id} className="bg-card border border-white/10 rounded-3xl p-6 flex items-center gap-6">
                <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center">
                  <Clock className="w-6 h-6 text-primary mb-2" />
                  <span className="text-xs font-black">{slot.start_time.slice(0, 5)}</span>
                  <span className="text-[10px] text-muted">{slot.end_time.slice(0, 5)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-black truncate">{slot.subject}</h2>
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-secondary" />
                      {slot.day_of_week}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-success" />
                      {slot.room || 'Room pending'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <UserRound className="w-4 h-4 text-warning" />
                      Teacher assigned
                    </span>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="xl:col-span-2 border border-dashed border-white/10 rounded-3xl p-12 text-center text-muted">
              No periods scheduled for {selectedDay}.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
