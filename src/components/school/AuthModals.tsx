"use client";

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Fingerprint, Loader2, X, Camera } from 'lucide-react';

// --- QR LOGIN MODAL ---
export function QRLoginModal({ deviceId, onClose, locked = false }: { deviceId: string, onClose: () => void, locked?: boolean }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/local/qr/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-eduos': 'true',
          },
          body: JSON.stringify({ deviceId })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to create QR session.');
        setToken(JSON.stringify(data.qrPayload));
      } catch (err) {
        console.error(err);
        setToken('');
      }
      finally { setIsLoading(false); }
    };
    fetchToken();
  }, [deviceId]);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-card border border-primary/20 rounded-2xl p-8 max-w-sm w-full relative shadow-2xl animate-in zoom-in-95 duration-300">
        {!locked && (
          <button onClick={onClose} className="absolute right-4 top-4 text-muted hover:text-white"><X className="w-5 h-5" /></button>
        )}
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="bg-primary/10 p-4 rounded-full"><Fingerprint className="w-10 h-10 text-primary" /></div>
          <div>
            <h2 className="text-xl font-bold mb-2">Student Hub QR</h2>
            <p className="text-xs text-muted">Ask your teacher to scan this code from the Class Station to authorize your session.</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-inner shadow-black/20">
            {isLoading ? <Loader2 className="w-40 h-40 animate-spin text-primary" /> : <QRCodeSVG value={token || ''} size={locked ? 220 : 160} level="H" />}
          </div>
          <div className="text-[10px] font-mono text-muted uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">Device ID: {deviceId.substring(0, 16)}...</div>
        </div>
      </div>
    </div>
  );
}

// --- QR SCANNER MODAL ---
export function QRScannerModal({ onClose }: { deviceId: string, onLoginSuccess: (code: string) => void, onClose: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);

  const simulateScan = () => {
    setTimeout(() => {
      setScanning(false);
      setError('Gate scan requires a live station QR. Use password login until camera scanning is connected.');
    }, 2000);
  };

  useEffect(() => { simulateScan(); }, []);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-card border border-primary/20 rounded-2xl p-8 max-w-sm w-full relative shadow-2xl text-center">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted hover:text-white"><X className="w-5 h-5" /></button>
        <Camera className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Scanning Gate...</h2>
        <p className="text-sm text-muted mb-6">Point your camera at the teacher&apos;s gate screen.</p>
        <div className="relative aspect-video bg-black rounded-lg border border-primary/40 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 border-2 border-primary/20 animate-pulse" />
          <div className="w-full h-0.5 bg-primary absolute top-1/2 animate-scan" />
          <span className="text-[10px] text-primary/50 font-mono">CAMERA_READY: RV1106_ISP</span>
        </div>
        {scanning && <p className="text-primary text-xs mt-4">Waiting for a valid station QR...</p>}
        {error && <p className="text-danger text-xs mt-4">{error}</p>}
      </div>
    </div>
  );
}
