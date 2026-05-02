"use client";

import { Award, HeartHandshake, MessageSquareText, Star, UsersRound } from 'lucide-react';

const reviewAreas = [
  { label: 'Collaboration', score: 92, feedback: 'Works steadily in group tasks and helps classmates resolve blockers.' },
  { label: 'Communication', score: 86, feedback: 'Explains ideas clearly during project discussions and lab work.' },
  { label: 'Leadership', score: 78, feedback: 'Can take more initiative during team planning and role assignment.' },
];

const peerNotes = [
  'Helped the science group finish the observation table before submission.',
  'Shared notes after the Math revision class.',
  'Presented the English activity with calm confidence.',
];

export default function StudentPeerReviewsPage() {
  return (
    <section className="min-h-screen bg-[#050505] text-white p-10">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
        <header>
          <div className="flex items-center gap-3 text-secondary font-black uppercase tracking-widest text-xs mb-3">
            <UsersRound className="w-5 h-5" />
            Peer reviews
          </div>
          <h1 className="text-4xl font-black">360-degree classroom feedback</h1>
          <p className="text-muted mt-2">Peer input for socio-emotional and collaborative growth areas.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {reviewAreas.map((area) => (
            <article key={area.label} className="bg-card border border-white/10 rounded-3xl p-7">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <span className="text-3xl font-black">{area.score}%</span>
              </div>
              <h2 className="text-xl font-black">{area.label}</h2>
              <p className="text-sm text-muted leading-relaxed mt-3">{area.feedback}</p>
              <div className="w-full h-2 bg-white/5 rounded-full mt-6 overflow-hidden">
                <div className="h-full bg-secondary rounded-full" style={{ width: `${area.score}%` }} />
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
              {peerNotes.map((note) => (
                <div key={note} className="bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-muted">
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
