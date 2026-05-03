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
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
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
          .from('assignments')
          .select(`
            id, title, subject, due_date,
            submissions ( status )
          `)
          .eq('school_id', profile.school_id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (data?.length) {
          setItems(data.map((assignment: any) => {
            // Check if there is a submission for this student (we rely on RLS or filtering, but since RLS lets students see their own submissions, submissions array will only contain theirs or be empty)
            const submission = assignment.submissions && assignment.submissions.length > 0 ? assignment.submissions[0] : null;
            
            return {
              id: assignment.id,
              title: assignment.title,
              subject: assignment.subject,
              dueDate: new Date(assignment.due_date).toISOString().slice(0, 10),
              status: submission ? submission.status : 'pending',
              source: 'Teacher Assignment'
            };
          }));
        }
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, []);

  const handleUploadWork = async (assignmentId: string) => {
    setUploadingFor(assignmentId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from('submissions').insert({
        assignment_id: assignmentId,
        student_id: user.id,
        content: "Student submitted work document URL",
        status: "submitted"
      });

      if (error) throw error;
      
      setItems(prev => prev.map(item => item.id === assignmentId ? { ...item, status: 'submitted' } : item));
      alert("Work submitted successfully!");
    } catch (error: any) {
      console.error('Failed to submit:', error);
      alert("Failed to submit: " + error.message);
    } finally {
      setUploadingFor(null);
    }
  };

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
              {item.status === 'pending' ? (
                <button 
                  onClick={() => handleUploadWork(item.id)}
                  disabled={uploadingFor === item.id}
                  className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {uploadingFor === item.id ? 'Uploading...' : 'Upload Work'}
                </button>
              ) : (
                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                  item.status === 'graded' ? 'bg-success/10 text-success' : 'bg-secondary/10 text-secondary'
                }`}>
                  {item.status}
                </span>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
