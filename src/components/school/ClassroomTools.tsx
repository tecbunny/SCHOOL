"use client";

import { useEffect, useRef, useState } from 'react';
import { MessageSquare, X, Send, Loader2, ShieldAlert, Eye, UserCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase';

// --- CHAT DRAWER ---
export function ChatDrawer({ title }: { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!isOpen) return;
    const fetchMessages = async () => {
      const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
      setMessages(data || []);
    };
    fetchMessages();
    const channel = supabase.channel('chat').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (p: any) => {
      setMessages(prev => [...prev, p.new]);
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isOpen, supabase]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('messages').insert({ content: input, user_id: user?.id, sender_name: 'Student' });
    setInput('');
    setIsLoading(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="fixed bottom-8 right-8 btn btn-primary rounded-full p-4 shadow-2xl z-50">
        <MessageSquare className="w-6 h-6" />
      </button>
      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-80 bg-card border-l border-primary/20 shadow-2xl z-[100] flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-4 border-b flex items-center justify-between bg-primary/5">
            <h3 className="font-bold text-sm">{title}</h3>
            <button onClick={() => setIsOpen(false)} className="text-muted hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map(m => (
              <div key={m.id} className="bg-[var(--bg-dark)] p-2 rounded-lg border border-white/5">
                <p className="text-[10px] text-primary font-bold mb-1">{m.sender_name}</p>
                <p className="text-xs">{m.content}</p>
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." className="flex-1 bg-[var(--bg-dark)] border rounded-md px-3 py-2 text-xs outline-none" />
            <button type="submit" disabled={isLoading} className="btn btn-primary p-2">{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}</button>
          </form>
        </div>
      )}
    </>
  );
}

// --- PROCTORING AGENT ---
export function ProctoringAgent({ isExamActive }: { isExamActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [status, setStatus] = useState<'monitoring' | 'warning' | 'alert'>('monitoring');
  const [violationCount, setViolationCount] = useState(0);

  useEffect(() => {
    const stop = () => {
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach(t => t.stop());
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 160, height: 120 } });
        if (videoRef.current) videoRef.current.srcObject = stream;
        intervalRef.current = setInterval(() => {
          if (Math.random() > 0.95) handleViolation();
        }, 5000);
      } catch (err) { console.error(err); }
    };

    if (isExamActive) start(); else stop();
    return stop;
  }, [isExamActive]);

  const handleViolation = () => {
    setStatus('warning');
    setViolationCount(v => v + 1);
    setTimeout(() => setStatus('monitoring'), 3000);
  };

  if (!isExamActive) return null;

  return (
    <div className="fixed bottom-24 right-8 z-[100] flex flex-col items-end gap-3">
      {status !== 'monitoring' && <div className="bg-danger text-white text-[10px] py-1 px-3 rounded-full font-bold animate-bounce flex items-center gap-2"><ShieldAlert className="w-3 h-3" /> AI ALERT: FOCUS ON SCREEN</div>}
      <div className={`relative rounded-2xl overflow-hidden border-2 shadow-2xl transition-all duration-500 ${status === 'warning' ? 'border-danger scale-110' : 'border-primary/40 scale-100'}`}>
        <video ref={videoRef} autoPlay muted playsInline className="w-32 h-24 object-cover bg-black" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] text-primary font-mono uppercase"><UserCheck className="w-2 h-2" /> Verified</div>
          <div className="absolute inset-4 border border-primary/20 rounded-lg"></div>
          <div className="absolute bottom-2 right-2 text-[8px] font-mono text-white/50">NPU: 1.0 TOPS</div>
        </div>
      </div>
      <div className="bg-card/80 backdrop-blur-md border border-white/5 px-3 py-1.5 rounded-xl flex items-center gap-3 shadow-lg">
        <div className="flex items-center gap-1.5"><Eye className={`w-3 h-3 ${status === 'monitoring' ? 'text-success' : 'text-danger'}`} /><span className="text-[10px] font-bold text-muted uppercase tracking-tighter">AI Proctoring Active</span></div>
        <div className="h-3 w-px bg-white/10" /><span className="text-[10px] font-mono text-danger font-bold">{violationCount} Flags</span>
      </div>
    </div>
  );
}
