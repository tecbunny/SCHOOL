"use client";

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, X, ShieldCheck, Loader2 } from 'lucide-react';

export default function QRScannerModal({ deviceId, onLoginSuccess, onClose }: { 
  deviceId: string, 
  onLoginSuccess: (userCode: string) => void,
  onClose: () => void 
}) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);

    async function onScanSuccess(decodedText: string) {
      try {
        scanner.clear();
        setIsVerifying(true);
        const { t: token } = JSON.parse(decodedText);

        const res = await fetch('/api/auth/gate/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, deviceId })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        onLoginSuccess(data.userCode);
      } catch (err: any) {
        setError(err.message || "Handshake failed");
        setIsVerifying(false);
      }
    }

    function onScanFailure(error: any) {
      // Quiet failure for constant scanning
    }

    return () => {
      scanner.clear();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="glass-panel w-full max-w-sm p-8 relative flex flex-col items-center text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-white">
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6 p-4 bg-primary/10 rounded-full border border-primary/20">
          <Camera className="w-8 h-8 text-primary" />
        </div>

        <h3 className="text-2xl font-bold mb-2">Gate Handshake</h3>
        <p className="text-sm text-muted mb-8">Scan the QR code on the School Station to login.</p>

        <div id="qr-reader" className="w-full overflow-hidden rounded-2xl border-2 border-white/10 bg-black/40 mb-6"></div>

        {isVerifying && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-semibold animate-pulse">Verifying 2FA Handshake...</p>
          </div>
        )}

        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger text-xs p-3 rounded-xl flex items-center gap-2">
             <ShieldCheck className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-white/5 w-full">
          <p className="text-[10px] text-muted uppercase tracking-widest font-bold">Protocol</p>
          <p className="text-[10px] text-primary">SSPH-01 SECURE IDENTITY GATE v2.0</p>
        </div>
      </div>
    </div>
  );
}
