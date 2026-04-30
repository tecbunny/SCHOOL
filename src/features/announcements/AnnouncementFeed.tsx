"use client";

import { Megaphone, Clock, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { staffService } from '@/services/staff.service';

export default function AnnouncementFeed() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await staffService.getAnnouncements();
        setAnnouncements(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        announcements.map((ann) => (
          <div 
            key={ann.id} 
            className={`p-5 rounded-2xl border transition-all ${ann.priority === 'Urgent' ? 'bg-danger/5 border-danger/20' : 'bg-card border-white/5 hover:border-white/10'}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${ann.priority === 'Urgent' ? 'bg-danger/20 text-danger' : 'bg-primary/20 text-primary'}`}>
                  {ann.priority === 'Urgent' ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{ann.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(ann.created_at).toLocaleDateString()}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${ann.audience === 'All' ? 'bg-white/5 border-white/10 text-muted' : 'bg-secondary/10 border-secondary/20 text-secondary'}`}>
                      {ann.audience}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted leading-relaxed whitespace-pre-wrap">{ann.content}</p>
          </div>
        ))
      )}
      {announcements.length === 0 && !loading && (
        <div className="p-10 text-center text-muted italic text-sm">No recent announcements.</div>
      )}
    </div>
  );
}
