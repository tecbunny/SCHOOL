"use client";

import { Award, HeartHandshake, MessageSquareText, Star, UsersRound, PlusCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

const fallbackReviewAreas = [
  { label: 'Collaboration', score: 92, feedback: 'Works steadily in group tasks and helps classmates resolve blockers.' },
  { label: 'Communication', score: 86, feedback: 'Explains ideas clearly during project discussions and lab work.' },
  { label: 'Leadership', score: 78, feedback: 'Can take more initiative during team planning and role assignment.' },
];

const fallbackPeerNotes = [
  'Helped the science group finish the observation table before submission.',
  'Shared notes after the Math revision class.',
  'Presented the English activity with calm confidence.',
];

export default function StudentPeerReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [showSubmitReview, setShowSubmitReview] = useState(false);
  const [newReview, setNewReview] = useState({ submissionId: '', score: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        // Fetch reviews made on this student's submissions
        const { data } = await supabase
          .from('peer_reviews')
          .select(`
            id, score, comment, created_at,
            submissions (
              student_id
            )
          `)
          .order('created_at', { ascending: false });
        
        // Due to RLS, 'data' only contains reviews this student can see 
        // (RLS says: Students view reviews of own submissions)
        if (data) {
          setReviews(data);
        }
      } catch (err) {
        console.error("Fetch peer reviews error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleSubmitReview = async () => {
    if (!newReview.submissionId || !newReview.comment) return;
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from('peer_reviews').insert({
        submission_id: newReview.submissionId,
        reviewer_id: user.id,
        score: newReview.score,
        comment: newReview.comment
      });

      if (error) throw error;
      alert("Peer review submitted!");
      setShowSubmitReview(false);
      setNewReview({ submissionId: '', score: 5, comment: '' });
    } catch (err: any) {
      console.error(err);
      alert("Failed to submit review: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const peerNotes = reviews.length > 0 
    ? reviews.filter(r => r.comment).map(r => r.comment)
    : fallbackPeerNotes;

  const averageScore = reviews.length > 0
    ? (reviews.reduce((a, b) => a + b.score, 0) / reviews.length) * 10
    : 85; // mock average

  return (
    <section className="min-h-screen bg-[#050505] text-white p-10">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
        <header className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 text-secondary font-black uppercase tracking-widest text-xs mb-3">
              <UsersRound className="w-5 h-5" />
              Peer reviews
            </div>
            <h1 className="text-4xl font-black">360-degree classroom feedback</h1>
            <p className="text-muted mt-2">Peer input for socio-emotional and collaborative growth areas.</p>
          </div>
          <button 
            className="btn btn-secondary gap-2"
            onClick={() => setShowSubmitReview(!showSubmitReview)}
          >
            <PlusCircle className="w-4 h-4" /> Give Peer Feedback
          </button>
        </header>

        {showSubmitReview && (
          <div className="bg-card border border-secondary/20 rounded-3xl p-8 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-bold">Submit a Peer Review</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-muted">Submission ID</label>
                <input 
                  type="text" 
                  value={newReview.submissionId}
                  onChange={e => setNewReview({...newReview, submissionId: e.target.value})}
                  placeholder="Paste submission UUID here"
                  className="bg-[var(--bg-dark)] border border-white/10 rounded-md px-3 py-2 text-white outline-none w-full"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-muted">Score (0-10)</label>
                <input 
                  type="number" 
                  min="0" max="10"
                  value={newReview.score}
                  onChange={e => setNewReview({...newReview, score: parseInt(e.target.value)})}
                  className="bg-[var(--bg-dark)] border border-white/10 rounded-md px-3 py-2 text-white outline-none w-full"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted">Constructive Comment</label>
              <textarea 
                value={newReview.comment}
                onChange={e => setNewReview({...newReview, comment: e.target.value})}
                placeholder="What did they do well? What can improve?"
                className="bg-[var(--bg-dark)] border border-white/10 rounded-md px-3 py-2 text-white outline-none w-full min-h-[80px]"
              />
            </div>
            <button 
              className="btn btn-primary self-start disabled:opacity-50"
              onClick={handleSubmitReview}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Review'}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {fallbackReviewAreas.map((area, idx) => (
            <article key={area.label} className="bg-card border border-white/10 rounded-3xl p-7">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <span className="text-3xl font-black">
                  {idx === 0 && reviews.length > 0 ? Math.round(averageScore) : area.score}%
                </span>
              </div>
              <h2 className="text-xl font-black">{area.label}</h2>
              <p className="text-sm text-muted leading-relaxed mt-3">{area.feedback}</p>
              <div className="w-full h-2 bg-white/5 rounded-full mt-6 overflow-hidden">
                <div className="h-full bg-secondary rounded-full" style={{ width: `${idx === 0 && reviews.length > 0 ? averageScore : area.score}%` }} />
              </div>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-card border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquareText className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-black">Recent peer notes</h2>
            </div>
            <div className="flex flex-col gap-4">
              {loading ? (
                <div className="text-muted text-sm">Loading reviews...</div>
              ) : peerNotes.map((note, idx) => (
                <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-muted">
                  {note}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-gradient-to-br from-warning/10 to-primary/10 border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-6 h-6 text-warning" />
              <h2 className="text-xl font-black">Recognition</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-warning/20 text-warning flex items-center justify-center">
                <Star className="w-8 h-8" />
              </div>
              <div>
                <div className="font-black text-lg">Critical Thinking</div>
                <p className="text-sm text-muted">Awarded from peer review council inputs for this month.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
