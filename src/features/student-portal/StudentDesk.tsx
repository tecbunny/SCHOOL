"use client";

import { 
  Calendar, 
  Megaphone, 
  Clock, 
  BookOpen,
  Sparkles,
  Headphones,
  Layers,
  ListChecks,
  MonitorPlay,
  Loader2
} from 'lucide-react';

import { useState, useEffect } from 'react';
import { analyticsService } from '@/services/analytics.service';
import { createClient } from '@/lib/supabase';

export default function StudentDesk() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [generations, setGenerations] = useState<any[]>([]);
  const [studioPrompt, setStudioPrompt] = useState('');
  const [studioType, setStudioType] = useState('flashcards');
  const [studioBusy, setStudioBusy] = useState(false);
  const [studioError, setStudioError] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadGenerations = async () => {
    const res = await fetch('/api/studio/generations?limit=6', { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    setGenerations(data.generations ?? []);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('school_id, class_id')
          .eq('id', user.id)
          .single();

        if (profile) {
          const [annData, timeData] = await Promise.all([
            analyticsService.getAnnouncements(profile.school_id),
            analyticsService.getTimetable(profile.class_id || '10-A', profile.school_id)
          ]);
          setAnnouncements(annData);
          setTimetable(timeData);
          await loadGenerations();
        }
      } catch (err) {
        console.error("Fetch Student Desk Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [supabase]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void loadGenerations();
    }, 15000);
    return () => window.clearInterval(interval);
  }, []);

  const requestStudioGeneration = async () => {
    const prompt = studioPrompt.trim();
    if (prompt.length < 10) {
      setStudioError('Add a little more detail before sending this to Studio.');
      return;
    }

    setStudioBusy(true);
    setStudioError('');
    try {
      const res = await fetch('/api/studio/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generationType: studioType,
          prompt,
          inputPayload: {
            source: 'student_desk',
            requested_at: new Date().toISOString()
          }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Studio request failed.');
      setStudioPrompt('');
      setGenerations((current) => [data.generation, ...current].slice(0, 6));
    } catch (err) {
      setStudioError(err instanceof Error ? err.message : 'Studio request failed.');
    } finally {
      setStudioBusy(false);
    }
  };

  const currentSession = timetable.find(s => {
    const now = new Date();
    const [h, m] = s.start_time.split(':');
    const startTime = new Date();
    startTime.setHours(h, m, 0);
    const [eh, em] = s.end_time.split(':');
    const endTime = new Date();
    endTime.setHours(eh, em, 0);
    return now >= startTime && now <= endTime;
  }) || timetable[0]; // Fallback to first if none active

  return (
    <div className="grid grid-cols-12 gap-6 h-full p-2">
      
      {/* Current Session Widget */}
      <div className="col-span-8 bg-gradient-to-br from-primary/20 to-secondary/10 border border-white/10 rounded-[2rem] p-8 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all duration-700 rotate-12">
            <Sparkles className="w-48 h-48" />
         </div>
         
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
               <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                  <Clock className="w-6 h-6 text-primary" />
               </div>
               <span className="text-sm font-bold uppercase tracking-widest text-primary/80">Ongoing Session</span>
            </div>
            
            <h2 className="text-4xl font-black text-white mb-2">
              {loading ? "Loading schedule..." : currentSession?.subject || "Independent Study"}
            </h2>
            <p className="text-lg text-muted mb-8">
              {loading ? "Syncing today's timetable" : currentSession ? `Room ${currentSession.room}` : "No scheduled classes at this time"}
            </p>
            
            <div className="flex gap-4">
               <button className="bg-white text-black px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl">
                  Open Session Notes
               </button>
               <button className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all">
                  Join Chat
               </button>
            </div>
         </div>
      </div>

      {/* Announcements Widget */}
      <div className="col-span-4 bg-card border border-white/5 rounded-[2rem] p-6 flex flex-col">
         <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
               <Megaphone className="w-5 h-5 text-secondary" />
               <h3 className="font-bold text-lg">Announcements</h3>
            </div>
            <span className="text-xs text-muted">View All</span>
         </div>
         
         <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar">
            {announcements.length > 0 ? announcements.map((item) => (
               <div key={item.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-secondary/30 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-1">
                     <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${item.priority === 'high' ? 'bg-danger/20 text-danger' : 'bg-secondary/20 text-secondary'}`}>
                        {item.priority}
                     </span>
                     <span className="text-[10px] text-muted">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="font-bold text-white group-hover:text-secondary transition-colors">{item.title}</div>
               </div>
            )) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted text-center p-8">
                <Megaphone className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">No New Announcements</p>
              </div>
            )}
         </div>
      </div>

      {/* Timetable Horizontal List */}
      <div className="col-span-12 bg-white/[0.02] border border-white/5 rounded-[2rem] p-6">
         <div className="flex items-center gap-3 mb-6 px-2">
            <Calendar className="w-5 h-5 text-muted" />
            <h3 className="font-bold">Today's Schedule</h3>
         </div>
         
         <div className="grid grid-cols-4 gap-4">
            {timetable.length > 0 ? timetable.map((slot, i) => (
               <div key={i} className={`p-6 rounded-3xl border transition-all ${slot === currentSession ? 'bg-primary/10 border-primary shadow-lg scale-105' : 'bg-white/5 border-white/5'}`}>
                  <div className="text-xs font-bold text-muted mb-1">{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</div>
                  <div className={`text-lg font-bold ${slot === currentSession ? 'text-primary' : 'text-white'}`}>{slot.subject}</div>
                  <div className="text-xs text-muted mt-2 flex items-center gap-1">
                     <BookOpen className="w-3 h-3" /> {slot.room}
                  </div>
               </div>
            )) : (
              <div className="col-span-4 p-8 rounded-3xl border border-dashed border-white/10 flex items-center justify-center text-muted text-sm italic">
                No classes scheduled for today
              </div>
            )}
            {timetable.length > 0 && (
              <div className="p-6 rounded-3xl border border-dashed border-white/10 flex items-center justify-center text-muted text-sm italic">
                 End of Day
              </div>
            )}
         </div>
      </div>

      <div className="col-span-12 bg-card border border-white/10 rounded-[2rem] p-6">
         <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-[42%] flex flex-col gap-5">
               <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary p-3 rounded-2xl">
                     <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                     <h3 className="font-bold text-xl text-white">Studio</h3>
                     <p className="text-sm text-muted">Create learning assets through the Class Station queue.</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'flashcards', label: 'Flashcards', icon: Layers },
                    { id: 'quiz', label: 'Quiz', icon: ListChecks },
                    { id: 'audio_overview', label: 'Audio', icon: Headphones },
                    { id: 'slide_deck', label: 'Slides', icon: MonitorPlay }
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setStudioType(item.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-bold transition-all ${
                          studioType === item.id
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white/5 text-muted border-white/5 hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    );
                  })}
               </div>

               <textarea
                 value={studioPrompt}
                 onChange={(event) => setStudioPrompt(event.target.value)}
                 placeholder="Paste notes or describe the topic..."
                 className="min-h-32 resize-none bg-black/20 border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-primary transition-all"
               />

               {studioError && <div className="text-sm text-danger font-bold">{studioError}</div>}

               <button
                 type="button"
                 onClick={requestStudioGeneration}
                 disabled={studioBusy}
                 className="inline-flex items-center justify-center gap-3 bg-white text-black px-6 py-4 rounded-2xl font-bold hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
               >
                 {studioBusy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                 Queue Studio Asset
               </button>
            </div>

            <div className="flex-1">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-white">Recent Studio Jobs</h3>
                  <button
                    type="button"
                    onClick={() => void loadGenerations()}
                    className="text-xs font-bold uppercase tracking-widest text-primary"
                  >
                    Refresh
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {generations.length > 0 ? generations.map((job) => (
                    <div key={job.id} className="border border-white/5 bg-white/[0.03] rounded-2xl p-4">
                       <div className="flex items-center justify-between gap-3 mb-3">
                          <span className="text-xs font-bold uppercase tracking-widest text-muted">
                             {String(job.generation_type).replaceAll('_', ' ')}
                          </span>
                          <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                            job.status === 'completed'
                              ? 'bg-success/10 text-success'
                              : job.status === 'failed'
                                ? 'bg-danger/10 text-danger'
                                : 'bg-warning/10 text-warning'
                          }`}>
                             {job.status}
                          </span>
                       </div>
                       <p className="text-sm text-white line-clamp-2">{job.prompt}</p>
                       <div className="text-[11px] text-muted mt-3">
                          {new Date(job.created_at).toLocaleString()}
                       </div>
                    </div>
                  )) : (
                    <div className="md:col-span-2 border border-dashed border-white/10 rounded-2xl p-8 text-center text-sm text-muted">
                      Studio jobs will appear here after they are queued.
                    </div>
                  )}
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}
