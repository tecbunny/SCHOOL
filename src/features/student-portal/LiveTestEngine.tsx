"use client";

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { isStudentHubDevice } from '@/lib/device.client';
import { 
  Zap, 
  Clock, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';

type TestQuestion = {
  id: string;
  question: string;
  options: string[];
};

type LiveTest = {
  title: string;
  subject: string;
  durationMinutes: number;
  questions: TestQuestion[];
};

export default function LiveTestEngine({ classId }: { classId: string }) {
  const [testData, setTestData] = useState<LiveTest | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isStudentHub] = useState(() => isStudentHubDevice());

  const [supabase] = useState(() => createClient());

  const handleSubmit = useCallback(async () => {
    if (!isStudentHub) return;
    setIsSubmitting(true);
    // Simulate DB Submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsFinished(true);
  }, [isStudentHub]);

  useEffect(() => {
    // 1. Subscribe to Live Test Events
    const channel = supabase.channel(`class_room_${classId}`)
      .on('broadcast', { event: 'DEPLOY_TEST' }, ({ payload }: { payload: LiveTest }) => {
        setTimeLeft(payload.durationMinutes * 60);
        setTestData(payload);
        setIsFinished(false);
        setAnswers({});
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId, supabase]);

  // Timer logic
  useEffect(() => {
    if (testData && timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && testData && !isFinished) {
      const submitTimer = setTimeout(() => {
        void handleSubmit();
      }, 0);
      return () => clearTimeout(submitTimer);
    }
  }, [timeLeft, testData, isFinished, handleSubmit]);

  if (!isStudentHub) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
        <div className="bg-warning/10 p-8 rounded-[3rem] border border-warning/20">
          <AlertCircle className="w-20 h-20 text-warning" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-3xl font-black text-white">Student Hub Device Required</h3>
          <p className="text-muted max-w-md">For safety, exams, tests, and quizzes can only be answered on the assigned Student Hub device.</p>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!testData) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 text-center animate-pulse">
        <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5">
           <Zap className="w-20 h-20 text-muted opacity-20" />
        </div>
        <div className="flex flex-col gap-2">
           <h3 className="text-2xl font-bold text-muted">Awaiting Live Test</h3>
           <p className="text-muted/50 text-sm max-w-xs">Your teacher has not deployed a test yet. Please stay on this screen to receive the broadcast.</p>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 text-center animate-in zoom-in duration-500">
        <div className="bg-success/20 p-8 rounded-[3rem] border border-success/30">
           <CheckCircle className="w-20 h-20 text-success" />
        </div>
        <div className="flex flex-col gap-2">
           <h3 className="text-3xl font-black text-white">Assessment Complete</h3>
           <p className="text-muted">Your answers have been securely synced to the Academic Vault.</p>
        </div>
        <button 
          onClick={() => setTestData(null)}
          className="mt-4 px-8 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-sm font-bold transition-all"
        >
          Return to Hub
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-bottom-8 duration-700">
      
      {/* Test Header */}
      <header className="flex items-center justify-between mb-8">
         <div className="flex items-center gap-4">
            <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20">
               <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
               <h2 className="text-2xl font-black text-white">{testData.title}</h2>
               <p className="text-xs text-muted uppercase tracking-widest font-bold">{testData.subject} • {testData.questions.length} Questions</p>
            </div>
         </div>
         
         <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl border transition-colors ${timeLeft < 60 ? 'bg-danger/20 border-danger text-danger animate-pulse' : 'bg-white/5 border-white/10 text-white'}`}>
            <Clock className="w-5 h-5" />
            <span className="text-2xl font-black font-mono">{formatTime(timeLeft)}</span>
         </div>
      </header>

      {/* Questions Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-8">
         {testData.questions.map((q, idx) => (
            <div key={idx} className="bg-card border border-white/10 rounded-[2.5rem] p-8 shadow-xl">
               <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-lg shrink-0">
                     {idx + 1}
                  </div>
                  <div className="flex-1">
                     <p className="text-xl font-bold text-white mb-8 leading-relaxed">{q.question}</p>
                     
                     <div className="grid grid-cols-2 gap-4">
                        {q.options.map((opt: string, i: number) => (
                           <button 
                              key={i}
                              onClick={() => setAnswers({...answers, [q.id]: opt})}
                              className={`p-6 rounded-3xl border text-left transition-all text-lg font-medium active:scale-95 ${answers[q.id] === opt ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-white/5 border-white/5 hover:border-white/10 text-muted'}`}
                           >
                              <span className="opacity-40 mr-3">{String.fromCharCode(65 + i)}.</span>
                              {opt}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* Submission Footer */}
      <footer className="mt-8 p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center justify-between">
         <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-muted" />
            <p className="text-sm text-muted">Do not close this app or lock the screen during the test.</p>
         </div>
         <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn btn-primary px-12 py-4 rounded-2xl text-lg gap-3"
         >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {isSubmitting ? 'Syncing Answers...' : 'Submit Final Draft'}
         </button>
      </footer>

    </div>
  );
}
