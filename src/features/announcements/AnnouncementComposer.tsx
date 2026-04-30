"use client";

import { Megaphone, Send, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { staffService } from '@/services/staff.service';

export default function AnnouncementComposer() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    priority: 'Normal',
    audience: 'All'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await staffService.postAnnouncement(form);
      setForm({ title: '', content: '', priority: 'Normal', audience: 'All' });
      // Optionally trigger feed refresh
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-white/5 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Megaphone className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg">Broadcast Announcement</h3>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-muted uppercase">Headline</label>
          <input 
            type="text" 
            required
            value={form.title}
            onChange={(e) => setForm({...form, title: e.target.value})}
            placeholder="e.g. Annual Sports Day Postponed" 
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors text-white" 
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-muted uppercase">Message Content</label>
          <textarea 
            required
            value={form.content}
            onChange={(e) => setForm({...form, content: e.target.value})}
            placeholder="Enter detailed announcement message..." 
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-white min-h-[120px] resize-none" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted uppercase">Priority Level</label>
            <select 
              value={form.priority}
              onChange={(e) => setForm({...form, priority: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors text-white"
            >
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent / High Priority</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted uppercase">Target Audience</label>
            <select 
              value={form.audience}
              onChange={(e) => setForm({...form, audience: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors text-white"
            >
              <option value="All">Everyone</option>
              <option value="Teachers">Teachers Only</option>
              <option value="Students">Students Only</option>
            </select>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full mt-2 gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {loading ? 'Publishing...' : 'Post Announcement'}
        </button>
      </form>
    </div>
  );
}
