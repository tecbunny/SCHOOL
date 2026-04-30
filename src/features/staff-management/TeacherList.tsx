"use client";

import { Users, GraduationCap, Search, MoreVertical, Loader2, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { staffService } from '@/services/staff.service';
import AddStaffModal from './AddStaffModal';

export default function TeacherList() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const data = await staffService.getTeachers();
      setTeachers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  return (
    <div className="bg-card border border-white/5 rounded-2xl flex flex-col h-full relative">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-secondary" />
          <h3 className="font-bold text-lg text-white">Staff Directory & CPD Tracker</h3>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary btn-sm gap-2"
        >
          <UserPlus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {isAddModalOpen && (
        <AddStaffModal 
          onClose={() => {
            setIsAddModalOpen(false);
            fetchTeachers(); // Refresh list after adding
          }} 
        />
      )}

      <div className="p-4 border-b border-white/5 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input 
            type="text" 
            placeholder="Search teachers..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-muted border-b border-white/5">
                <th className="px-4 py-3 font-bold uppercase text-[10px]">Teacher</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px]">Subjects</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px]">CPD Progress (50h)</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px] text-right"></th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {teacher.full_name?.charAt(0) || 'T'}
                      </div>
                      <div>
                        <div className="font-bold">{teacher.full_name}</div>
                        <div className="text-[10px] text-muted">{teacher.teacher_details?.department || 'Faculty'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(teacher.teacher_details?.subjects || ['General']).map((sub: string) => (
                        <span key={sub} className="text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/5">{sub}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[10px]">
                        <span>{teacher.teacher_details?.cpd_hours || 0}h completed</span>
                        <span className="text-muted">{Math.round(((teacher.teacher_details?.cpd_hours || 0) / 50) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-1000"
                          style={{ width: `${Math.min(100, ((teacher.teacher_details?.cpd_hours || 0) / 50) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-muted">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
