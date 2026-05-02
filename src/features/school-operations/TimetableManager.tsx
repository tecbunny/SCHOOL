"use client";

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  RefreshCw, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  Search, 
  Loader2,
  ArrowRightLeft
} from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function TimetableManager() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubstitutionMode, setIsSubstitutionMode] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSubstitutes, setAvailableSubstitutes] = useState<any[]>([]);
  const supabase = createClient();

  const suggestSubstitutes = async (slotStartTime: string) => {
    setLoading(true);
    const { data: teachers } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'teacher');

    const { data: activeSchedules } = await supabase
      .from('timetable')
      .select('teacher_id')
      .eq('start_time', slotStartTime);

    const busyTeacherIds = new Set(activeSchedules?.map((s: any) => s.teacher_id));
    const available = teachers?.filter((t: any) => !busyTeacherIds.has(t.id)) || [];
    setAvailableSubstitutes(available);
    setLoading(false);
  };

  useEffect(() => {
    const fetchSchedules = async () => {
      const { data, error } = await supabase
        .from('timetable')
        .select('*')
        .order('start_time', { ascending: true });
      
      if (!error) setSchedules(data);
      setLoading(false);
    };

    fetchSchedules();

    // Subscribe to real-time changes to update student views instantly
    const channel = supabase
      .channel('timetable-global')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timetable' }, fetchSchedules)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSubstitution = async (scheduleId: string, newTeacherId: string) => {
    if (!newTeacherId) return;
    
    const { error } = await supabase
      .from('timetable')
      .update({ teacher_id: newTeacherId })
      .eq('id', scheduleId);

    if (!error) {
      setSelectedSlot(null);
      setAvailableSubstitutes([]);
    }
  };

  return (
    <div className="bg-card border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-8 shadow-2xl overflow-hidden relative group">
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-secondary/20 p-2 rounded-xl">
             <Calendar className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="font-black text-lg">Smart Timetable Manager</h3>
            <p className="text-xs text-muted">Conflict-aware scheduling & substitution hub.</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setIsSubstitutionMode(!isSubstitutionMode)}
             className={`btn btn-sm gap-2 ${isSubstitutionMode ? 'btn-secondary' : 'btn-outline border-white/10'}`}
           >
              <Users className="w-4 h-4" />
              {isSubstitutionMode ? 'Exit Sub Mode' : 'Substitution Mode'}
           </button>
           <button className="btn btn-primary btn-sm gap-2">
              <Plus className="w-4 h-4" /> Add Period
           </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
         {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
           <div key={day} className="text-center text-[10px] font-black text-muted uppercase tracking-widest pb-2 border-b border-white/5">
              {day}
           </div>
         ))}
      </div>

      <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
         {loading ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
         ) : schedules.map((slot) => (
           <div key={slot.id} className="p-5 bg-white/5 border border-white/5 rounded-3xl hover:border-secondary/20 transition-all flex items-center justify-between group">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 rounded-2xl bg-white/5 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold text-muted">{slot.start_time.slice(0, 5)}</span>
                    <span className="text-xs font-black text-white">{slot.subject.slice(0, 3).toUpperCase()}</span>
                 </div>
                 <div>
                    <div className="text-lg font-bold text-white group-hover:text-secondary transition-colors">{slot.subject}</div>
                    <div className="flex items-center gap-4 text-[10px] text-muted font-bold uppercase tracking-widest mt-1">
                       <span className="flex items-center gap-1.5"><User className="w-3 h-3 text-secondary" /> Teacher assigned</span>
                       <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {slot.room || 'Room pending'}</span>
                    </div>
                 </div>
              </div>
              
              {isSubstitutionMode && (
                <div className="flex flex-col gap-2">
                   {selectedSlot === slot.id ? (
                     <div className="flex flex-col gap-2">
                        <select 
                          className="bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-secondary transition-all"
                          onChange={(e) => handleSubstitution(slot.id, e.target.value)}
                          defaultValue=""
                        >
                           <option value="" disabled>Select Substitute</option>
                           {availableSubstitutes.map(teacher => (
                             <option key={teacher.id} value={teacher.id} className="bg-[#1a1a1a]">
                               {teacher.full_name}
                             </option>
                           ))}
                        </select>
                        <button 
                          onClick={() => setSelectedSlot(null)}
                          className="text-[10px] text-muted hover:text-white transition-colors uppercase font-black"
                        >
                          Cancel
                        </button>
                     </div>
                   ) : (
                     <button 
                       onClick={() => {
                         setSelectedSlot(slot.id);
                         suggestSubstitutes(slot.start_time);
                       }}
                       className="btn btn-secondary btn-xs px-4"
                     >
                        Swap Teacher
                     </button>
                   )}
                </div>
              )}
           </div>
         ))}
      </div>

      <div className="bg-secondary/5 p-4 rounded-2xl flex gap-3 relative z-10 border border-secondary/10">
         <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
         <p className="text-[10px] text-muted leading-relaxed">
            <strong>Real-Time Sync:</strong> Changes made here are instantly pushed to Student Kiosks and Teacher Dashboards via the Supabase Realtime channel.
         </p>
      </div>

      <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/5 rounded-full blur-3xl -mr-24 -mt-24 group-hover:scale-150 transition-transform"></div>
    </div>
  );
}
