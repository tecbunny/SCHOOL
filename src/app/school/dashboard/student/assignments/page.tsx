"use client";

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, ClipboardList, Clock, FileText, Search, UploadCloud } from 'lucide-react';
import { createClient } from '@/lib/supabase';

type AssignmentItem = {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  source: string;
};

const fallbackAssignments: AssignmentItem[] = [
  { id: 'math-weekly-01', title: 'Quadratic Equations Practice', subject: 'Math', dueDate: '2026-05-06', status: 'pending', source: 'Teacher Desk' },
  { id: 'science-lab-01', title: 'Physics Lab Observation Sheet', subject: 'Physics', dueDate: '2026-05-08', status: 'submitted', source: 'Class Station' },
  { id: 'english-reflection-01', title: 'Reading Reflection Journal', subject: 'English', dueDate: '2026-05-10', status: 'graded', source: 'HPC Rubric' },
];

export default function StudentAssignmentsPage() {
  const [items, setItems] = useState<AssignmentItem[]>(fallbackAssignments);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('school_id')
          .eq('id', user.id)
          .single();

        if (!profile?.school_id) return;

        const { data } = await supabase
          .from('exam_papers')
          .select('id, title, subject, created_at')
          .eq('school_id', profile.school_id)
          .order('created_at', { ascending: false })
          .limit(6);

        if (data?.length) {
          setItems(data.map((paper: any) => ({
            id: paper.id,
            title: paper.title,
            subject: paper.subject,
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            status: 'pending',
            source: 'Teacher Paper'
          })));
        }
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, []);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) =>
      `${item.title} ${item.subject} ${item.status}`.toLowerCase().includes(normalized)
    );
  }, [items, query]);

  const counts = {
    pending: items.filter((item) => item.status === 'pending').length,
    submitted: items.filter((item) => item.status === 'submitted').length,
    graded: items.filter((item) => item.status === 'graded').length,
  };

  return (
    <section className="min-h-screen bg-[#050505] text-white p-10">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-xs mb-3">
              <ClipboardList className="w-5 h-5" />
              Assignments
            </div>
            <h1 className="text-4xl font-black">Submission board</h1>
            <p className="text-muted mt-2">Track homework, worksheets, live-test followups, and graded tasks.</p>
          </div>
          <button className="btn btn-primary gap-2 px-6 py-3 rounded-2xl">
            <UploadCloud className="w-5 h-5" />
            Upload work
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { label: 'Pending', value: counts.pending, icon: AlertCircle, color: 'text-warning' },
            { label: 'Submitted', value: counts.submitted, icon: Clock, color: 'text-secondary' },
            { label: 'Graded', value: counts.graded, icon: CheckCircle2, color: 'text-success' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-white/10 rounded-3xl p-6">
              <stat.icon className={`w-7 h-7 ${stat.color} mb-5`} />
              <div className="text-3xl font-black">{stat.value}</div>
              <div className="text-xs text-muted font-black uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search assignments by subject, title, or status..."
            className="w-full bg-white/5 border border-white/10 rounded-3xl pl-14 pr-6 py-4 outline-none focus:border-primary transition-all"
          />
        </div>

        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="bg-card border border-white/10 rounded-3xl p-8 text-muted">Loading assignments...</div>
          ) : filteredItems.map((item) => (
            <article key={item.id} className="bg-card border border-white/10 rounded-3xl p-6 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <FileText className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-black truncate">{item.title}</h2>
                <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">
                  {item.subject} / Due {item.dueDate} / {item.source}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                item.status === 'graded' ? 'bg-success/10 text-success' :
                item.status === 'submitted' ? 'bg-secondary/10 text-secondary' :
                'bg-warning/10 text-warning'
              }`}>
                {item.status}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
