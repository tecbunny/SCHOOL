"use client";

import { ShieldCheck, User, QrCode, Smartphone, MapPin } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function DigitalIDCard({ user }: { user: any }) {
  return (
    <div className="glass-panel w-full max-w-sm overflow-hidden relative group">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-white" />
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">EduOS Secure ID</span>
        </div>
        <div className="text-[10px] text-white/70 font-mono">v1.0.0</div>
      </div>

      <div className="p-6 flex flex-col items-center text-center">
        {/* Photo Placeholder */}
        <div className="w-24 h-24 rounded-2xl bg-[var(--bg-dark)] border-2 border-primary/20 flex items-center justify-center mb-4 relative overflow-hidden">
          <User className="w-12 h-12 text-muted" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
        </div>

        <h3 className="text-xl font-bold text-white mb-1">{user?.full_name || 'Arjun Sharma'}</h3>
        <p className="text-xs text-primary font-bold uppercase tracking-wider mb-4">{user?.role || 'STUDENT'} • CLASS 10-A</p>

        {/* Info Grid */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-left">
            <p className="text-[8px] text-muted uppercase mb-1 flex items-center gap-1"><QrCode className="w-2 h-2" /> ID Code</p>
            <p className="text-xs font-mono font-bold">{user?.user_code || '78782609341'}</p>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-left">
            <p className="text-[8px] text-muted uppercase mb-1 flex items-center gap-1"><Smartphone className="w-2 h-2" /> Device ID</p>
            <p className="text-xs font-mono font-bold truncate">SSPH-01-HUB</p>
          </div>
        </div>

        {/* Secure Handshake QR */}
        <div className="bg-white p-2 rounded-xl mb-4">
           <QRCodeSVG value={`SSPH_ID:${user?.id}`} size={80} />
        </div>
        <p className="text-[9px] text-muted">Scan at School Station for verification</p>
      </div>

      {/* Footer Info */}
      <div className="bg-white/5 p-3 border-t border-white/5 flex items-center justify-center gap-4">
         <div className="flex items-center gap-1 text-[9px] text-muted">
            <MapPin className="w-3 h-3" /> GOA CENTRAL SCHOOL
         </div>
      </div>
    </div>
  );
}
