"use client";

import { useEffect, useRef, useState } from 'react';
import { Camera, ShieldAlert, Eye, UserCheck } from 'lucide-react';

export default function ProctoringAgent({ isExamActive }: { isExamActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'monitoring' | 'warning' | 'alert'>('monitoring');
  const [violationCount, setViolationCount] = useState(0);

  useEffect(() => {
    if (isExamActive) {
      startProctoring();
    } else {
      stopProctoring();
    }

    return () => stopProctoring();
  }, [isExamActive]);

  const startProctoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 160, height: 120 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Simulate NPU-based head position monitoring
      const interval = setInterval(() => {
        // Logic would normally call an RKNN model here
        const mockViolation = Math.random() > 0.95; // 5% chance of simulated violation
        if (mockViolation) {
          handleViolation("Looking away from screen detected.");
        }
      }, 5000);

      (videoRef as any)._interval = interval;
    } catch (err) {
      console.error("Proctoring camera access denied", err);
    }
  };

  const stopProctoring = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    if ((videoRef as any)._interval) clearInterval((videoRef as any)._interval);
  };

  const handleViolation = (reason: string) => {
    setStatus('warning');
    setViolationCount(prev => prev + 1);
    console.warn("AI PROCTORING ALERT:", reason);
    
    // Auto-clear warning after 3s
    setTimeout(() => setStatus('monitoring'), 3000);
  };

  if (!isExamActive) return null;

  return (
    <div className="fixed bottom-24 right-8 z-[100] flex flex-col items-end gap-3">
      {status !== 'monitoring' && (
        <div className="bg-danger text-white text-[10px] py-1 px-3 rounded-full font-bold animate-bounce flex items-center gap-2">
          <ShieldAlert className="w-3 h-3" /> AI ALERT: PLEASE FOCUS ON THE SCREEN
        </div>
      )}

      <div className={`relative rounded-2xl overflow-hidden border-2 shadow-2xl transition-all duration-500 ${
        status === 'warning' ? 'border-danger scale-110' : 'border-primary/40 scale-100'
      }`}>
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          className="w-32 h-24 object-cover bg-black"
        />
        
        {/* NPU Overlay simulation */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] text-primary font-mono uppercase">
            <UserCheck className="w-2 h-2" /> Verified
          </div>
          <div className="absolute inset-4 border border-primary/20 rounded-lg"></div>
          <div className="absolute bottom-2 right-2 text-[8px] font-mono text-white/50">NPU: 1.0 TOPS</div>
        </div>
      </div>

      <div className="bg-card/80 backdrop-blur-md border border-white/5 px-3 py-1.5 rounded-xl flex items-center gap-3 shadow-lg">
        <div className="flex items-center gap-1.5">
          <Eye className={`w-3 h-3 ${status === 'monitoring' ? 'text-success' : 'text-danger'}`} />
          <span className="text-[10px] font-bold text-muted uppercase tracking-tighter">AI Proctoring Active</span>
        </div>
        <div className="h-3 w-px bg-white/10" />
        <span className="text-[10px] font-mono text-danger font-bold">{violationCount} Flags</span>
      </div>
    </div>
  );
}
