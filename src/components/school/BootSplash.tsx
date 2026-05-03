"use client";

import { useEffect, useState } from 'react';
import { ShieldCheck, Cpu, Wifi } from 'lucide-react';
import BrandIcon from '@/components/BrandIcon';

const bootLogs = [
  "Initializing EduOS Kernel 1.0.0-SSPH01...",
  "Mounting /system (ext4, ro)...",
  "Loading SSPH-01 Hardware Overlays...",
  "NPU Co-processor: READY",
  "Starting Weston Compositor...",
  "Establishing Secure Handshake Bridge...",
  "Connecting to EduPortal Mesh Network...",
  "Launching Standalone Kiosk Surface..."
];

export default function BootSplash({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (stage < bootLogs.length) {
      const timer = setTimeout(() => {
        setLogs(prev => [...prev, bootLogs[stage]]);
        setStage(s => s + 1);
      }, 400 + Math.random() * 600);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, [onComplete, stage]);

  return (
    <div className="fixed inset-0 z-[99999] bg-[#000] text-white flex flex-col items-center justify-center font-mono">
      <div className="flex flex-col items-center gap-8 mb-12 animate-in fade-in zoom-in duration-700">
        <BrandIcon className="w-20 h-20" />
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-[0.2em]">EDUOS</h1>
          <p className="text-[10px] text-muted tracking-widest uppercase mt-1">Next-Gen Education Operating System</p>
        </div>
      </div>

      <div className="w-full max-w-md px-8 flex flex-col gap-2">
        {logs.map((log, i) => (
          <div key={i} className="text-[10px] flex items-center gap-2 text-success opacity-80">
            <span className="text-muted">[{new Date().toLocaleTimeString()}]</span> {log}
          </div>
        ))}
        {stage < bootLogs.length && (
          <div className="text-[10px] text-primary animate-pulse">
            _
          </div>
        )}
      </div>

      <div className="absolute bottom-12 flex gap-8 text-muted">
        <div className="flex items-center gap-2 text-[10px]">
          <ShieldCheck className="w-3 h-3 text-success" /> SECURE BOOT
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <Cpu className="w-3 h-3 text-primary" /> NPU ACTIVE
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <Wifi className="w-3 h-3 text-secondary" /> MESH READY
        </div>
      </div>
    </div>
  );
}
