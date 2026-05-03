"use client";

import { useState, useRef } from 'react';
import { Camera, RefreshCcw, Check, X, Loader2 } from 'lucide-react';

export default function WorksheetScanner({ onScanComplete }: { onScanComplete: (image: string) => void }) {
  const [isActive, setIsActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setIsActive(true);
    setCapturedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera Error:", err);
      setIsActive(false);
    }
  };

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      
      const image = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(image);
      
      // Stop stream
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleConfirm = async () => {
    if (!capturedImage) return;
    setIsProcessing(true);
    // In a real scenario, we'd upload to Supabase Storage first
    onScanComplete(capturedImage);
    setIsProcessing(false);
    setIsActive(false);
  };

  if (!isActive) {
    return (
      <button 
        onClick={startCamera}
        className="w-full aspect-[4/3] bg-white/5 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:bg-white/10 hover:border-primary/50 transition-all group"
      >
        <div className="bg-primary/20 p-6 rounded-full group-hover:scale-110 transition-transform">
          <Camera className="w-10 h-10 text-primary" />
        </div>
        <div className="text-center">
          <p className="font-bold text-white text-lg">Scan Physical Worksheet</p>
          <p className="text-sm text-muted">Use the Class Station camera to capture paper work.</p>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      {/* Viewport */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {capturedImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={capturedImage} className="max-w-full max-h-full object-contain" alt="Captured Worksheet" />
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="max-w-full max-h-full object-contain mirror-x"
          />
        )}
        
        {/* Alignment Overlay */}
        {!capturedImage && (
          <div className="absolute inset-0 flex items-center justify-center p-12 pointer-events-none">
             <div className="w-full h-full border-2 border-white/20 rounded-3xl border-dashed relative">
                <div className="absolute top-4 left-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Align Worksheet within Frame</div>
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl"></div>
             </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="h-40 bg-[#0a0a0a] border-t border-white/10 flex items-center justify-center gap-12 px-8">
        {capturedImage ? (
          <>
            <button 
              onClick={() => { setCapturedImage(null); startCamera(); }}
              className="p-6 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all active:scale-90"
            >
              <RefreshCcw className="w-8 h-8" />
            </button>
            <button 
              onClick={handleConfirm}
              disabled={isProcessing}
              className="px-12 py-6 bg-primary text-white rounded-3xl font-black text-xl flex items-center gap-4 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-8 h-8" />}
              {isProcessing ? 'Processing OCR...' : 'Use This Capture'}
            </button>
            <button 
              onClick={() => setIsActive(false)}
              className="p-6 bg-danger/10 hover:bg-danger/20 rounded-full text-danger transition-all active:scale-90"
            >
              <X className="w-8 h-8" />
            </button>
          </>
        ) : (
          <>
            <div className="flex-1"></div>
            <button 
              onClick={capture}
              className="w-24 h-24 bg-white border-8 border-white/20 rounded-full hover:scale-110 active:scale-90 transition-all shadow-2xl flex items-center justify-center"
            >
              <div className="w-16 h-16 border-4 border-black rounded-full"></div>
            </button>
            <button 
              onClick={() => setIsActive(false)}
              className="flex-1 flex justify-end p-6 text-muted hover:text-white"
            >
              <X className="w-8 h-8" />
            </button>
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
