"use client";

import { Book, Plus, Search, Edit2, Trash2, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { staffService } from '@/services/staff.service';

export default function SyllabusManager() {
  const [syllabus, setSyllabus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        const data = await staffService.getSyllabus();
        setSyllabus(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSyllabus();
  }, []);

  return (
    <div className="bg-card border border-white/5 rounded-2xl flex flex-col h-full">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Book className="w-5 h-5 text-secondary" />
          <h3 className="font-bold text-lg">Syllabus & Portions Manager</h3>
        </div>
        <button className="btn btn-outline btn-sm gap-2">
          <Plus className="w-3.5 h-3.5" /> Add Chapter
        </button>
      </div>

      <div className="p-4 border-b border-white/5 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input 
            type="text" 
            placeholder="Search syllabus..." 
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
                <th className="px-4 py-3 font-bold uppercase text-[10px]">Class</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px]">Subject</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px]">Chapter / Topic</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {syllabus.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-4 py-3 font-mono">Class {item.class_name}</td>
                  <td className="px-4 py-3">{item.subject}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold">{item.chapter_title}</div>
                    <div className="text-[10px] text-muted truncate max-w-[200px]">{item.description}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-muted hover:text-white">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-muted hover:text-danger">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {syllabus.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted italic">No syllabus records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
