"use client";

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { createClient } from '@/lib/supabase';
import { Fingerprint, Loader2, X } from 'lucide-react';

export default function QRLoginModal({ deviceId, onClose }: { deviceId: string, onClose: () => void }) {
  const [qrPayload, setQrPayload] = useState<string>('');
  const [sessionToken, setSessionToken] = useState<string>('');
  const [status, setStatus] = useState<'generating' | 'waiting' | 'verified'>('generating');
  const supabase = createClient();

  useEffect(() => {
    generateQR();
  }, []);

  const generateQR = async () => {
    try {
      const res = await fetch('/api/auth/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId })
      });
      const data = await res.json();
      setQrPayload(data.qrPayload);
      setSessionToken(data.sessionToken);
      setStatus('waiting');
      
      // Start listening for verification
      listenForVerification(data.sessionToken);
    } catch (err) {
      console.error("QR Generation failed", err);
    }
  };

  const listenForVerification = (token: string) => {
    supabase
      .channel('qr_auth')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'qr_sessions',
        filter: `session_token=eq.${token}` 
      }, (payload: any) => {
        if (payload.new.status === 'verified') {
          setStatus('verified');
          // Handle final login logic here (e.g. refresh or redirect)
          setTimeout(() => window.location.reload(), 1500);
        }
      })
      .subscribe();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-xs p-6 relative flex flex-col items-center text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6 p-3 bg-primary/10 rounded-full">
          <Fingerprint className="w-8 h-8 text-primary" />
        </div>

        <h3 className="text-xl font-bold mb-2">SSPH-01 Handshake</h3>
        <p className="text-xs text-muted mb-8">Show this QR to your teacher for biometric verification.</p>

        <div className="bg-white p-4 rounded-2xl mb-8 shadow-2xl shadow-primary/20">
          {status === 'generating' ? (
            <div className="w-[180px] h-[180px] flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <QRCodeSVG value={qrPayload} size={180} level="H" includeMargin />
          )}
        </div>

        {status === 'waiting' && (
          <div className="flex items-center gap-2 text-primary font-semibold text-sm animate-pulse">
            <span className="w-2 h-2 bg-primary rounded-full" />
            Waiting for verification...
          </div>
        )}

        {status === 'verified' && (
          <div className="text-success font-bold text-sm flex flex-col items-center gap-2">
            <span className="text-2xl">✅</span>
            IDENTITY VERIFIED!
            <span className="text-xs text-muted font-normal">Logging you in now...</span>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-white/5 w-full">
          <p className="text-[10px] text-muted uppercase tracking-widest">Device ID</p>
          <p className="text-[10px] font-mono text-primary truncate w-full">{deviceId}</p>
        </div>
      </div>
    </div>
  );
}
