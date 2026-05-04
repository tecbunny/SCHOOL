"use client";

import { Clock, CheckCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { staffService } from '@/services/staff.service';

export default function AttendanceConfig() {
  const [mode, setMode] = useState<'morning' | 'subject'>('morning');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchMode = async () => {
      try {
        const currentMode = await staffService.getAttendanceMode();
        setMode(currentMode as any);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMode();
  }, []);

  const handleToggle = async (newMode: 'morning' | 'subject') => {
    setSaving(true);
    try {
      await staffService.updateAttendanceMode(newMode);
      setMode(newMode);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-card border border-white/5 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg">Attendance Mode</h3>
        </div>
        {(loading || saving) && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => handleToggle('morning')}
          disabled={loading || saving}
          className={`flex flex-col gap-3 p-4 rounded-2xl border transition-all text-left ${mode === 'morning' ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
        >
          <div className="flex justify-between items-center">
            <span className="font-bold">Mode A</span>
            {mode === 'morning' && <CheckCircle className="w-4 h-4 text-primary" />}
          </div>
          <div>
            <div className="text-sm font-semibold">Morning Roll Call</div>
            <p className="text-[10px] text-muted leading-relaxed mt-1">Single attendance taken once a day by Class Teacher.</p>
          </div>
        </button>

        <button 
          onClick={() => handleToggle('subject')}
          disabled={loading || saving}
          className={`flex flex-col gap-3 p-4 rounded-2xl border transition-all text-left ${mode === 'subject' ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
        >
          <div className="flex justify-between items-center">
            <span className="font-bold">Mode B</span>
            {mode === 'subject' && <CheckCircle className="w-4 h-4 text-primary" />}
          </div>
          <div>
            <div className="text-sm font-semibold">Subject-wise Tracking</div>
            <p className="text-[10px] text-muted leading-relaxed mt-1">Attendance taken for every subject/period by the teacher.</p>
          </div>
        </button>
      </div>

      <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">!</div>
        <p className="text-[10px] text-primary leading-relaxed">
          <strong>Security Warning:</strong> Changing attendance mode will update the interface for all teachers immediately. Ensure all active sessions are closed before switching.
        </p>
      </div>
    </div>
  );
}
